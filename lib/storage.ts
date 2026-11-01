import type { VideoItem, WorkspaceState } from "./types";

const STORAGE_KEY = "udemy-transcripts:v1";
const VIDEO_TYPES = new Set(["video", "article", "quiz", "other"]);

function isVideoItem(value: unknown): value is VideoItem {
  if (!value || typeof value !== "object") return false;

  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    typeof item.type === "string" &&
    VIDEO_TYPES.has(item.type)
  );
}

function isWorkspaceState(value: unknown): value is WorkspaceState {
  if (!value || typeof value !== "object") return false;

  const state = value as Record<string, unknown>;
  const section = state.section as Record<string, unknown> | null | undefined;
  const sectionValid =
    section === null ||
    (typeof section === "object" &&
      section !== null &&
      typeof section.title === "string" &&
      Array.isArray(section.videos) &&
      section.videos.every(isVideoItem));

  const transcripts = state.transcripts;
  const transcriptsValid =
    typeof transcripts === "object" &&
    transcripts !== null &&
    Object.values(transcripts).every((entry) => typeof entry === "string");

  return sectionValid && transcriptsValid;
}

export function loadWorkspace(): WorkspaceState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    return isWorkspaceState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveWorkspace(state: WorkspaceState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Almacenamiento lleno o bloqueado: el estado sigue en memoria.
  }
}

export function clearWorkspace(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignorar errores de almacenamiento.
  }
}
