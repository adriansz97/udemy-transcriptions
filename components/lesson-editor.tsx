"use client";

import { useEffect, useRef, useState } from "react";
import { ExportIcon, RemoveIcon, TrashIcon } from "./icons";
import { buildMarkdownFileName } from "@/lib/export";
import { downloadMarkdownFile } from "@/lib/download";
import { useI18n } from "@/lib/i18n/context";
import { buildMarkdown } from "@/lib/markdown";
import { parseLessonHtml } from "@/lib/parse-lesson";
import {
  buttonIcon,
  buttonIconDanger,
  buttonPrimary,
  buttonSecondary,
  cardClass,
  inputClass,
} from "@/lib/styles";
import type { Lesson } from "@/lib/types";

interface LessonEditorProps {
  lesson: Lesson;
  value: string | undefined;
  onSave: (lessonId: string, body: string) => void;
  onDelete: (lessonId: string) => void;
  onRemoveLesson?: (lessonId: string) => void;
}

export default function LessonEditor({
  lesson,
  value,
  onSave,
  onDelete,
  onRemoveLesson,
}: LessonEditorProps) {
  const { t } = useI18n();
  const copy = t.editor.types[lesson.type];
  const [mode, setMode] = useState<"view" | "edit">(value ? "view" : "edit");
  const [html, setHtml] = useState("");
  const [draft, setDraft] = useState(value ?? "");
  const [error, setError] = useState<string | null>(null);
  const saveButtonRef = useRef<HTMLButtonElement>(null);
  const autoAnalyzeRef = useRef(false);
  const focusSaveRef = useRef(false);

  const hasSaved = Boolean(value?.trim());

  useEffect(() => {
    if (!focusSaveRef.current) return;
    focusSaveRef.current = false;
    saveButtonRef.current?.focus();
  });

  function analyze(source: string): boolean {
    const parsed = parseLessonHtml(source, lesson.type);

    if (!parsed) {
      setError(t.editor.analyzeError);
      return false;
    }

    setDraft(parsed.markdown);
    setError(null);
    return true;
  }

  function handleAnalyze() {
    analyze(html);
  }

  function handleHtmlChange(nextHtml: string) {
    setHtml(nextHtml);

    if (!autoAnalyzeRef.current) return;
    autoAnalyzeRef.current = false;
    focusSaveRef.current = analyze(nextHtml);
  }

  function handleHtmlPaste() {
    autoAnalyzeRef.current = true;
  }

  function handleSave() {
    const body = draft.trim();

    if (!body) {
      setError(copy.emptyError);
      return;
    }

    onSave(lesson.id, body);
    setMode("view");
    setError(null);
  }

  function handleCancel() {
    setHtml("");
    setDraft(value ?? "");
    setError(null);
    setMode(hasSaved ? "view" : "edit");
  }

  function handleDelete() {
    if (!window.confirm(copy.deleteConfirm(lesson.title))) return;

    onDelete(lesson.id);
    setHtml("");
    setDraft("");
    setError(null);
    setMode("edit");
  }

  function handleRemoveLesson() {
    if (!onRemoveLesson) return;
    if (!window.confirm(t.editor.removeConfirm(lesson.title))) return;

    onRemoveLesson(lesson.id);
  }

  function handleReplace() {
    setHtml("");
    setDraft(value ?? "");
    setError(null);
    setMode("edit");
  }

  function handleExport() {
    downloadMarkdownFile({
      name: buildMarkdownFileName(lesson.title, t.files.untitledFallback),
      content: buildMarkdown(lesson.title, value ?? ""),
    });
  }

  return (
    <div className={`${cardClass} flex flex-col gap-4`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">{copy.label}</p>
          <h2 className="mt-1 text-xl font-semibold leading-snug">{lesson.title}</h2>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            hasSaved
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
          }`}
        >
          {hasSaved ? t.editor.complete : t.editor.pending}
        </span>
      </div>

      {mode === "view" ? (
        <>
          <pre className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap rounded-lg bg-zinc-50 p-4 font-sans text-sm leading-relaxed text-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
            {value}
          </pre>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleExport}
              title={t.editor.exportTitle}
              aria-label={t.editor.exportTitle}
              className={buttonIcon}
            >
              <ExportIcon className="h-5 w-5" />
            </button>
            <button type="button" onClick={handleReplace} className={buttonSecondary}>
              {t.editor.replace}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              title={t.editor.deleteTitle}
              aria-label={t.editor.deleteTitle}
              className={buttonIconDanger}
            >
              <TrashIcon className="h-5 w-5" />
            </button>
            {onRemoveLesson && (
              <button
                type="button"
                onClick={handleRemoveLesson}
                title={t.editor.removeTitle}
                aria-label={t.editor.removeTitle}
                className={buttonIcon}
              >
                <RemoveIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          <label className="flex flex-col gap-1 text-sm font-medium">
            {copy.htmlLabel}
            <textarea
              value={html}
              onChange={(event) => handleHtmlChange(event.target.value)}
              onPaste={handleHtmlPaste}
              rows={8}
              spellCheck={false}
              placeholder={copy.htmlPlaceholder}
              className={`${inputClass} font-mono text-xs`}
            />
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={!html.trim()}
              className={buttonSecondary}
            >
              {t.editor.analyze}
            </button>
            <span className="text-xs text-zinc-500">{copy.analyzeHint}</span>
          </div>

          <label className="flex flex-col gap-1 text-sm font-medium">
            {t.editor.markdownLabel}
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={14}
              spellCheck={false}
              placeholder={copy.markdownPlaceholder}
              className={`${inputClass} leading-relaxed`}
            />
          </label>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <div className="flex flex-wrap gap-2">
            <button
              ref={saveButtonRef}
              type="button"
              onClick={handleSave}
              disabled={!draft.trim()}
              className={buttonPrimary}
            >
              {copy.saveLabel}
            </button>
            {(hasSaved || html || draft) && (
              <button type="button" onClick={handleCancel} className={buttonSecondary}>
                {copy.cancelLabel}
              </button>
            )}
            {hasSaved && (
              <button
                type="button"
                onClick={handleDelete}
                title={t.editor.deleteTitle}
                aria-label={t.editor.deleteTitle}
                className={buttonIconDanger}
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            )}
            {onRemoveLesson && (
              <button
                type="button"
                onClick={handleRemoveLesson}
                title={t.editor.removeTitle}
                aria-label={t.editor.removeTitle}
                className={buttonIcon}
              >
                <RemoveIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
