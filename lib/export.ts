import { buildMarkdown } from "./markdown";
import { sanitizeFilename, uniqueName } from "./sanitize";
import type { Section } from "./types";

export interface MarkdownFile {
  name: string;
  content: string;
}

export function buildMarkdownFileName(title: string): string {
  return `${sanitizeFilename(title)}.md`;
}

export function buildMarkdownFiles(
  section: Section,
  contents: Record<string, string>
): MarkdownFile[] {
  const usedNames = new Set<string>();

  return section.lessons.map((lesson) => ({
    name: `${uniqueName(sanitizeFilename(lesson.title), usedNames)}.md`,
    content: buildMarkdown(lesson.title, contents[lesson.id] ?? ""),
  }));
}

export function buildZipName(sectionTitle: string): string {
  return `${sanitizeFilename(sectionTitle, "seccion")}.zip`;
}
