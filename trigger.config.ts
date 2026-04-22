import { defineConfig } from "@trigger.dev/sdk";
import { additionalFiles } from "@trigger.dev/build/extensions/core";

export default defineConfig({
  project: "proj_eabfjimsokkvnjglnfgl",
  runtime: "node",
  logLevel: "log",
  maxDuration: 300,
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 2,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
    },
  },
  dirs: ["./trigger"],
  build: {
    // proxy-agent is lazily required by apify-client's transitive deps;
    // esbuild misses it in static analysis. Mark external so it resolves
    // from node_modules at runtime in the container.
    external: ["proxy-agent"],
    // Ship jobs/*.md markdown files alongside the task bundle so the task
    // can read them at runtime via fs.
    extensions: [additionalFiles({ files: ["jobs/**/*.md"] })],
  },
});
