import { buildMarkdown } from "./markdown";
import { sanitizeFilename, uniqueName } from "./sanitize";
import type { Section } from "./types";

export interface MarkdownFile {
  name: string;
  content: string;
}

export function buildMarkdownFiles(
  section: Section,
  transcripts: Record<string, string>
): MarkdownFile[] {
  const usedNames = new Set<string>();

  return section.videos.map((video) => ({
    name: `${uniqueName(sanitizeFilename(video.title), usedNames)}.md`,
    content: buildMarkdown(video.title, transcripts[video.id] ?? ""),
  }));
}

export function buildZipName(sectionTitle: string): string {
  return `${sanitizeFilename(sectionTitle, "seccion")}.zip`;
}
