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

const VIDEO_EDITOR = `# Video Editor (Social + Marketing Content)

## Overview
We're looking for a strong general video editor who can turn raw footage into polished, on-brand content for B2B technology companies. This is a **hands-on craft role**—you'll be in Premiere and After Effects every day, shaping a steady mix of social cuts, podcast clips, testimonials, and short product explainers.

Most of our work supports marketing teams at modern tech companies, so taste matters. We need someone who understands what makes a clip feel native to LinkedIn and short-form social, knows when to let a testimonial breathe, and can punch up a product walkthrough without overdoing it.

## Core Responsibilities
- Edit short-form social media clips (LinkedIn, YouTube Shorts, Instagram, TikTok) optimized for platform
- Cut and package podcast interview clips — pulling highlights, captioning, framing for feed
- Produce video testimonial edits that feel authentic and clear
- Create short animated product videos — motion, type, simple UI animation
- Handle full post-production: color, sound, captions, exports for multiple aspect ratios
- Maintain brand consistency across client libraries (LUTs, fonts, lower thirds, outros)
- Collaborate with creative and account teams to turn briefs into finished deliverables
- Manage your own project timelines and hit deadlines across multiple clients

## Requirements
- Strong proficiency in **Adobe Premiere Pro** and **After Effects**
- Comfortable with modern editing workflows: proxies, dynamic linking, captioning tools
- Portfolio demonstrating a range of formats (social clips, longer-form, motion graphics)
- Strong sense of pacing, rhythm, and when to cut
- Clean typography and motion-design sensibility for animated product content
- Audio editing fundamentals — noise removal, leveling, music selection
- Ability to take written/verbal feedback and iterate quickly
- Self-managed: can run multiple projects in parallel without dropping quality

## Nice to Have
- Experience editing for B2B or technology brands specifically
- Familiarity with DaVinci Resolve, Descript, or AI-assisted editing tools
- Motion graphics chops beyond the basics (rigging, expressions, template building)
- Experience building reusable templates and systems to speed up recurring edit types
- Background editing podcast-native content

## What We're Looking For
A **solid, versatile editor** who's fast without being sloppy — someone who can jump between a 30-second social teaser and a 2-minute product explainer in the same day and make both feel intentional. Taste, speed, and reliability matter more than flashy reels. Bonus points if you have an opinion about what makes tech marketing video actually land.
`;

const JOBS: Record<string, string> = {
  "creative-director": CREATIVE_DIRECTOR,
  "business-development-manager": BUSINESS_DEVELOPMENT_MANAGER,
  "video-editor": VIDEO_EDITOR,
};

export function loadJobDescription(slug: string): string | null {
  if (!slug) return null;
  return JOBS[slug] ?? null;
}
