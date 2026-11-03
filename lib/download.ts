import type { MarkdownFile } from "./export";

export function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadMarkdownFile(file: MarkdownFile): void {
  const blob = new Blob([file.content], { type: "text/markdown;charset=utf-8" });
  downloadBlob(file.name, blob);
}
