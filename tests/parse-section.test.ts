import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseSectionHtml } from "@/lib/parse-section";

const sectionHtml = readFileSync("tests/fixtures/section.html", "utf8");

describe("parseSectionHtml", () => {
  it("extracts the section title and only video items", () => {
    const sections = parseSectionHtml(sectionHtml);

    expect(sections).toHaveLength(1);
    expect(sections[0].title).toBe("Sección 3: OpenCode 101 - Primeros pasos");
    expect(sections[0].videos.map((video) => video.title)).toEqual(["15. Introducción"]);
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
    expect(sections[0].videos).toHaveLength(1);
    expect(sections[0].videos[0].type).toBe("video");
  });

  it("returns an empty list when there are no items", () => {
    expect(parseSectionHtml("<p>nada</p>")).toEqual([]);
  });
});
