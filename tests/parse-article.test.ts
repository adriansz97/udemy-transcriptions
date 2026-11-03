import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseArticleHtml } from "@/lib/parse-article";

const topicsHtml = readFileSync("tests/fixtures/article-topics.html", "utf8");
const updateHtml = readFileSync("tests/fixtures/article-update.html", "utf8");

describe("parseArticleHtml", () => {
  it("converts paragraphs, bold text, lists and inline code", () => {
    expect(parseArticleHtml(topicsHtml)).toBe(
      [
        "Esta sección vamos a instalar OpenCode y a dejarlo configurado a tu gusto: conectaremos distintos proveedores de modelos, definiremos instrucciones globales para que el agente entienda tus proyectos y personalizaremos la interfaz de la terminal.",
        "",
        "**Temas puntuales:**",
        "",
        "- Instalación inicial de OpenCode y primeros pasos",
        "- Configuración de proveedores de modelos (OpenAI, OpenCode Go y Ollama)",
        "- Instrucciones globales del agente",
        "- Personalización del TUI mediante `tui.json`",
      ].join("\n")
    );
  });

  it("keeps code blocks and their indentation", () => {
    const markdown = parseArticleHtml(updateHtml);

    expect(markdown).toContain("```\n{  \"$schema\": \"https://opencode.ai/v2/cli.json\",");
    expect(markdown).toContain('  "theme": {');
    expect(markdown).toContain('    "name": "tokyonight"');
    expect(markdown).toContain('    "sound_pack": "opencode.default"');
    expect(markdown).not.toContain("\u00a0");
  });

  it("does not duplicate the article heading in the content", () => {
    const markdown = parseArticleHtml(topicsHtml);

    expect(markdown.startsWith("# Temas puntuales")).toBe(false);
  });

  it("returns an empty string when there is no article content", () => {
    expect(parseArticleHtml("<div>nada</div>")).toBe("");
  });
});
