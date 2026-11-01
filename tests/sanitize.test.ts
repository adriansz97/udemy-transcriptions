import { describe, expect, it } from "vitest";
import { buildMarkdown } from "@/lib/markdown";
import { sanitizeFilename, uniqueName } from "@/lib/sanitize";

describe("sanitizeFilename", () => {
  it("removes characters that are invalid in file names", () => {
    expect(sanitizeFilename('a/b\\c:d*e?f"g<h>i|j')).toBe("abcdefghij");
  });

  it("keeps accents and collapses whitespace", () => {
    expect(sanitizeFilename("  Sección   3: OpenCode 101  ")).toBe("Sección 3 OpenCode 101");
  });

  it("trims trailing dots and spaces", () => {
    expect(sanitizeFilename("video...")).toBe("video");
  });

  it("uses the fallback for empty names", () => {
    expect(sanitizeFilename(":::")).toBe("sin-titulo");
  });
});

describe("uniqueName", () => {
  it("adds a suffix to duplicated names", () => {
    const used = new Set<string>();

    expect(uniqueName("video", used)).toBe("video");
    expect(uniqueName("video", used)).toBe("video (2)");
    expect(uniqueName("VIDEO", used)).toBe("VIDEO (3)");
  });
});

describe("buildMarkdown", () => {
  it("adds the video title as heading", () => {
    expect(buildMarkdown("15. Introducción", "Hola mundo.")).toBe(
      "# 15. Introducción\n\nHola mundo.\n"
    );
  });
});
