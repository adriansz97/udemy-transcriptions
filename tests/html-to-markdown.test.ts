import { describe, expect, it } from "vitest";
import { htmlToMarkdown } from "@/lib/html-to-markdown";

function convert(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return htmlToMarkdown(doc.body);
}

describe("htmlToMarkdown", () => {
  it("converts inline formatting and links", () => {
    expect(
      convert(
        '<p>Un <strong>texto</strong> con <code>código</code> y <a href="https://example.com">enlace</a>.</p>'
      )
    ).toBe("Un **texto** con `código` y [enlace](https://example.com).");
  });

  it("drops unsafe links but keeps their text", () => {
    expect(convert('<p><a href="javascript:alert(1)">no</a></p>')).toBe("no");
  });

  it("converts nested lists with indentation", () => {
    expect(
      convert("<ul><li>Uno<ul><li>Sub</li></ul></li><li>Dos</li></ul>")
    ).toBe("- Uno\n  - Sub\n- Dos");
  });

  it("converts tables to GFM", () => {
    expect(
      convert("<table><tr><th>A</th><th>B</th></tr><tr><td>1</td><td>2</td></tr></table>")
    ).toBe("| A | B |\n| --- | --- |\n| 1 | 2 |");
  });

  it("ignores empty paragraphs and collapses blank lines", () => {
    expect(convert("<p>Uno</p><p><br></p><p>Dos</p>")).toBe("Uno\n\nDos");
  });
});
