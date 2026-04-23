import { ApifyClient } from "apify-client";

const DEFAULT_ACTOR = "dev_fusion~linkedin-profile-scraper";

// Field shape returned by dev_fusion~linkedin-profile-scraper. Verified
// against a real run on 2026-04-22; do not assume other actors return
// the same keys.
interface RawExperience {
  title?: string;
  companyName?: string | null;
  companyIndustry?: string | null;
  jobDescription?: string | null;
  jobStartedOn?: string | null;
  jobEndedOn?: string | null;
  jobStillWorking?: boolean;
  jobLocation?: string | null;
  employmentType?: string | null;
}

interface RawEducation {
  title?: string | null; // school
  subtitle?: string | null; // degree / program
  description?: string | null;
  period?: {
    startedOn?: { year?: number | null } | null;
    endedOn?: { year?: number | null } | null;
  } | null;
}

interface RawSkill {
  title?: string;
}

interface RawProfile {
  fullName?: string;
  headline?: string;
  about?: string | null;
  addressWithCountry?: string;
  addressCountryOnly?: string;
  jobTitle?: string;
  companyName?: string;
  companyIndustry?: string;
  currentJobDuration?: string;
  totalExperienceYears?: number;
  experiencesCount?: number;
  experiences?: RawExperience[];
  educations?: RawEducation[];
  skills?: RawSkill[];
  email?: string;
}

export interface LinkedInExperience {
  title?: string;
  company?: string;
  industry?: string;
  description?: string;
  startedOn?: string;
  endedOn?: string;
  current?: boolean;
  location?: string;
}

export interface LinkedInEducation {
  school?: string;
  program?: string;
  startYear?: number;
  endYear?: number;
}

export interface LinkedInProfile {
  url: string;
  // true when the Apify actor returned usable profile data. false when the
  // dataset was empty (locked/private profile, anti-bot block, bad URL, etc.)
  // — in that case the candidate should be routed to NEEDS REVIEW rather
  // than evaluated as if the LinkedIn is verified-missing.
  ok: boolean;
  error?: string;
  fullName?: string;
  headline?: string;
  about?: string;
  location?: string;
  currentTitle?: string;
  currentCompany?: string;
  currentIndustry?: string;
  currentDuration?: string;
  totalExperienceYears?: number;
  experiences: LinkedInExperience[];
  education: LinkedInEducation[];
  skills: string[];
  raw: unknown;
}

// Strip tracking/share params and fragments that confuse the scraper.
// e.g. ".../in/yasin-yana%C3%A7-008114335?utm_source=share&utm_medium=android_app"
// becomes ".../in/yasin-yana%C3%A7-008114335"
export function cleanLinkedInUrl(raw: string): string {
  try {
    const u = new URL(raw);
    u.search = "";
    u.hash = "";
    let out = u.toString();
    if (out.endsWith("/")) out = out.slice(0, -1);
    return out;
  } catch {
    return raw;
  }
}

export async function scrapeLinkedIn(rawUrl: string): Promise<LinkedInProfile> {
  const token = process.env.APIFY_TOKEN;
  if (!token) throw new Error("APIFY_TOKEN not configured");

  const url = cleanLinkedInUrl(rawUrl);
  const actorId = process.env.APIFY_LINKEDIN_ACTOR || DEFAULT_ACTOR;
  const client = new ApifyClient({ token });

  const run = await client.actor(actorId).call({
    profileUrls: [url],
  });

  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  const profile = items[0] as RawProfile | undefined;
  if (!profile) {
    return emptyProfile(url, "Apify returned no profile data (locked/private, blocked, or invalid URL)");
  }

  return {
    url,
    ok: true,
    fullName: profile.fullName?.trim() || undefined,
    headline: profile.headline?.trim() || undefined,
    about: profile.about?.trim() || undefined,
    location: profile.addressWithCountry || profile.addressCountryOnly || undefined,
    currentTitle: profile.jobTitle?.trim() || undefined,
    currentCompany: profile.companyName?.trim() || undefined,
    currentIndustry: profile.companyIndustry?.trim() || undefined,
    currentDuration: profile.currentJobDuration?.trim() || undefined,
    totalExperienceYears:
      typeof profile.totalExperienceYears === "number"
        ? profile.totalExperienceYears
        : undefined,
    experiences: (profile.experiences ?? []).map(mapExperience),
    education: (profile.educations ?? []).map(mapEducation),
    skills: (profile.skills ?? [])
      .map((s) => s?.title?.trim())
      .filter((s): s is string => Boolean(s)),
    raw: profile,
  };
}

