import { Candidate, FitDecision } from "../types";

interface CreateTaskArgs {
  candidate: Candidate;
  decision: FitDecision;
  status?: string;
}

interface CreatedTask {
  id: string;
  url: string;
}

export async function createClickUpTask({
  candidate,
  decision,
  status = "Applied",
}: CreateTaskArgs): Promise<CreatedTask> {
  const token = process.env.CLICKUP_API_TOKEN;
  const listId = process.env.CLICKUP_LIST_ID;
  const linkedinFieldId = process.env.CLICKUP_LINKEDIN_FIELD_ID;
  if (!token || !listId) {
    throw new Error("CLICKUP_API_TOKEN and CLICKUP_LIST_ID are required");
  }

  const description = buildDescription(candidate, decision);

  const body: Record<string, unknown> = {
    name: `${candidate.firstName} ${candidate.lastName} — ${candidate.position}`,
    markdown_description: description,
    status,
  };

  if (linkedinFieldId) {
    body.custom_fields = [
      { id: linkedinFieldId, value: candidate.linkedinUrl },
    ];
  }

  const res = await fetch(
    `https://api.clickup.com/api/v2/list/${listId}/task`,
    {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ClickUp create task failed (${res.status}): ${text}`);
  }

  const task = (await res.json()) as { id: string; url: string };
  return { id: task.id, url: task.url };
}

function buildDescription(candidate: Candidate, decision: FitDecision): string {
  return [
    `**Role:** ${candidate.position}`,
    `**Email:** ${candidate.email}`,
    `**Expected salary:** ${
      candidate.expectedSalaryUsd ? `$${candidate.expectedSalaryUsd}/mo USD` : "(not provided)"
    }`,
    `**Portfolio:** ${candidate.portfolioUrl}`,
    `**LinkedIn:** ${candidate.linkedinUrl}`,
    "",
    `**Fit score:** ${decision.fitScore}/10`,
    "",
    "**Screening summary:**",
    decision.summary,
    "",
    "**Strengths:**",
    ...(decision.strengths.length ? decision.strengths.map((s) => `- ${s}`) : ["- (none listed)"]),
    "",
    "**Concerns:**",
    ...(decision.concerns.length ? decision.concerns.map((c) => `- ${c}`) : ["- (none listed)"]),
    "",
    "**Why they think they're a fit:**",
    candidate.whyFit || "(not provided)",
    "",
    `_Submission ID: ${candidate.submissionId} · ${candidate.submittedAt}_`,
  ].join("\n");
}
