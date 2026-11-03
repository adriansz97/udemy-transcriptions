const TEXT_NODE = 3;
const ELEMENT_NODE = 1;
const SKIP_TAGS = new Set([
  "script",
  "style",
  "noscript",
  "svg",
  "button",
  "input",
  "textarea",
  "select",
  "iframe",
]);
const FLOW_TAGS = new Set([
  "div",
  "section",
  "article",
  "main",
  "header",
  "footer",
  "aside",
  "figure",
  "figcaption",
  "details",
  "summary",
  "dl",
  "dt",
  "dd",
  "center",
]);
const INLINE_SPECIAL = /([\\`*_[\]<>])/g;

function normalizeWhitespace(value: string): string {
  return value.replace(/\u00a0/g, " ").replace(/\s+/g, " ");
}

function escapeInline(value: string): string {
  return value.replace(INLINE_SPECIAL, "\\$1");
}

function appendInline(left: string, right: string): string {
  if (!left) return right;
  if (!right) return left;
  const joinsNaturally = /[\s(]$/.test(left) || /^[\s.,;:!?)]/.test(right);

  return joinsNaturally ? `${left}${right}` : `${left} ${right}`;
}

function wrapInline(marker: string, content: string): string {
  if (!content.trim()) return content;

  const leading = content.startsWith(" ") ? " " : "";
  const trailing = content.endsWith(" ") ? " " : "";
  return `${leading}${marker}${content.trim()}${marker}${trailing}`;
}

function longestRun(value: string, char: string): number {
  let longest = 0;
  let current = 0;

  for (const item of value) {
    if (item === char) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  }

  return longest;
}

function renderCodeSpan(element: Element): string {
  const content = normalizeWhitespace(element.textContent ?? "").trim();
  if (!content) return "";

  const fence = "`".repeat(longestRun(content, "`") + 1);
  const padded = content.startsWith("`") || content.endsWith("`") ? ` ${content} ` : content;

  return `${fence}${padded}${fence}`;
}

function isSafeHref(href: string): boolean {
  const normalized = href.trim();
  if (!normalized) return false;

  const scheme = normalized.match(/^([a-z][a-z0-9+.-]*):/i)?.[1].toLowerCase();
  return !scheme || scheme === "http" || scheme === "https";
}

function formatUrl(url: string): string {
  return url
    .trim()
    .replace(/\s/g, "%20")
    .replace(/[()<>]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
}

function renderLink(element: Element): string {
  const href = element.getAttribute("href") ?? "";
  const text = renderInlineChildren(element) || escapeInline(href);

  if (!isSafeHref(href)) return text;

  return `[${text}](${formatUrl(href)})`;
}

function renderImage(element: Element): string {
  const src = element.getAttribute("src") ?? "";
  const alt = escapeInline(normalizeWhitespace(element.getAttribute("alt") ?? "").trim());

  if (!isSafeHref(src)) return alt;

  return `![${alt}](${formatUrl(src)})`;
}

function renderInline(node: Node): string {
  if (node.nodeType === TEXT_NODE) {
    return escapeInline(normalizeWhitespace(node.textContent ?? ""));
  }

  if (node.nodeType !== ELEMENT_NODE) return "";

  const element = node as Element;
  const tag = element.tagName.toLowerCase();

  if (SKIP_TAGS.has(tag)) return "";

  switch (tag) {
    case "br":
      return "\\\n";
    case "strong":
    case "b":
      return wrapInline("**", renderInlineChildren(element));
    case "em":
    case "i":
      return wrapInline("*", renderInlineChildren(element));
    case "del":
    case "s":
    case "strike":
      return wrapInline("~~", renderInlineChildren(element));
    case "code":
      return renderCodeSpan(element);
    case "a":
      return renderLink(element);
    case "img":
      return renderImage(element);
    default:
      return renderInlineChildren(element);
  }
}

function renderInlineChildren(node: Node): string {
  return Array.from(node.childNodes).map(renderInline).join("");
}

function dedent(value: string): string {
  const lines = value.split("\n");
  const indents = lines
    .filter((line) => line.trim())
    .map((line) => line.match(/^[ \t]*/)?.[0].length ?? 0);

  if (indents.length === 0) return "";

  const minimum = Math.min(...indents);
  if (minimum === 0) return value.trim();

  return lines
    .map((line) => line.slice(minimum))
    .join("\n")
    .trim();
}

function readLanguage(code: Element | null, pre: Element): string {
  const className = code?.getAttribute("class") ?? "";
  const fromClass = className.match(/language-([\w-]+)/)?.[1];
  const fromData = code?.getAttribute("data-language") ?? pre.getAttribute("data-language") ?? "";
  const language = fromClass ?? fromData;

  return /^[\w-]+$/.test(language) ? language : "";
}

function renderPre(element: Element): string {
  const code = element.querySelector("code");
  const raw = element.textContent ?? "";
  const text = dedent(
    raw
      .replace(/\u00a0/g, " ")
      .replace(/\r\n?/g, "\n")
      .replace(/[ \t]+$/gm, "")
      .replace(/^\n+|\n+$/g, "")
  );

  if (!text) return "";

  const fence = "`".repeat(Math.max(3, longestRun(text, "`") + 1));
  const language = readLanguage(code, element);

  return `${fence}${language}\n${text}\n${fence}`;
}

function renderListItem(
  item: Element,
  nestedIndent: string
): { text: string; nested: string[] } {
  let text = "";
  const nested: string[] = [];

  for (const child of Array.from(item.childNodes)) {
    if (child.nodeType === ELEMENT_NODE) {
      const tag = (child as Element).tagName.toLowerCase();
      if (tag === "ul" || tag === "ol") {
        const list = renderList(child as Element, nestedIndent);
        if (list) nested.push(list);
        continue;
      }
    }

    const rendered = renderFlow(child).trim();
    if (rendered) text = appendInline(text, rendered);
  }

  return { text: text.trim(), nested };
}

function renderList(list: Element, indent: string): string {
  const ordered = list.tagName.toLowerCase() === "ol";
  const parsedStart = Number.parseInt(list.getAttribute("start") ?? "1", 10);
  const start = Number.isFinite(parsedStart) ? parsedStart : 1;
  const items = Array.from(list.children).filter(
    (child) => child.tagName.toLowerCase() === "li"
  );

  return items
    .map((item, index) => {
      const marker = ordered ? `${start + index}.` : "-";
      const contentIndent = indent + " ".repeat(marker.length + 1);
      const { text, nested } = renderListItem(item, contentIndent);
      const [first = "", ...rest] = text.split("\n");
      const firstLine = `${indent}${marker} ${first}`.trimEnd();
      const restLines = rest
        .map((line) => (line ? `${contentIndent}${line}` : ""))
        .join("\n");
      const body = restLines ? `\n${restLines}` : "";
      const nestedBlock = nested.length > 0 ? `\n${nested.join("\n")}` : "";

      return `${firstLine}${body}${nestedBlock}`;
    })
    .join("\n");
}

function renderCell(cell: Element): string {
  return renderInlineChildren(cell)
    .replace(/\\\n/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\|/g, "\\|")
    .trim();
}

function renderTable(table: Element): string {
  const rows = Array.from(table.querySelectorAll("tr"))
    .map((row) =>
      Array.from(row.children)
        .filter((cell) => ["td", "th"].includes(cell.tagName.toLowerCase()))
        .map(renderCell)
    )
    .filter((row) => row.length > 0);

  if (rows.length === 0) return "";

  const columns = Math.max(...rows.map((row) => row.length));
  const padded = rows.map((row) => [...row, ...Array(columns - row.length).fill("")]);
  const [header, ...body] = padded;
  const separator = Array(columns).fill("---");

  return [header, separator, ...body]
    .map((row) => `| ${row.join(" | ")} |`)
    .join("\n");
}

function prefixLines(value: string, prefix: string): string {
  return value
    .split("\n")
    .map((line) => (line.trim() ? `${prefix}${line}` : ">"))
    .join("\n");
}

function renderFlow(node: Node): string {
  if (node.nodeType === TEXT_NODE) return renderInline(node);
  if (node.nodeType !== ELEMENT_NODE) return "";

  const element = node as Element;
  const tag = element.tagName.toLowerCase();

  if (SKIP_TAGS.has(tag)) return "";

  if (/^h[1-6]$/.test(tag)) {
    const level = Number(tag[1]);
    const content = renderInlineChildren(element).trim();

    return content ? `\n\n${"#".repeat(level)} ${content}\n\n` : "";
  }

  switch (tag) {
    case "p": {
      const content = renderInlineChildren(element).trim();
      return content.replace(/[\s\\]/g, "") ? `\n\n${content}\n\n` : "";
    }
    case "br":
      return " ";
    case "hr":
      return "\n\n---\n\n";
    case "pre":
      return `\n\n${renderPre(element)}\n\n`;
    case "ul":
    case "ol":
      return `\n\n${renderList(element, "")}\n\n`;
    case "blockquote": {
      const content = renderFlowChildren(element).trim();
      return content ? `\n\n${prefixLines(content, "> ")}\n\n` : "";
    }
    case "table":
      return `\n\n${renderTable(element)}\n\n`;
    default:
      return FLOW_TAGS.has(tag)
        ? `\n\n${renderFlowChildren(element)}\n\n`
        : renderInline(element);
  }
}

function renderFlowChildren(node: Node): string {
  return Array.from(node.childNodes).map(renderFlow).join("");
}

function normalizeMarkdown(value: string): string {
  return value
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function htmlToMarkdown(root: Node): string {
  return normalizeMarkdown(renderFlowChildren(root));
}