function emptyProfile(url: string, error: string): LinkedInProfile {
  return {
    url,
    ok: false,
    error,
    experiences: [],
    education: [],
    skills: [],
    raw: null,
  };
}

function mapExperience(e: RawExperience): LinkedInExperience {
  return {
    title: e.title?.trim() || undefined,
    company: e.companyName?.trim() || undefined,
    industry: e.companyIndustry?.trim() || undefined,
    description: e.jobDescription?.trim() || undefined,
    startedOn: e.jobStartedOn?.trim() || undefined,
    endedOn: e.jobEndedOn?.trim() || undefined,
    current: Boolean(e.jobStillWorking),
    location: e.jobLocation?.trim() || undefined,
  };
}

function mapEducation(ed: RawEducation): LinkedInEducation {
  return {
    school: ed.title?.trim() || undefined,
    program: ed.subtitle?.trim() || undefined,
    startYear: ed.period?.startedOn?.year ?? undefined,
    endYear: ed.period?.endedOn?.year ?? undefined,
  };
}

export function formatLinkedInForPrompt(p: LinkedInProfile): string {
  if (!p.ok) {
    return `(LinkedIn profile could not be fetched — ${p.error ?? "unknown reason"}. Evaluate the candidate from pitch + portfolio only. Do NOT penalize them for unverifiable LinkedIn data; route to human review if promising.)`;
  }
  const lines: string[] = [];
  lines.push(`Name: ${p.fullName ?? "?"}`);
  lines.push(`Headline: ${p.headline ?? "?"}`);
  if (p.location) lines.push(`Location: ${p.location}`);
  if (typeof p.totalExperienceYears === "number") {
    lines.push(`Total experience (years): ${p.totalExperienceYears}`);
  }

  if (p.currentTitle || p.currentCompany) {
    const dur = p.currentDuration ? ` (${p.currentDuration})` : "";
    const ind = p.currentIndustry ? ` — ${p.currentIndustry}` : "";
    lines.push(
      `Current role: ${p.currentTitle ?? "?"} @ ${p.currentCompany ?? "?"}${dur}${ind}`,
    );
  }

  if (p.about) lines.push(`\nAbout:\n${p.about.slice(0, 2000)}`);

  if (p.experiences.length) {
    lines.push("\nExperience:");
    for (const e of p.experiences.slice(0, 10)) {
      const range = formatDateRange(e.startedOn, e.endedOn, e.current);
      const company = e.company ?? "?";
      const industry = e.industry ? ` [${e.industry}]` : "";
      lines.push(`- ${e.title ?? "?"} @ ${company}${range ? ` (${range})` : ""}${industry}`);
      if (e.description) {
        const collapsed = e.description.replace(/\s+/g, " ").slice(0, 500);
        lines.push(`    ${collapsed}`);
      }
    }
  }

  if (p.education.length) {
    lines.push("\nEducation:");
    for (const ed of p.education.slice(0, 5)) {
      const years = formatYearRange(ed.startYear, ed.endYear);
      const program = ed.program ? ` — ${ed.program}` : "";
      lines.push(`- ${ed.school ?? "?"}${program}${years ? ` (${years})` : ""}`);
    }
  }

  if (p.skills.length) {
    lines.push(`\nSkills: ${p.skills.slice(0, 30).join(", ")}`);
  }

  return lines.join("\n");
}

function formatDateRange(
  start?: string,
  end?: string,
  current?: boolean,
): string {
  if (!start && !end) return "";
  if (current || !end) return `${start ?? "?"} – present`;
  return `${start ?? "?"} – ${end}`;
}

function formatYearRange(start?: number, end?: number): string {
  if (!start && !end) return "";
  if (!end) return `${start} – present`;
  return `${start ?? "?"} – ${end}`;
}
