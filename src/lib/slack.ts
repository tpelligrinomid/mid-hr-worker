import { Candidate, FitDecision } from "../types";

interface GoodFitArgs {
  candidate: Candidate;
  decision: FitDecision;
  clickupUrl: string;
}

export async function notifyGoodFit({
  candidate,
  decision,
  clickupUrl,
}: GoodFitArgs): Promise<void> {
  const text = `New qualified applicant: ${candidate.firstName} ${candidate.lastName} — ${candidate.position}`;

  const blocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*New qualified applicant — ${candidate.position}*\n*${candidate.firstName} ${candidate.lastName}* · <mailto:${candidate.email}|${candidate.email}>`,
      },
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Fit score:*\n${decision.fitScore}/10` },
        {
          type: "mrkdwn",
          text: `*Expected salary:*\n${
            candidate.expectedSalaryUsd ? `$${candidate.expectedSalaryUsd}/mo` : "—"
          }`,
        },
        { type: "mrkdwn", text: `*LinkedIn:*\n<${candidate.linkedinUrl}|profile>` },
        { type: "mrkdwn", text: `*Portfolio:*\n<${candidate.portfolioUrl}|link>` },
      ],
    },
    {
      type: "section",
      text: { type: "mrkdwn", text: `*Summary:* ${decision.summary}` },
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "Open in ClickUp" },
          url: clickupUrl,
        },
      ],
    },
  ];

  await postToSlack({ text, blocks, icon_emoji: ":dart:" });
}

export async function notifyMissingJD(candidate: Candidate): Promise<void> {
  const text = `Applicant for *${candidate.position}* (${candidate.firstName} ${candidate.lastName}) — no JD on file. Add \`jobs/${candidate.positionSlug}.md\` to enable screening.`;
  await postToSlack({ text, icon_emoji: ":warning:" });
}

interface SlackMessage {
  text: string;
  blocks?: unknown[];
  icon_emoji?: string;
}

async function postToSlack(message: SlackMessage): Promise<void> {
  const token = process.env.SLACK_BOT_TOKEN;
  const channel = process.env.SLACK_CHANNEL_ID;
  if (!token || !channel) {
    throw new Error("SLACK_BOT_TOKEN and SLACK_CHANNEL_ID are required");
  }

  const res = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({ channel, ...message }),
  });

  const json = (await res.json()) as { ok: boolean; error?: string };
  if (!json.ok) {
    throw new Error(`Slack chat.postMessage failed: ${json.error}`);
  }
}
