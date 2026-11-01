"use client";

import { useState } from "react";
import { parseSectionHtml } from "@/lib/parse-section";
import { buttonPrimary, buttonSecondary, cardClass, inputClass } from "@/lib/styles";
import type { ParsedSection, Section } from "@/lib/types";

interface SectionImportProps {
  onImport: (section: Section) => void;
}

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
        "No se encontraron videos. Pega el HTML del currículo de la sección (debe incluir los ítems con su título)."
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

  function handleRemoveVideo(videoId: string) {
    updateSelected((section) => ({
      ...section,
      videos: section.videos.filter((video) => video.id !== videoId),
    }));
  }

  function handleConfirm() {
    if (!selected) return;

    const title = selected.title.trim();
    const videos = selected.videos
      .map((video) => ({ ...video, title: video.title.trim() }))
      .filter((video) => video.title.length > 0);

    if (!title || videos.length === 0) {
      setError("La sección necesita un título y al menos un video.");
      return;
    }

    onImport({ title, videos });
  }

  return (
    <div className={`${cardClass} flex flex-col gap-4`}>
      <div>
        <h2 className="text-lg font-semibold">1. Pega el HTML de la sección</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Copia el panel de la sección desde el currículo de Udemy. Solo se incluyen los videos;
          artículos y quizzes se omiten.
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
                    {section.title} ({section.videos.length} videos)
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
              <span className="font-medium">Videos ({selected.videos.length})</span>
              {selected.skipped > 0 && (
                <span className="text-xs text-zinc-500">
                  {selected.skipped} ítem{selected.skipped === 1 ? "" : "s"} omitido
                  {selected.skipped === 1 ? "" : "s"} (no es video)
                </span>
              )}
            </div>

            <ol className="flex flex-col gap-2">
              {selected.videos.map((video) => (
                <li key={video.id} className="flex items-center gap-2">
                  <input
                    value={video.title}
                    onChange={(event) =>
                      updateSelected((section) => ({
                        ...section,
                        videos: section.videos.map((item) =>
                          item.id === video.id ? { ...item, title: event.target.value } : item
                        ),
                      }))
                    }
                    className={inputClass}
                    aria-label={`Nombre del video ${video.title}`}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveVideo(video.id)}
                    className="rounded-lg px-2 py-1 text-sm text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                    aria-label={`Quitar ${video.title}`}
                  >
                    Quitar
                  </button>
                </li>
              ))}
            </ol>
          </div>

          <button type="button" onClick={handleConfirm} className={`${buttonPrimary} self-start`}>
            Usar esta sección ({selected.videos.length} videos)
          </button>
        </div>
      )}
    </div>
  );
}
