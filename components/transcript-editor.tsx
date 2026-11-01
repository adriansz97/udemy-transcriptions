"use client";

import { useState } from "react";
import { parseTranscriptHtml } from "@/lib/parse-transcript";
import {
  buttonDanger,
  buttonPrimary,
  buttonSecondary,
  cardClass,
  inputClass,
} from "@/lib/styles";
import type { VideoItem } from "@/lib/types";

interface TranscriptEditorProps {
  video: VideoItem;
  value: string | undefined;
  onSave: (videoId: string, body: string) => void;
  onDelete: (videoId: string) => void;
}

export default function TranscriptEditor({
  video,
  value,
  onSave,
  onDelete,
}: TranscriptEditorProps) {
  const [mode, setMode] = useState<"view" | "edit">(value ? "view" : "edit");
  const [html, setHtml] = useState("");
  const [draft, setDraft] = useState(value ?? "");
  const [error, setError] = useState<string | null>(null);

  const hasSaved = Boolean(value?.trim());

  function handleAnalyze() {
    const parsed = parseTranscriptHtml(html);

    if (parsed.cues.length === 0) {
      setError(
        "No se encontraron cues de transcripción en el HTML. Revisa que hayas pegado el panel completo."
      );
      return;
    }

    setDraft(parsed.text);
    setError(null);
  }

  function handleSave() {
    const body = draft.trim();

    if (!body) {
      setError("La transcripción está vacía.");
      return;
    }

    onSave(video.id, body);
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
    if (!window.confirm(`¿Borrar la transcripción de "${video.title}"?`)) return;

    onDelete(video.id);
    setHtml("");
    setDraft("");
    setError(null);
    setMode("edit");
  }

  function handleReplace() {
    setHtml("");
    setDraft(value ?? "");
    setError(null);
    setMode("edit");
  }

  return (
    <div className={`${cardClass} flex flex-col gap-4`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">Transcripción</p>
          <h2 className="mt-1 text-xl font-semibold leading-snug">{video.title}</h2>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            hasSaved
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
          }`}
        >
          {hasSaved ? "Completado" : "Pendiente"}
        </span>
      </div>

      {mode === "view" ? (
        <>
          <pre className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap rounded-lg bg-zinc-50 p-4 font-sans text-sm leading-relaxed text-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
            {value}
          </pre>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={handleReplace} className={buttonSecondary}>
              Reemplazar
            </button>
            <button type="button" onClick={handleDelete} className={buttonDanger}>
              Eliminar
            </button>
          </div>
        </>
      ) : (
        <>
          <label className="flex flex-col gap-1 text-sm font-medium">
            HTML de la transcripción
            <textarea
              value={html}
              onChange={(event) => setHtml(event.target.value)}
              rows={8}
              spellCheck={false}
              placeholder='<div data-purpose="transcript-panel">…</div>'
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
              Analizar HTML
            </button>
            <span className="text-xs text-zinc-500">
              Se descartan los timestamps y se unen los cues en párrafos.
            </span>
          </div>

          <label className="flex flex-col gap-1 text-sm font-medium">
            Markdown
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={14}
              spellCheck={false}
              placeholder="Pega el HTML y pulsa Analizar, o escribe el Markdown directamente."
              className={`${inputClass} leading-relaxed`}
            />
          </label>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={!draft.trim()}
              className={buttonPrimary}
            >
              Guardar transcripción
            </button>
            {(hasSaved || html || draft) && (
              <button type="button" onClick={handleCancel} className={buttonSecondary}>
                Cancelar
              </button>
            )}
            {hasSaved && (
              <button type="button" onClick={handleDelete} className={buttonDanger}>
                Eliminar
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
