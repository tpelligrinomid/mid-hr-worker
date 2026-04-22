import { ApifyClient } from "apify-client";

const DEFAULT_ACTOR = "dev_fusion~linkedin-profile-scraper";

export interface LinkedInProfile {
  url: string;
  fullName?: string;
  headline?: string;
  location?: string;
  about?: string;
  experiences?: Array<{
    title?: string;
    company?: string;
    duration?: string;
    description?: string;
  }>;
  education?: Array<{ school?: string; degree?: string }>;
  skills?: string[];
  raw: unknown;
}

export async function scrapeLinkedIn(url: string): Promise<LinkedInProfile> {
  const token = process.env.APIFY_TOKEN;
  if (!token) throw new Error("APIFY_TOKEN not configured");

  const actorId = process.env.APIFY_LINKEDIN_ACTOR || DEFAULT_ACTOR;
  const client = new ApifyClient({ token });

  const run = await client.actor(actorId).call({
    profileUrls: [url],
  });

  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  const profile = items[0] as Record<string, unknown> | undefined;
  if (!profile) {
    throw new Error(`Apify returned no LinkedIn profile for ${url}`);
  }

  return {
    url,
    fullName: pick(profile, "fullName", "name"),
    headline: pick(profile, "headline", "occupation"),
    location: pick(profile, "location", "geoLocationName"),
    about: pick(profile, "about", "summary"),
    experiences: (profile.experiences ?? profile.experience) as LinkedInProfile["experiences"],
    education: (profile.educations ?? profile.education) as LinkedInProfile["education"],
    skills: profile.skills as string[] | undefined,
    raw: profile,
  };
}

function pick(obj: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.trim()) return v;
  }
  return undefined;
}

export function formatLinkedInForPrompt(p: LinkedInProfile): string {
  const lines: string[] = [];
  lines.push(`Name: ${p.fullName ?? "?"}`);
  lines.push(`Headline: ${p.headline ?? "?"}`);
  if (p.location) lines.push(`Location: ${p.location}`);
  if (p.about) lines.push(`\nAbout:\n${p.about.slice(0, 2000)}`);

  if (p.experiences?.length) {
    lines.push("\nExperience:");
    for (const e of p.experiences.slice(0, 10)) {
      lines.push(
        `- ${e.title ?? "?"} @ ${e.company ?? "?"}${e.duration ? ` (${e.duration})` : ""}`,
      );
      if (e.description) {
        lines.push(`    ${e.description.slice(0, 400).replace(/\s+/g, " ")}`);
      }
    }
  }

  if (p.education?.length) {
    lines.push("\nEducation:");
    for (const e of p.education.slice(0, 5)) {
      lines.push(`- ${e.degree ?? ""} @ ${e.school ?? "?"}`.trim());
    }
  }

  if (p.skills?.length) {
    lines.push(`\nSkills: ${p.skills.slice(0, 30).join(", ")}`);
  }

  return lines.join("\n");
}
