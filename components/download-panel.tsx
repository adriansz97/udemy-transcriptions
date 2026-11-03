"use client";

import { buttonPrimary } from "@/lib/styles";

interface DownloadPanelProps {
  total: number;
  completed: number;
  isComplete: boolean;
  downloading: boolean;
  error: string | null;
  onDownload: () => void;
}

export default function DownloadPanel({
  total,
  completed,
  isComplete,
  downloading,
  error,
  onDownload,
}: DownloadPanelProps) {
  const missing = total - completed;

  return (
    <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
      <button
        type="button"
        onClick={onDownload}
        disabled={!isComplete || downloading}
        className={`${buttonPrimary} w-full`}
      >
        {downloading ? "Generando ZIP…" : "Descargar .zip"}
      </button>

      <p className="mt-2 text-xs text-zinc-500">
        {isComplete
          ? "Todo listo: una carpeta con un .md por clase."
          : `Faltan ${missing} clase${missing === 1 ? "" : "s"} por completar para descargar.`}
      </p>

      {error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
