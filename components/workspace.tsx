"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import LessonEditor from "./lesson-editor";
import LessonSidebar from "./lesson-sidebar";
import SectionImport from "./section-import";
import { buildMarkdownFiles, buildZipName } from "@/lib/export";
import { sanitizeFilename } from "@/lib/sanitize";
import { clearWorkspace, loadWorkspace, saveWorkspace } from "@/lib/storage";
import { buttonSecondary } from "@/lib/styles";
import type { Section, WorkspaceState } from "@/lib/types";
import { downloadZip } from "@/lib/zip";

const EMPTY_WORKSPACE: WorkspaceState = { section: null, contents: {} };
const subscribeToHydration = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function Workspace() {
  const [workspace, setWorkspace] = useState<WorkspaceState>(
    () => loadWorkspace() ?? EMPTY_WORKSPACE
  );
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    getClientSnapshot,
    getServerSnapshot
  );

  useEffect(() => {
    if (hydrated) saveWorkspace(workspace);
  }, [workspace, hydrated]);

  const section = workspace.section;
  const lessons = section?.lessons ?? [];
  const completedCount = lessons.filter(
    (lesson) => workspace.contents[lesson.id]?.trim()
  ).length;
  const selectedLesson =
    lessons.find((lesson) => lesson.id === selectedLessonId) ?? lessons[0] ?? null;
  const isComplete = lessons.length > 0 && completedCount === lessons.length;

  function handleImport(nextSection: Section) {
    setWorkspace({ section: nextSection, contents: {} });
    setSelectedLessonId(nextSection.lessons[0]?.id ?? null);
    setDownloadError(null);
  }

  function handleSaveContent(lessonId: string, body: string) {
    const wasComplete = Boolean(workspace.contents[lessonId]?.trim());
    const contents = { ...workspace.contents, [lessonId]: body };

    setWorkspace((current) => ({ ...current, contents }));

    if (!wasComplete) {
      const currentIndex = lessons.findIndex((lesson) => lesson.id === lessonId);
      const ordered = [
        ...lessons.slice(currentIndex + 1),
        ...lessons.slice(0, currentIndex + 1),
      ];
      const nextPending = ordered.find((lesson) => !contents[lesson.id]?.trim());

      if (nextPending) setSelectedLessonId(nextPending.id);
    }
  }

  function handleDeleteContent(lessonId: string) {
    setWorkspace((current) => {
      const contents = { ...current.contents };
      delete contents[lessonId];
      return { ...current, contents };
    });
  }

  function handleRemoveLessonFromSection(lessonId: string) {
    setWorkspace((current) => {
      const section = current.section;
      if (!section) return current;

      const remainingLessons = section.lessons.filter((lesson) => lesson.id !== lessonId);
      const contents = { ...current.contents };
      delete contents[lessonId];

      if (remainingLessons.length === 0) {
        clearWorkspace();
        setSelectedLessonId(null);
        setDownloadError(null);
        return EMPTY_WORKSPACE;
      }

      if (selectedLessonId === lessonId) {
        setSelectedLessonId(remainingLessons[0]?.id ?? null);
      }

      return {
        section: { ...section, lessons: remainingLessons },
        contents,
      };
    });
  }

  function handleReset() {
    const confirmed = window.confirm(
      "¿Borrar la sección y todos los contenidos guardados? Esta acción no se puede deshacer."
    );
    if (!confirmed) return;

    clearWorkspace();
    setWorkspace(EMPTY_WORKSPACE);
    setSelectedLessonId(null);
    setDownloadError(null);
  }

  async function handleDownload() {
    if (!section || !isComplete) return;

    setDownloading(true);
    setDownloadError(null);

    try {
      const files = buildMarkdownFiles(section, workspace.contents);
      await downloadZip(
        buildZipName(section.title),
        sanitizeFilename(section.title, "seccion"),
        files
      );
    } catch {
      setDownloadError("No se pudo generar el ZIP. Inténtalo de nuevo.");
    } finally {
      setDownloading(false);
    }
  }

  if (!hydrated) {
    return <p className="py-10 text-sm text-zinc-500">Cargando…</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Transcripciones Udemy</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Sección → transcripciones y artículos → ZIP con un Markdown por clase.
          </p>
        </div>

        {section && (
          <button type="button" onClick={handleReset} className={buttonSecondary}>
            Nueva sección
          </button>
        )}
      </header>

      {!section ? (
        <SectionImport onImport={handleImport} />
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <LessonSidebar
            section={section}
            contents={workspace.contents}
            selectedLessonId={selectedLesson?.id ?? null}
            completedCount={completedCount}
            isComplete={isComplete}
            downloading={downloading}
            downloadError={downloadError}
            onSelect={setSelectedLessonId}
            onDownload={handleDownload}
          />

          <section>
            {selectedLesson ? (
              <LessonEditor
                key={selectedLesson.id}
                lesson={selectedLesson}
                value={workspace.contents[selectedLesson.id]}
                onSave={handleSaveContent}
                onDelete={handleDeleteContent}
                onRemoveLesson={handleRemoveLessonFromSection}
              />
            ) : (
              <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
                Selecciona una clase del listado para agregar su contenido.
              </p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
