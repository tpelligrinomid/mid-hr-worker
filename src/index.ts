import "dotenv/config";
import express from "express";
import { tasks } from "@trigger.dev/sdk";
import type { screenCandidate } from "../trigger/screen-candidate";
import { verifyTallySignature } from "./lib/tally";
import { TallyPayloadSchema } from "./types";

const app = express();

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "mid-hr-worker" });
});

// Raw body is required so we can verify the Tally signature before parsing JSON.
app.post(
  "/webhook/tally",
  express.raw({ type: "application/json", limit: "5mb" }),
  async (req, res) => {
    const rawBody = (req.body as Buffer).toString("utf-8");
    const signature = req.header("tally-signature");
    const secret = process.env.TALLY_SIGNING_SECRET;

    if (!secret) {
      console.error("TALLY_SIGNING_SECRET not configured");
      res.status(500).json({ error: "server not configured" });
      return;
    }

    if (!verifyTallySignature(rawBody, signature, secret)) {
      console.warn("Tally signature mismatch");
      res.status(401).json({ error: "invalid signature" });
      return;
    }

    let payload;
    try {
      payload = TallyPayloadSchema.parse(JSON.parse(rawBody));
    } catch (err) {
      console.error("Invalid Tally payload:", err);
      res.status(400).json({ error: "invalid payload" });
      return;
    }

    try {
      const handle = await tasks.trigger<typeof screenCandidate>(
        "screen-candidate",
        payload,
      );
      console.log(`Triggered screen-candidate run ${handle.id} for ${payload.data.submissionId}`);
      res.json({ ok: true, runId: handle.id });
    } catch (err) {
      console.error("Failed to trigger screen-candidate task:", err);
      res.status(500).json({ error: "trigger failed" });
    }
  },
);

app.use(express.json());

const port = parseInt(process.env.PORT || "10000", 10);
app.listen(port, () => {
  console.log(`mid-hr-worker listening on :${port}`);
});
