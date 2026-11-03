import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseLessonHtml } from "@/lib/parse-lesson";

const topicsHtml = readFileSync("tests/fixtures/article-topics.html", "utf8");
const transcriptHtml = readFileSync("tests/fixtures/transcript.html", "utf8");

describe("parseLessonHtml", () => {
  it("detects an article even when the lesson is marked as video", () => {
    const parsed = parseLessonHtml(topicsHtml, "video");

    expect(parsed?.kind).toBe("article");
    expect(parsed?.markdown).toContain("**Temas puntuales:**");
  });

  it("detects a transcript for unrecognized lesson types", () => {
    const parsed = parseLessonHtml(transcriptHtml, "other");

    expect(parsed?.kind).toBe("transcript");
    expect(parsed?.markdown).not.toBe("");
  });

  it("returns null when the HTML has no usable content", () => {
    expect(parseLessonHtml("<div>nada</div>", "article")).toBeNull();
  });
});
