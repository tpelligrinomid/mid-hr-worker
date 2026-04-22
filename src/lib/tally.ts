import crypto from "crypto";
import { TallyPayload, Candidate } from "../types";

// Tally signs webhooks with HMAC-SHA256(secret, rawBody), base64-encoded,
// sent in the `tally-signature` header.
export function verifyTallySignature(
  rawBody: string,
  signature: string | undefined,
  secret: string,
): boolean {
  if (!signature || !secret) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("base64");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function findField(payload: TallyPayload, label: string) {
  const target = label.toLowerCase().trim();
  return payload.data.fields.find(
    (f) => f.label.toLowerCase().trim() === target,
  );
}

export function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function normalizeUrl(raw: string): string {
  const s = raw.trim();
  if (!s) return "";
  return /^https?:\/\//i.test(s) ? s : `https://${s}`;
}

export function extractCandidate(payload: TallyPayload): Candidate {
  const firstName = String(findField(payload, "First Name")?.value ?? "").trim();
  const lastName = String(findField(payload, "Last Name")?.value ?? "").trim();
  const email = String(findField(payload, "Email")?.value ?? "").trim();
  const whyFit = String(
    findField(payload, "Why are you a great fit for this position?")?.value ?? "",
  );
  const portfolioUrl = normalizeUrl(
    String(findField(payload, "Link to portfolio or relevant samples")?.value ?? ""),
  );
  const linkedinUrl = normalizeUrl(
    String(findField(payload, "LinkedIn profile")?.value ?? ""),
  );
  const salary = findField(payload, "Expected monthly salary (in USD)")?.value;

  // Dropdown field: value is [id], option text lives in the options array.
  const positionField = findField(payload, "Position");
  const selectedId = Array.isArray(positionField?.value)
    ? positionField.value[0]
    : positionField?.value;
  const positionText =
    positionField?.options?.find((o) => o.id === selectedId)?.text ?? "";

  return {
    firstName,
    lastName,
    email,
    position: positionText,
    positionSlug: slugify(positionText),
    whyFit,
    portfolioUrl,
    linkedinUrl,
    expectedSalaryUsd: typeof salary === "number" ? salary : null,
    submissionId: payload.data.submissionId,
    submittedAt: payload.data.createdAt,
  };
}
