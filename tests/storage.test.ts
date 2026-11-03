import { beforeEach, describe, expect, it } from "vitest";
import { clearWorkspace, loadWorkspace, saveWorkspace } from "@/lib/storage";
import type { WorkspaceState } from "@/lib/types";

const LEGACY_KEY = "udemy-transcripts:v1";
const CURRENT_KEY = "udemy-transcripts:v2";

const currentState: WorkspaceState = {
  section: {
    title: "Sección",
    lessons: [{ id: "a", title: "Artículo", type: "article" }],
  },
  contents: { a: "Contenido." },
};

describe("workspace storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("saves and loads the current workspace", () => {
    saveWorkspace(currentState);

    expect(loadWorkspace()).toEqual(currentState);
  });

  it("migrates the legacy shape and drops quizzes", () => {
    window.localStorage.setItem(
      LEGACY_KEY,
      JSON.stringify({
        section: {
          title: "Sección antigua",
          videos: [
            { id: "a", title: "Video", type: "video" },
            { id: "b", title: "Artículo", type: "article" },
            { id: "c", title: "Quiz", type: "quiz" },
          ],
        },
        transcripts: { a: "Uno.", b: "Dos." },
      })
    );

    expect(loadWorkspace()).toEqual({
      section: {
        title: "Sección antigua",
        lessons: [
          { id: "a", title: "Video", type: "video" },
          { id: "b", title: "Artículo", type: "article" },
        ],
      },
      contents: { a: "Uno.", b: "Dos." },
    });
    expect(window.localStorage.getItem(CURRENT_KEY)).not.toBeNull();
    expect(window.localStorage.getItem(LEGACY_KEY)).toBeNull();
  });

  it("clears both storage versions", () => {
    window.localStorage.setItem(LEGACY_KEY, "{}");
    saveWorkspace(currentState);

    clearWorkspace();

    expect(window.localStorage.getItem(CURRENT_KEY)).toBeNull();
    expect(window.localStorage.getItem(LEGACY_KEY)).toBeNull();
  });

  it("ignores invalid stored data", () => {
    window.localStorage.setItem(CURRENT_KEY, "{invalid");

    expect(loadWorkspace()).toBeNull();
  });
});
