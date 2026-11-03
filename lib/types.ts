export type LessonType = "video" | "article" | "other";

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
}

export interface Section {
  title: string;
  lessons: Lesson[];
}

export interface ParsedSection extends Section {
  skipped: number;
}

export interface WorkspaceState {
  section: Section | null;
  contents: Record<string, string>;
}
