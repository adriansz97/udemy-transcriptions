"use client";

import { useState } from "react";
import { parseSectionHtml } from "@/lib/parse-section";
import { buttonPrimary, buttonSecondary, cardClass, inputClass } from "@/lib/styles";
import type { LessonType, ParsedSection, Section } from "@/lib/types";

interface SectionImportProps {
  onImport: (section: Section) => void;
}

const TYPE_LABELS: Record<LessonType, string> = {
  video: "Video",
  article: "Artículo",
  other: "Contenido",
};

export default function SectionImport({ onImport }: SectionImportProps) {
  const [html, setHtml] = useState("");
  const [sections, setSections] = useState<ParsedSection[] | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const selected = sections?.[selectedIndex] ?? null;

  function handleAnalyze() {
    const parsed = parseSectionHtml(html);

    if (parsed.length === 0) {
      setSections(null);
      setError(
        "No se encontraron clases. Pega el HTML del currículo de la sección (debe incluir los ítems con su título)."
      );
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
      setError("La sección necesita un título y al menos una clase.");
      return;
    }

    onImport({ title, lessons });
  }

  return (
    <div className={`${cardClass} flex flex-col gap-4`}>
      <div>
        <h2 className="text-lg font-semibold">1. Pega el HTML de la sección</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Copia el panel de la sección desde el currículo de Udemy. Se incluyen videos,
          artículos y otros contenidos; los quizzes se omiten.
        </p>
      </div>

      <textarea
        value={html}
        onChange={(event) => setHtml(event.target.value)}
        rows={12}
        spellCheck={false}
        aria-label="HTML de la sección"
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
          Analizar HTML
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
            Limpiar
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {selected && sections && (
        <div className="flex flex-col gap-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          {sections.length > 1 && (
            <label className="flex flex-col gap-1 text-sm font-medium">
              Sección encontrada
              <select
                value={selectedIndex}
                onChange={(event) => setSelectedIndex(Number(event.target.value))}
                className={inputClass}
              >
                {sections.map((section, index) => (
                  <option key={`${section.title}-${index}`} value={index}>
                    {section.title} ({section.lessons.length} clases)
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="flex flex-col gap-1 text-sm font-medium">
            Título de la sección
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
              <span className="font-medium">Clases ({selected.lessons.length})</span>
              {selected.skipped > 0 && (
                <span className="text-xs text-zinc-500">
                  {selected.skipped}{" "}
                  {selected.skipped === 1 ? "quiz omitido" : "quizzes omitidos"}
                </span>
              )}
            </div>

            <ol className="flex flex-col gap-2">
              {selected.lessons.map((lesson) => (
                <li key={lesson.id} className="flex items-center gap-2">
                  <span className="w-16 shrink-0 text-xs text-zinc-500">
                    {TYPE_LABELS[lesson.type]}
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
                    aria-label={`Nombre de la clase ${lesson.title}`}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveLesson(lesson.id)}
                    className="rounded-lg px-2 py-1 text-sm text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                    aria-label={`Quitar ${lesson.title}`}
                  >
                    Quitar
                  </button>
                </li>
              ))}
            </ol>
          </div>

          <button type="button" onClick={handleConfirm} className={`${buttonPrimary} self-start`}>
            Usar esta sección ({selected.lessons.length} clases)
          </button>
        </div>
      )}
    </div>
  );
}
