import { describe, expect, it } from "vitest";
import { buildMarkdownFileName, buildMarkdownFiles, buildZipName } from "@/lib/export";
import type { Section } from "@/lib/types";

const section: Section = {
  title: "Sección 3: OpenCode 101",
  lessons: [
    { id: "a", title: "Video: uno", type: "video" },
    { id: "b", title: "Video: uno", type: "article" },
  ],
};

describe("buildMarkdownFiles", () => {
  it("sanitizes names and resolves duplicates", () => {
    const files = buildMarkdownFiles(section, { a: "Uno.", b: "Dos." });

    expect(files).toEqual([
      { name: "Video uno.md", content: "# Video: uno\n\nUno.\n" },
      { name: "Video uno (2).md", content: "# Video: uno\n\nDos.\n" },
    ]);
  });
});

describe("buildMarkdownFileName", () => {
  it("sanitizes the title and adds the extension", () => {
    expect(buildMarkdownFileName("Video: uno / dos")).toBe("Video uno dos.md");
  });

  it("falls back when the title has no valid characters", () => {
    expect(buildMarkdownFileName("///")).toBe("sin-titulo.md");
  });
});

describe("buildZipName", () => {
  it("sanitizes the section title", () => {
    expect(buildZipName(section.title)).toBe("Sección 3 OpenCode 101.zip");
  });
});
