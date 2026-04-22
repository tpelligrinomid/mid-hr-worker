import fs from "fs";
import path from "path";

export function loadJobDescription(slug: string): string | null {
  if (!slug) return null;
  const filePath = path.join(process.cwd(), "jobs", `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, "utf-8");
}
