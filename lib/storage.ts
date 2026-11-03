import type { Lesson, LessonType, Section, WorkspaceState } from "./types";

const STORAGE_KEY = "udemy-transcripts:v2";
const LEGACY_STORAGE_KEY = "udemy-transcripts:v1";
const CURRENT_TYPES = new Set<LessonType>(["video", "article", "other"]);

function isLesson(value: unknown): value is Lesson {
  if (!value || typeof value !== "object") return false;

  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    typeof item.type === "string" &&
    CURRENT_TYPES.has(item.type as LessonType)
  );
}

function isSection(value: unknown): value is Section {
  if (!value || typeof value !== "object") return false;

  const section = value as Record<string, unknown>;
  return (
    typeof section.title === "string" &&
    Array.isArray(section.lessons) &&
    section.lessons.every(isLesson)
  );
}

function isContents(value: unknown): value is Record<string, string> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every((entry) => typeof entry === "string")
  );
}

function isWorkspaceState(value: unknown): value is WorkspaceState {
  if (!value || typeof value !== "object") return false;

  const state = value as Record<string, unknown>;
  const sectionValid = state.section === null || isSection(state.section);

  return sectionValid && isContents(state.contents);
}

function readLegacyLesson(value: unknown): Lesson | "quiz" | null {
  if (isLegacyQuiz(value)) return "quiz";

  return isLesson(value) ? value : null;
}

function isLegacyQuiz(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;

  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    item.type === "quiz"
  );
}

function readLegacySection(value: unknown): Section | null | undefined {
  if (value === null) return null;
  if (!value || typeof value !== "object") return undefined;

  const section = value as Record<string, unknown>;
  if (typeof section.title !== "string" || !Array.isArray(section.videos)) {
    return undefined;
  }

  const lessons: Lesson[] = [];

  for (const rawLesson of section.videos) {
    const lesson = readLegacyLesson(rawLesson);
    if (lesson === null) return undefined;
    if (lesson !== "quiz") lessons.push(lesson);
  }

  return { title: section.title, lessons };
}

function migrateLegacyState(value: unknown): WorkspaceState | null {
  if (!value || typeof value !== "object") return null;

  const state = value as Record<string, unknown>;
  const section = readLegacySection(state.section);
  const contents = state.transcripts;

  if (section === undefined || !isContents(contents)) return null;

  return { section, contents };
}

function readStored<T>(key: string, parse: (value: unknown) => T | null): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;

    return parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function loadWorkspace(): WorkspaceState | null {
  if (typeof window === "undefined") return null;

  const current = readStored(STORAGE_KEY, (value) => (isWorkspaceState(value) ? value : null));
  if (current) return current;

  const migrated = readStored(LEGACY_STORAGE_KEY, migrateLegacyState);
  if (!migrated) return null;

  saveWorkspace(migrated);
  try {
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // Si no se puede borrar la clave antigua, la nueva ya está guardada.
  }

  return migrated;
}

export function saveWorkspace(state: WorkspaceState): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Almacenamiento lleno o bloqueado: el estado sigue en memoria.
  }
}

export function clearWorkspace(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // Ignorar errores de almacenamiento.
  }
}
