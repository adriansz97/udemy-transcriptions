import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseTranscriptHtml } from "@/lib/parse-transcript";

const transcriptHtml = readFileSync("tests/fixtures/transcript.html", "utf8");

describe("parseTranscriptHtml", () => {
  it("extracts cues in order and joins them", () => {
    const result = parseTranscriptHtml(transcriptHtml);

    expect(result.cues).toHaveLength(2);
    expect(result.text).toBe(
      "Yo sé que ya queremos empezar a tirar código, manipularlo ver lo que podemos hacer con OpenCode, crear ramas"
    );
  });

  it("removes timestamps from the cue text", () => {
    const html = `
      <div data-purpose="transcript-panel">
        <p data-purpose="transcript-cue">
          <span data-purpose="cue-text">
            <span data-purpose="transcript-cue-timestamp">00:12</span>Hola mundo.
          </span>
        </p>
      </div>
    `;

    expect(parseTranscriptHtml(html).text).toBe("Hola mundo.");
  });

  it("groups long cue sequences into paragraphs", () => {
    const cue = `
      <p data-purpose="transcript-cue">
        <span data-purpose="cue-text">Esta es una frase de prueba suficientemente larga para el párrafo.</span>
      </p>
    `;
    const html = `<div data-purpose="transcript-panel">${cue.repeat(8)}</div>`;
    const paragraphs = parseTranscriptHtml(html).text.split("\n\n");

    expect(paragraphs.length).toBeGreaterThan(1);
    expect(paragraphs.every((paragraph) => paragraph.endsWith("."))).toBe(true);
  });

  it("returns empty values when there are no cues", () => {
    expect(parseTranscriptHtml("<div>nada</div>")).toEqual({ cues: [], text: "" });
  });
});
