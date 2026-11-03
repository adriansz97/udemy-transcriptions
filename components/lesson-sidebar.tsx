"use client";

import DownloadPanel from "./download-panel";
import { useI18n } from "@/lib/i18n/context";
import type { Section } from "@/lib/types";

interface LessonSidebarProps {
  section: Section;
  contents: Record<string, string>;
  selectedLessonId: string | null;
  completedCount: number;
  isComplete: boolean;
  downloading: boolean;
  downloadError: string | null;
  onSelect: (lessonId: string) => void;
  onDownload: () => void;
}

export default function LessonSidebar({
  section,
  contents,
  selectedLessonId,
  completedCount,
  isComplete,
  downloading,
  downloadError,
  onSelect,
  onDownload,
}: LessonSidebarProps) {
  const { t } = useI18n();
  const total = section.lessons.length;
  const progress = total === 0 ? 0 : Math.round((completedCount / total) * 100);

  return (
    <aside className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] dark:border-zinc-800 dark:bg-zinc-900">
      <div>
        <p className="text-xs uppercase tracking-wide text-zinc-500">{t.sidebar.section}</p>
        <h2 className="mt-1 text-lg font-semibold leading-snug">{section.title}</h2>

        <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
          <span>{t.sidebar.progress(completedCount, total)}</span>
          <span>{progress}%</span>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <ol className="flex min-h-0 flex-col gap-1 overflow-y-auto pr-1">
        {section.lessons.map((lesson, index) => {
          const complete = Boolean(contents[lesson.id]?.trim());
          const active = lesson.id === selectedLessonId;

          return (
            <li key={lesson.id}>
              <button
                type="button"
                onClick={() => onSelect(lesson.id)}
                aria-current={active ? "true" : undefined}
                className={`flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left text-sm transition ${
                  active
                    ? "bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                    : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800/60"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${
                    complete
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                      : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500"
                  }`}
                >
                  {complete ? "✓" : index + 1}
                </span>
                <span className="min-w-0 break-words">{lesson.title}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <DownloadPanel
        total={total}
        completed={completedCount}
        isComplete={isComplete}
        downloading={downloading}
        error={downloadError}
        onDownload={onDownload}
      />
    </aside>
  );
}
