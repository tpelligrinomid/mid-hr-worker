import Anthropic from "@anthropic-ai/sdk";
import { Candidate, FitDecision } from "../types";
import { LinkedInProfile, formatLinkedInForPrompt } from "./apify";
import { PortfolioSnapshot } from "./portfolio";

const MODEL = "claude-sonnet-4-6";

const AGENCY_CONTEXT = `
Marketers in Demand (MiD) is a B2B marketing agency that partners with technology and service
businesses. We run fractional CMO engagements, full-funnel campaigns, content, SEO, paid media,
and creative production. Hires at MiD are senior in their specialty, comfortable with agency
pace and multiple concurrent client accounts, client-facing, and AI-forward.
`.trim();

const SYSTEM_PROMPT = `You are a hiring screener for Marketers in Demand, a B2B marketing agency.
Given an applicant's LinkedIn profile, a snapshot of their portfolio site, their written pitch,
and a job description, decide if they should advance to a human interview.

Return STRICT JSON matching this shape:
{
  "verdict": "fit" | "not_fit",
  "fit_score": <integer 1-10>,
  "strengths": [string, ...],
  "concerns": [string, ...],
  "summary": "<2-3 sentences explaining the decision>"
}

Scoring guide:
- 8-10: strong fit, recommend interview
- 6-7: borderline, worth a closer look
- 4-5: weak fit
- 1-3: not a fit

Mark "fit" when fit_score >= 6. Otherwise "not_fit".

Be strict but fair. Weigh the profile against the role's seniority expectations. Call out title
mismatches, missing relevant experience, suspicious employment patterns, or portfolio quality
concerns explicitly. Return JSON only — no surrounding prose.`;

export async function evaluateFit(
  candidate: Candidate,
  jd: string,
  linkedin: LinkedInProfile,
  portfolio: PortfolioSnapshot,
): Promise<FitDecision> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");
  const client = new Anthropic({ apiKey });

  const userPrompt = `
<agency_context>
${AGENCY_CONTEXT}
</agency_context>

<role>
${candidate.position}
</role>

<job_description>
${jd}
</job_description>

<candidate>
Name: ${candidate.firstName} ${candidate.lastName}
Email: ${candidate.email}
Expected monthly salary (USD): ${candidate.expectedSalaryUsd ?? "not provided"}
LinkedIn URL: ${candidate.linkedinUrl}
Portfolio URL: ${candidate.portfolioUrl}

Why they say they're a great fit:
${candidate.whyFit || "(not provided)"}
</candidate>

<linkedin_profile>
${formatLinkedInForPrompt(linkedin)}
</linkedin_profile>

<portfolio_snapshot>
${
  portfolio.ok
    ? (portfolio.text || "(empty page)").slice(0, 8000)
    : `(could not fetch portfolio — ${portfolio.error ?? "status " + portfolio.status})`
}
</portfolio_snapshot>

Return the JSON verdict only.
`.trim();

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const textBlock = response.content.find((c) => c.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude returned no text");
  }

  const parsed = extractJson(textBlock.text) as {
    verdict: "fit" | "not_fit";
    fit_score: number;
    strengths?: string[];
    concerns?: string[];
    summary?: string;
  };

  return {
    verdict: parsed.verdict,
    fitScore: parsed.fit_score,
    strengths: parsed.strengths ?? [],
    concerns: parsed.concerns ?? [],
    summary: parsed.summary ?? "",
  };
}

function extractJson(s: string): unknown {
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fence ? fence[1] : s;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("No JSON object in Claude response");
  }
  return JSON.parse(body.slice(start, end + 1));
}
