"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import SectionImport from "./section-import";
import TranscriptEditor from "./transcript-editor";
import VideoSidebar from "./video-sidebar";
import { buildMarkdownFiles, buildZipName } from "@/lib/export";
import { sanitizeFilename } from "@/lib/sanitize";
import { clearWorkspace, loadWorkspace, saveWorkspace } from "@/lib/storage";
import { buttonSecondary } from "@/lib/styles";
import type { Section, WorkspaceState } from "@/lib/types";
import { downloadZip } from "@/lib/zip";

const EMPTY_WORKSPACE: WorkspaceState = { section: null, transcripts: {} };
const subscribeToHydration = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function Workspace() {
  const [workspace, setWorkspace] = useState<WorkspaceState>(
    () => loadWorkspace() ?? EMPTY_WORKSPACE
  );
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
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
  const videos = section?.videos ?? [];
  const completedCount = videos.filter(
    (video) => workspace.transcripts[video.id]?.trim()
  ).length;
  const selectedVideo =
    videos.find((video) => video.id === selectedVideoId) ?? videos[0] ?? null;
  const isComplete = videos.length > 0 && completedCount === videos.length;

  function handleImport(nextSection: Section) {
    setWorkspace({ section: nextSection, transcripts: {} });
    setSelectedVideoId(nextSection.videos[0]?.id ?? null);
    setDownloadError(null);
  }

  function handleSaveTranscript(videoId: string, body: string) {
    const wasComplete = Boolean(workspace.transcripts[videoId]?.trim());
    const transcripts = { ...workspace.transcripts, [videoId]: body };

    setWorkspace((current) => ({ ...current, transcripts }));

    if (!wasComplete) {
      const currentIndex = videos.findIndex((video) => video.id === videoId);
      const ordered = [
        ...videos.slice(currentIndex + 1),
        ...videos.slice(0, currentIndex + 1),
      ];
      const nextPending = ordered.find((video) => !transcripts[video.id]?.trim());

      if (nextPending) setSelectedVideoId(nextPending.id);
    }
  }

  function handleDeleteTranscript(videoId: string) {
    setWorkspace((current) => {
      const transcripts = { ...current.transcripts };
      delete transcripts[videoId];
      return { ...current, transcripts };
    });
  }

  function handleReset() {
    const confirmed = window.confirm(
      "¿Borrar la sección y todas las transcripciones guardadas? Esta acción no se puede deshacer."
    );
    if (!confirmed) return;

    clearWorkspace();
    setWorkspace(EMPTY_WORKSPACE);
    setSelectedVideoId(null);
    setDownloadError(null);
  }

  async function handleDownload() {
    if (!section || !isComplete) return;

    setDownloading(true);
    setDownloadError(null);

    try {
      const files = buildMarkdownFiles(section, workspace.transcripts);
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
            Sección → transcripciones → ZIP con un Markdown por video.
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
          <VideoSidebar
            section={section}
            transcripts={workspace.transcripts}
            selectedVideoId={selectedVideoId}
            completedCount={completedCount}
            isComplete={isComplete}
            downloading={downloading}
            downloadError={downloadError}
            onSelect={setSelectedVideoId}
            onDownload={handleDownload}
          />

          <section>
            {selectedVideo ? (
              <TranscriptEditor
                key={selectedVideo.id}
                video={selectedVideo}
                value={workspace.transcripts[selectedVideo.id]}
                onSave={handleSaveTranscript}
                onDelete={handleDeleteTranscript}
              />
            ) : (
              <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
                Selecciona un video del listado para agregar su transcripción.
              </p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
