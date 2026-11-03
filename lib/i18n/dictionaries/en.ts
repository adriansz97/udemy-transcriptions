import type { LessonType } from "../../types";
import type { Dictionary } from "./es";

interface LessonCopy {
  label: string;
  htmlLabel: string;
  htmlPlaceholder: string;
  analyzeHint: string;
  markdownPlaceholder: string;
  emptyError: string;
  saveLabel: string;
  cancelLabel: string;
  deleteConfirm: (title: string) => string;
}

const lessonCopy: Record<LessonType, LessonCopy> = {
  video: {
    label: "Transcript",
    htmlLabel: "Transcript HTML",
    htmlPlaceholder: '<div data-purpose="transcript-panel">…</div>',
    analyzeHint: "Timestamps are dropped and cues are merged into paragraphs.",
    markdownPlaceholder: "Paste the HTML and click Analyze, or write Markdown directly.",
    emptyError: "The transcript is empty.",
    saveLabel: "Save transcript",
    cancelLabel: "Cancel",
    deleteConfirm: (title) => `Delete the transcript content for "${title}"?`,
  },
  article: {
    label: "Article / note",
    htmlLabel: "Article or note HTML",
    htmlPlaceholder:
      '<div data-purpose="safely-set-inner-html:rich-text-viewer:html">…</div>',
    analyzeHint: "Headings, lists, bold text, links and code blocks are kept.",
    markdownPlaceholder: "Paste the article HTML and click Analyze, or write Markdown.",
    emptyError: "The article is empty.",
    saveLabel: "Save article",
    cancelLabel: "Cancel",
    deleteConfirm: (title) => `Delete the article content for "${title}"?`,
  },
  other: {
    label: "Content",
    htmlLabel: "Content HTML",
    htmlPlaceholder:
      '<div data-purpose="safely-set-inner-html:rich-text-viewer:html">…</div>',
    analyzeHint: "It automatically detects whether it is a transcript or an article.",
    markdownPlaceholder: "Paste the HTML and click Analyze, or write Markdown directly.",
    emptyError: "The content is empty.",
    saveLabel: "Save content",
    cancelLabel: "Cancel",
    deleteConfirm: (title) => `Delete the content of "${title}"?`,
  },
};

const plural = (count: number, singular: string, plural: string) =>
  `${count} ${count === 1 ? singular : plural}`;

export const en: Dictionary = {
  app: {
    title: "Udemy Transcripts",
    tagline: "Section → transcripts and articles → ZIP with one Markdown file per lesson.",
  },
  language: {
    label: "Language",
    es: "Spanish",
    en: "English",
  },
  header: {
    newSection: "New section",
  },
  import: {
    heading: "1. Paste the section HTML",
    description:
      "Copy the section panel from the Udemy curriculum. Videos, articles and other content are included; quizzes are skipped.",
    htmlLabel: "Section HTML",
    analyze: "Analyze HTML",
    clear: "Clear",
    noLessons:
      "No lessons found. Paste the section curriculum HTML (it must include the items with their titles).",
    missingData: "The section needs a title and at least one lesson.",
    foundSection: "Section found",
    sectionOption: (title, count) => `${title} (${plural(count, "lesson", "lessons")})`,
    sectionTitle: "Section title",
    lessonsHeading: (count) => `Lessons (${count})`,
    skippedQuizzes: (count) =>
      count === 1 ? "1 quiz skipped" : `${count} quizzes skipped`,
    lessonName: (title) => `Lesson name ${title}`,
    remove: "Remove",
    removeLesson: (title) => `Remove ${title}`,
    useSection: (count) => `Use this section (${plural(count, "lesson", "lessons")})`,
    defaultSectionTitle: (index) => `Section ${index + 1}`,
  },
  lessonType: {
    video: "Video",
    article: "Article",
    other: "Content",
  },
  editor: {
    analyze: "Analyze HTML",
    analyzeError: "No content found in the HTML. Check that you pasted the full panel.",
    markdownLabel: "Markdown",
    complete: "Complete",
    pending: "Pending",
    replace: "Replace",
    exportTitle: "Download .md",
    deleteTitle: "Delete content",
    removeTitle: "Remove from section",
    removeConfirm: (title) =>
      `Remove "${title}" from this section? It will be removed from the list and excluded from the ZIP. This action cannot be undone.`,
    types: lessonCopy,
  },
  sidebar: {
    section: "Section",
    progress: (completed, total) =>
      `${completed} of ${plural(total, "lesson", "lessons")}`,
  },
  download: {
    button: "Download .zip",
    generating: "Generating ZIP…",
    ready: "All set: a folder with one .md per lesson.",
    missing: (count) =>
      count === 1
        ? "1 lesson left to complete before downloading."
        : `${count} lessons left to complete before downloading.`,
    error: "The ZIP could not be generated. Try again.",
  },
  workspace: {
    selectLesson: "Select a lesson from the list to add its content.",
    resetConfirm:
      "Delete the section and all saved content? This action cannot be undone.",
  },
  files: {
    sectionFallback: "section",
    untitledFallback: "untitled",
  },
};
