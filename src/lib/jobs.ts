const CREATIVE_DIRECTOR = `# Creative Director (Head of Creative)

## Overview
This role is responsible for setting the creative vision, managing team performance, and ensuring high-quality delivery across all client work. The Creative Director will balance **creative excellence with operational efficiency**.

We're looking to bring on a strong Creative Director to lead and scale our creative team. This role will oversee a team of 5–10 creatives and own both the **quality and speed of our output**.

## Core Responsibilities
- Lead and manage a team of 5–10 creatives (designers, video editors, content creators)
- Own the overall quality of creative output across all accounts
- Establish and enforce creative standards, processes, and best practices
- Ensure projects are delivered on time without sacrificing quality
- Review and approve key creative deliverables (video, design, campaigns, etc.)
- Manage department capacity, resource allocation, and workflow efficiency
- Own and manage the creative department budget
- Collaborate closely with strategy, account, and production teams
- Identify opportunities to improve speed through systems, tools, and AI workflows
- Mentor and develop team members to improve overall skill level and output

## Requirements
- Proven experience as a Creative Director or senior creative leader
- Strong background across multiple mediums (video, design, digital content)
- Experience managing and scaling creative teams
- Ability to balance creativity with deadlines, budgets, and operational constraints
- Strong leadership and communication skills
- Experience implementing creative processes and workflows
- High standards for quality with a bias toward execution speed

## Nice to Have
- Experience in an agency environment
- Familiarity with tools like Figma, video editing platforms, and AI-driven creative workflows
- Experience working with B2B brands or performance-driven marketing teams

## What We're Looking For
A leader who can **raise the bar on quality while increasing throughput**. This person should think in terms of systems, not just individual outputs—someone who can build a creative engine, not just create great work.
`;

const BUSINESS_DEVELOPMENT_MANAGER = `# Business Development Manager (Pipeline Generation)

## Overview
We're looking for someone who thrives on outbound, is comfortable operating with modern tools, and knows how to consistently generate qualified meetings. This role is less about closing and more about **creating high-quality opportunities at scale**.

We're looking to bring on a high-performing Business Development Manager to drive new pipeline and generate qualified opportunities for our agency. This is a pure growth role—focused on opening doors, starting conversations, and creating real opportunities for our sales team.

## Core Responsibilities
- Generate new business opportunities through outbound channels:
  - Email campaigns
  - LinkedIn outreach
  - Targeted account-based efforts
- Build and manage prospect lists using tools like **Clay**, **HubSpot**, and similar platforms
- Craft personalized outreach leveraging AI tools and research workflows
- Qualify inbound and outbound leads and book meetings for the sales team
- Collaborate with marketing to align messaging, campaigns, and targeting
- Continuously test and optimize outreach strategies for higher conversion rates
- Maintain accurate pipeline tracking and reporting within CRM

## Requirements
- Proven experience in business development, SDR, or outbound sales roles
- Strong understanding of outbound strategy and multi-touch sequencing
- Experience with CRM tools (preferably **HubSpot**)
- Familiarity with modern outbound and enrichment tools (e.g., **Clay**, email automation platforms)
- Strong written communication skills (critical for outbound success)
- Highly self-motivated and comfortable working in a performance-driven environment
- Ability to manage multiple campaigns and iterate quickly

## Nice to Have
- Experience in B2B tech or agency environments
- Familiarity with AI-assisted outreach and personalization workflows
- Background in account-based marketing (ABM) strategies

## What We're Looking For
Someone who treats pipeline like a system—not luck. This person should be **process-driven, experimental, and relentless about generating opportunities**.
`;

const JOBS: Record<string, string> = {
  "creative-director": CREATIVE_DIRECTOR,
  "business-development-manager": BUSINESS_DEVELOPMENT_MANAGER,
};

export function loadJobDescription(slug: string): string | null {
  if (!slug) return null;
  return JOBS[slug] ?? null;
}
