export type VideoType = "video" | "article" | "quiz" | "other";

export interface VideoItem {
  id: string;
  title: string;
  type: VideoType;
}

export interface Section {
  title: string;
  videos: VideoItem[];
}

export interface ParsedSection extends Section {
  skipped: number;
}

export interface WorkspaceState {
  section: Section | null;
  transcripts: Record<string, string>;
}
