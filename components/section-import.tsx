"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { parseSectionHtml } from "@/lib/parse-section";
import { buttonPrimary, buttonSecondary, cardClass, inputClass } from "@/lib/styles";
import type { ParsedSection, Section } from "@/lib/types";

interface SectionImportProps {
  onImport: (section: Section) => void;
}

export default function SectionImport({ onImport }: SectionImportProps) {
  const { t } = useI18n();
  const [html, setHtml] = useState("");
  const [sections, setSections] = useState<ParsedSection[] | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const selected = sections?.[selectedIndex] ?? null;

  function handleAnalyze() {
    const parsed = parseSectionHtml(html, t.import.defaultSectionTitle);

    if (parsed.length === 0) {
      setSections(null);
      setError(t.import.noLessons);
      return;
    }

    setSections(parsed);
    setSelectedIndex(0);
    setError(null);
  }

  function updateSelected(updater: (section: ParsedSection) => ParsedSection) {
    setSections(
      (current) =>
        current?.map((section, index) => (index === selectedIndex ? updater(section) : section)) ??
        null
    );
  }

  function handleRemoveLesson(lessonId: string) {
    updateSelected((section) => ({
      ...section,
      lessons: section.lessons.filter((lesson) => lesson.id !== lessonId),
    }));
  }

  function handleConfirm() {
    if (!selected) return;

    const title = selected.title.trim();
    const lessons = selected.lessons
      .map((lesson) => ({ ...lesson, title: lesson.title.trim() }))
      .filter((lesson) => lesson.title.length > 0);

    if (!title || lessons.length === 0) {
      setError(t.import.missingData);
      return;
    }

    onImport({ title, lessons });
  }

  return (
    <div className={`${cardClass} flex flex-col gap-4`}>
      <div>
        <h2 className="text-lg font-semibold">{t.import.heading}</h2>
        <p className="mt-1 text-sm text-zinc-500">{t.import.description}</p>
      </div>

      <textarea
        value={html}
        onChange={(event) => setHtml(event.target.value)}
        rows={12}
        spellCheck={false}
        aria-label={t.import.htmlLabel}
        placeholder='<div data-purpose="section-panel-2">…</div>'
        className={`${inputClass} font-mono text-xs`}
      />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={!html.trim()}
          className={buttonPrimary}
        >
          {t.import.analyze}
        </button>
        {html && (
          <button
            type="button"
            onClick={() => {
              setHtml("");
              setSections(null);
              setError(null);
            }}
            className={buttonSecondary}
          >
            {t.import.clear}
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {selected && sections && (
        <div className="flex flex-col gap-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          {sections.length > 1 && (
            <label className="flex flex-col gap-1 text-sm font-medium">
              {t.import.foundSection}
              <select
                value={selectedIndex}
                onChange={(event) => setSelectedIndex(Number(event.target.value))}
                className={inputClass}
              >
                {sections.map((section, index) => (
                  <option key={`${section.title}-${index}`} value={index}>
                    {t.import.sectionOption(section.title, section.lessons.length)}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="flex flex-col gap-1 text-sm font-medium">
            {t.import.sectionTitle}
            <input
              value={selected.title}
              onChange={(event) =>
                updateSelected((section) => ({ ...section, title: event.target.value }))
              }
              className={inputClass}
            />
          </label>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                {t.import.lessonsHeading(selected.lessons.length)}
              </span>
              {selected.skipped > 0 && (
                <span className="text-xs text-zinc-500">
                  {t.import.skippedQuizzes(selected.skipped)}
                </span>
              )}
            </div>

            <ol className="flex flex-col gap-2">
              {selected.lessons.map((lesson) => (
                <li key={lesson.id} className="flex items-center gap-2">
                  <span className="w-16 shrink-0 text-xs text-zinc-500">
                    {t.lessonType[lesson.type]}
                  </span>
                  <input
                    value={lesson.title}
                    onChange={(event) =>
                      updateSelected((section) => ({
                        ...section,
                        lessons: section.lessons.map((item) =>
                          item.id === lesson.id ? { ...item, title: event.target.value } : item
                        ),
                      }))
                    }
                    className={inputClass}
                    aria-label={t.import.lessonName(lesson.title)}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveLesson(lesson.id)}
                    className="rounded-lg px-2 py-1 text-sm text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                    aria-label={t.import.removeLesson(lesson.title)}
                  >
                    {t.import.remove}
                  </button>
                </li>
              ))}
            </ol>
          </div>

          <button type="button" onClick={handleConfirm} className={`${buttonPrimary} self-start`}>
            {t.import.useSection(selected.lessons.length)}
          </button>
        </div>
      )}
    </div>
  );
}
