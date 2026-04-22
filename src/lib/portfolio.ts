export interface PortfolioSnapshot {
  url: string;
  ok: boolean;
  status?: number;
  text?: string;
  error?: string;
}

export async function fetchPortfolio(url: string): Promise<PortfolioSnapshot> {
  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; MiD-HR-Bot/1.0)" },
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) return { url, ok: false, status: res.status };
    const html = await res.text();
    return { url, ok: true, status: res.status, text: stripHtml(html).slice(0, 15_000) };
  } catch (err) {
    return { url, ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}
