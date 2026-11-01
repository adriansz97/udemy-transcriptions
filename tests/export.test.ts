import { describe, expect, it } from "vitest";
import { buildMarkdownFiles, buildZipName } from "@/lib/export";
import type { Section } from "@/lib/types";

const section: Section = {
  title: "Sección 3: OpenCode 101",
  videos: [
    { id: "a", title: "Video: uno", type: "video" },
    { id: "b", title: "Video: uno", type: "video" },
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

describe("buildZipName", () => {
  it("sanitizes the section title", () => {
    expect(buildZipName(section.title)).toBe("Sección 3 OpenCode 101.zip");
  });
});
