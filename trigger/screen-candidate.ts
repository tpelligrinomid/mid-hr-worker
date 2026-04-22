import { task, logger } from "@trigger.dev/sdk";
import { TallyPayload, Candidate } from "../src/types";
import { extractCandidate } from "../src/lib/tally";
import { loadJobDescription } from "../src/lib/jobs";
import { scrapeLinkedIn } from "../src/lib/apify";
import { fetchPortfolio } from "../src/lib/portfolio";
import { evaluateFit } from "../src/lib/claude";
import { createClickUpTask } from "../src/lib/clickup";
import { notifyGoodFit, notifyMissingJD } from "../src/lib/slack";

export const screenCandidate = task({
  id: "screen-candidate",
  maxDuration: 300,
  retry: { maxAttempts: 2 },
  run: async (payload: TallyPayload) => {
    const candidate = extractCandidate(payload);
    logger.log("Screening applicant", {
      name: `${candidate.firstName} ${candidate.lastName}`,
      position: candidate.position,
      slug: candidate.positionSlug,
      submissionId: candidate.submissionId,
    });

    // 1. Cheap pre-checks — skip Apify/Claude spend on obvious junk.
    const garbageReason = detectGarbage(candidate);
    if (garbageReason) {
      logger.warn("Rejected as garbage", { reason: garbageReason });
      return { outcome: "garbage" as const, reason: garbageReason, candidate };
    }

    // 2. JD lookup — if missing, ping Slack so the team adds one.
    const jd = loadJobDescription(candidate.positionSlug);
    if (!jd) {
      logger.warn("No JD on file", { slug: candidate.positionSlug });
      await notifyMissingJD(candidate);
      return { outcome: "no_jd" as const, role: candidate.position, candidate };
    }

    // 3. Pull LinkedIn + portfolio in parallel.
    const [linkedin, portfolio] = await Promise.all([
      scrapeLinkedIn(candidate.linkedinUrl),
      fetchPortfolio(candidate.portfolioUrl),
    ]);
    logger.log("Enrichment complete", {
      linkedin: Boolean(linkedin.fullName),
      portfolioOk: portfolio.ok,
    });

    // 4. Claude fit evaluation.
    const decision = await evaluateFit(candidate, jd, linkedin, portfolio);
    logger.log("Fit evaluation", {
      verdict: decision.verdict,
      score: decision.fitScore,
    });

    if (decision.verdict !== "fit") {
      return { outcome: "not_fit" as const, candidate, decision };
    }

    // 5. Good fit → ClickUp first (we need the URL for Slack), then Slack.
    const clickupTask = await createClickUpTask({ candidate, decision });
    await notifyGoodFit({
      candidate,
      decision,
      clickupUrl: clickupTask.url,
    });

    return {
      outcome: "fit" as const,
      candidate,
      decision,
      clickupTaskId: clickupTask.id,
      clickupUrl: clickupTask.url,
    };
  },
});

function detectGarbage(c: Candidate): string | null {
  if (!c.firstName || !c.lastName) return "missing name";
  if (!c.email.includes("@") || !c.email.includes(".")) return "invalid email";
  if (!c.position) return "no position selected";

  if (!isPlausibleUrl(c.linkedinUrl) || !c.linkedinUrl.toLowerCase().includes("linkedin.com")) {
    return `invalid LinkedIn URL: ${c.linkedinUrl}`;
  }
  if (!isPlausibleUrl(c.portfolioUrl)) {
    return `invalid portfolio URL: ${c.portfolioUrl}`;
  }

  const why = c.whyFit.trim();
  if (why.length < 30) return `low-effort "why fit" (${why.length} chars)`;
  if (/^(asdf|qwer|test|abcd|lorem|xxx|zzz)/i.test(why)) {
    return "nonsense 'why fit' answer";
  }
  if (/^(.)\1{10,}$/.test(why)) return "nonsense 'why fit' answer";

  return null;
}

function isPlausibleUrl(u: string): boolean {
  const s = u.trim();
  if (!s) return false;
  try {
    const url = new URL(s);
    const tld = url.hostname.split(".").pop() ?? "";
    return url.hostname.includes(".") && tld.length >= 2;
  } catch {
    return false;
  }
}
