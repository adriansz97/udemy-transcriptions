import { htmlToMarkdown } from "./html-to-markdown";

const CONTENT_SELECTORS = [
  '[data-purpose="safely-set-inner-html:rich-text-viewer:html"]',
  '[data-purpose="article-content"]',
  '[class*="article-asset--content"]',
  '[class*="rt-scaffolding"]',
];
const CONTAINER_SELECTORS = [
  '[class*="text-viewer--content"]',
  '[class*="article-asset--container"]',
];
const MAIN_HEADING_SELECTOR = '[class*="text-viewer--main-heading"], .ud-heading-xxl';

function findContent(doc: Document): Element | null {
  for (const selector of CONTENT_SELECTORS) {
    const content = doc.querySelector(selector);
    if (content) return content;
  }

  for (const selector of CONTAINER_SELECTORS) {
    const container = doc.querySelector(selector);
    if (!container) continue;

    const clone = container.cloneNode(true) as Element;
    clone.querySelectorAll(MAIN_HEADING_SELECTOR).forEach((heading) => heading.remove());
    return clone;
  }

  return null;
}

export function parseArticleHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const content = findContent(doc);

  return content ? htmlToMarkdown(content) : "";
}
