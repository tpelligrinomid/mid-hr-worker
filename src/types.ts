import { z } from "zod";

export const TallyFieldSchema = z.object({
  key: z.string(),
  label: z.string(),
  type: z.string(),
  value: z.any(),
  options: z
    .array(z.object({ id: z.string(), text: z.string() }))
    .optional(),
});

export const TallyPayloadSchema = z.object({
  eventId: z.string(),
  eventType: z.literal("FORM_RESPONSE"),
  createdAt: z.string(),
  data: z.object({
    responseId: z.string(),
    submissionId: z.string(),
    respondentId: z.string(),
    formId: z.string(),
    formName: z.string(),
    createdAt: z.string(),
    fields: z.array(TallyFieldSchema),
  }),
});

export type TallyPayload = z.infer<typeof TallyPayloadSchema>;

export interface Candidate {
  firstName: string;
  lastName: string;
  email: string;
  position: string;        // e.g. "Creative Director"
  positionSlug: string;    // e.g. "creative-director"
  whyFit: string;
  portfolioUrl: string;
  linkedinUrl: string;
  expectedSalaryUsd: number | null;
  submissionId: string;
  submittedAt: string;
}

export interface FitDecision {
  verdict: "fit" | "not_fit";
  fitScore: number;        // 1-10
  strengths: string[];
  concerns: string[];
  summary: string;
}
