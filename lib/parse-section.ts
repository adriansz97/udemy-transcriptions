import type { Lesson, LessonType, ParsedSection } from "./types";

const SECTION_PANEL_SELECTOR = '[data-purpose^="section-panel"]';
const SECTION_HEADING_SELECTOR = '[data-purpose="section-heading"]';
const SECTION_TITLE_SELECTOR = ".ud-accordion-panel-title";
const ITEM_SELECTOR = '[data-purpose^="curriculum-item"]';
const ITEM_TITLE_SELECTOR = '[data-purpose="item-title"]';
const METADATA_ICON_SELECTOR = '[class*="curriculum-item-link--metadata"] use';
const XLINK_NAMESPACE = "http://www.w3.org/1999/xlink";
const IGNORED_ICONS = new Set(["icon-tick", "icon-check", "icon-expand", "icon-collapse"]);

type DetectedType = LessonType | "quiz";

interface DetectedItem extends Omit<Lesson, "type"> {
  type: DetectedType;
}

function normalizeText(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function readIconHref(icon: Element): string {
  return (
    icon.getAttribute("xlink:href") ??
    icon.getAttribute("href") ??
    icon.getAttributeNS(XLINK_NAMESPACE, "href") ??
    ""
  );
}

function getIconHref(item: Element): string {
  const icons = [
    ...Array.from(item.querySelectorAll(METADATA_ICON_SELECTOR)),
    ...Array.from(item.querySelectorAll("use")),
  ];

  for (const icon of icons) {
    const href = readIconHref(icon);
    if (href && !IGNORED_ICONS.has(href.replace(/^#/, ""))) return href;
  }

  return "";
}

function toDetectedType(iconHref: string): DetectedType {
  const icon = iconHref.replace(/^#/, "");

  if (icon === "icon-video") return "video";
  if (icon === "icon-article") return "article";
  if (icon.includes("quiz") || icon.includes("question")) return "quiz";
  return "other";
}

function readItems(itemElements: Element[], sectionIndex: number): DetectedItem[] {
  return itemElements
    .map((item, itemIndex): DetectedItem | null => {
      const title = normalizeText(item.querySelector(ITEM_TITLE_SELECTOR)?.textContent);
      if (!title) return null;

      return {
        id: `lesson-${sectionIndex}-${itemIndex}`,
        title,
        type: toDetectedType(getIconHref(item)),
      };
    })
    .filter((item): item is DetectedItem => item !== null);
}

function toLesson(item: DetectedItem, hasIcons: boolean): Lesson {
  const type: LessonType = hasIcons && item.type !== "quiz" ? item.type : "video";

  return { id: item.id, title: item.title, type };
}

function readSection(panel: Element, index: number): ParsedSection | null {
  const titleElement =
    panel.querySelector(`${SECTION_HEADING_SELECTOR} ${SECTION_TITLE_SELECTOR}`) ??
    panel.querySelector(SECTION_TITLE_SELECTOR);
  const title = normalizeText(titleElement?.textContent) || `Sección ${index + 1}`;

  const itemElements = Array.from(panel.querySelectorAll(ITEM_SELECTOR));
  const detectedItems = readItems(itemElements, index);
  if (detectedItems.length === 0) return null;

  // Sin iconos no se puede distinguir el tipo ni detectar quizzes: se asume video.
  const hasIcons = itemElements.some((item) => getIconHref(item) !== "");

  const lessons = detectedItems
    .filter((item) => !hasIcons || item.type !== "quiz")
    .map((item) => toLesson(item, hasIcons));

  if (lessons.length === 0) return null;

  return { title, lessons, skipped: detectedItems.length - lessons.length };
}

export function parseSectionHtml(html: string): ParsedSection[] {
  const doc = new DOMParser().parseFromString(html, "text/html");
  let panels = Array.from(doc.querySelectorAll(SECTION_PANEL_SELECTOR));

  if (panels.length === 0 && doc.querySelector(ITEM_SELECTOR)) {
    panels = [doc.body];
  }

  return panels
    .map((panel, index) => readSection(panel, index))
    .filter((section): section is ParsedSection => section !== null);
}
