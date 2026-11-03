import { parseArticleHtml } from "./parse-article";
import { parseTranscriptHtml } from "./parse-transcript";
import type { LessonType } from "./types";

export interface ParsedLesson {
  kind: "article" | "transcript";
  markdown: string;
}

function readArticle(html: string): ParsedLesson | null {
  const markdown = parseArticleHtml(html);
  return markdown ? { kind: "article", markdown } : null;
}

function readTranscript(html: string): ParsedLesson | null {
  const markdown = parseTranscriptHtml(html).text;
  return markdown ? { kind: "transcript", markdown } : null;
}

export function parseLessonHtml(html: string, type: LessonType): ParsedLesson | null {
  const parsers =
    type === "article" ? [readArticle, readTranscript] : [readTranscript, readArticle];

  for (const parse of parsers) {
    const parsed = parse(html);
    if (parsed) return parsed;
  }

  return null;
}
