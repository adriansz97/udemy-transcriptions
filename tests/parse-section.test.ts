import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseSectionHtml } from "@/lib/parse-section";

const sectionHtml = readFileSync("tests/fixtures/section.html", "utf8");

describe("parseSectionHtml", () => {
  it("extracts the section title with videos and articles", () => {
    const sections = parseSectionHtml(sectionHtml);

    expect(sections).toHaveLength(1);
    expect(sections[0].title).toBe("Sección 3: OpenCode 101 - Primeros pasos");
    expect(sections[0].lessons.map((lesson) => lesson.title)).toEqual([
      "15. Introducción",
      "16. Temas puntuales",
    ]);
    expect(sections[0].lessons.map((lesson) => lesson.type)).toEqual([
      "video",
      "article",
    ]);
    expect(sections[0].skipped).toBe(0);
  });

  it("skips quizzes and keeps unrecognized items", () => {
    const html = `
      <div data-purpose="section-heading">
        <span class="ud-accordion-panel-title">Sección</span>
      </div>
      <div data-purpose="curriculum-item-0">
        <span data-purpose="item-title">Video</span>
        <svg><use xlink:href="#icon-video"></use></svg>
      </div>
      <div data-purpose="curriculum-item-1">
        <span data-purpose="item-title">Quiz</span>
        <svg><use xlink:href="#icon-quiz"></use></svg>
      </div>
      <div data-purpose="curriculum-item-2">
        <span data-purpose="item-title">Recurso</span>
        <svg><use xlink:href="#icon-file"></use></svg>
      </div>
    `;
    const sections = parseSectionHtml(html);

    expect(sections[0].lessons.map((lesson) => lesson.type)).toEqual([
      "video",
      "other",
    ]);
    expect(sections[0].skipped).toBe(1);
  });

  it("returns one entry per section panel", () => {
    const secondSection = sectionHtml.replace("Sección 3:", "Sección 4:");
    const sections = parseSectionHtml(sectionHtml + secondSection);

    expect(sections.map((section) => section.title)).toEqual([
      "Sección 3: OpenCode 101 - Primeros pasos",
      "Sección 4: OpenCode 101 - Primeros pasos",
    ]);
  });

  it("falls back to all items when there are no type icons", () => {
    const html = `
      <div data-purpose="section-heading">
        <span class="ud-accordion-panel-title">Sección</span>
      </div>
      <div data-purpose="curriculum-item-0">
        <span data-purpose="item-title">Video A</span>
      </div>
    `;
    const sections = parseSectionHtml(html);

    expect(sections).toHaveLength(1);
    expect(sections[0].lessons).toHaveLength(1);
    expect(sections[0].lessons[0].type).toBe("video");
  });

  it("returns an empty list when there are no items", () => {
    expect(parseSectionHtml("<p>nada</p>")).toEqual([]);
  });
});
