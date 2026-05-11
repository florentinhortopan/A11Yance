/**
 * Extract main content from a page using @mozilla/readability and JSDOM.
 * Returns plain-text + metadata that the rewriter prompt can ingest.
 */

export interface ExtractedContent {
  title: string;
  byline: string | null;
  excerpt: string | null;
  lang: string | null;
  textContent: string;
  length: number;
  headings: { level: number; text: string }[];
  images: { src: string; alt: string | null }[];
  links: { href: string; text: string }[];
}

export async function extractFromHtml(
  html: string,
  baseUrl: string
): Promise<ExtractedContent> {
  const { JSDOM } = await import("jsdom");
  const { Readability } = await import("@mozilla/readability");

  const dom = new JSDOM(html, { url: baseUrl });
  const doc = dom.window.document;
  const lang = doc.documentElement.getAttribute("lang");

  const headings = Array.from(
    doc.querySelectorAll<HTMLHeadingElement>("h1,h2,h3,h4")
  )
    .map((h) => ({
      level: Number(h.tagName.substring(1)),
      text: (h.textContent ?? "").trim().slice(0, 200),
    }))
    .filter((h) => h.text)
    .slice(0, 80);

  const images = Array.from(doc.querySelectorAll<HTMLImageElement>("img"))
    .map((i) => ({
      src: i.getAttribute("src") ?? "",
      alt: i.getAttribute("alt"),
    }))
    .filter((i) => i.src)
    .slice(0, 40);

  const links = Array.from(doc.querySelectorAll<HTMLAnchorElement>("a[href]"))
    .map((a) => ({
      href: a.getAttribute("href") ?? "",
      text: (a.textContent ?? "").trim().slice(0, 120),
    }))
    .filter((l) => l.text && l.href && !l.href.startsWith("#"))
    .slice(0, 60);

  let title = doc.title || "";
  let byline: string | null = null;
  let excerpt: string | null = null;
  let textContent = "";

  try {
    const reader = new Readability(doc.cloneNode(true) as Document);
    const article = reader.parse();
    if (article) {
      title = article.title || title;
      byline = article.byline ?? null;
      excerpt = article.excerpt ?? null;
      textContent = (article.textContent ?? "").trim();
    }
  } catch {
    // Readability can throw on malformed pages; fall back to body text.
  }

  if (!textContent) {
    textContent = (doc.body?.textContent ?? "").replace(/\s+/g, " ").trim();
  }

  // Cap text content to ~12k chars to keep prompts reasonable.
  const capped = textContent.slice(0, 12000);

  dom.window.close();

  return {
    title: title.trim(),
    byline,
    excerpt,
    lang,
    textContent: capped,
    length: textContent.length,
    headings,
    images,
    links,
  };
}
