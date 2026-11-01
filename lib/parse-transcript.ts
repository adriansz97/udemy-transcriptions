import { cuesToParagraphs } from "./format-transcript";

const CUE_SELECTORS = [
  '[data-purpose="transcript-panel"] [data-purpose="cue-text"]',
  '[data-purpose="cue-text"]',
  '[data-purpose="transcript-cue"]',
];
const TIMESTAMP_SELECTOR = '[data-purpose*="timestamp" i], time';
const LEADING_TIMESTAMP = /^\d{1,2}:\d{2}(?::\d{2})?\s*/;

export interface ParsedTranscript {
  cues: string[];
  text: string;
}

function normalizeText(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function extractCueText(cue: Element): string {
  const clone = cue.cloneNode(true) as Element;
  clone.querySelectorAll(TIMESTAMP_SELECTOR).forEach((node) => node.remove());

  return normalizeText(clone.textContent).replace(LEADING_TIMESTAMP, "").trim();
}

function findCues(doc: Document): Element[] {
  for (const selector of CUE_SELECTORS) {
    const cues = Array.from(doc.querySelectorAll(selector));
    if (cues.length > 0) return cues;
  }

  return [];
}

export function parseTranscriptHtml(html: string): ParsedTranscript {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const cues = findCues(doc)
    .map(extractCueText)
    .filter(Boolean);

  return { cues, text: cuesToParagraphs(cues).join("\n\n") };
}
