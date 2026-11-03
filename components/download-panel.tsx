"use client";

import { useI18n } from "@/lib/i18n/context";
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
  const { t } = useI18n();
  const missing = total - completed;

  return (
    <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
      <button
        type="button"
        onClick={onDownload}
        disabled={!isComplete || downloading}
        className={`${buttonPrimary} w-full`}
      >
        {downloading ? t.download.generating : t.download.button}
      </button>

      <p className="mt-2 text-xs text-zinc-500">
        {isComplete ? t.download.ready : t.download.missing(missing)}
      </p>

      {error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
