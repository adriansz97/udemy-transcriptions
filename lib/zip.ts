import { zip } from "fflate";
import type { MarkdownFile } from "./export";

export function createZip(folderName: string, files: MarkdownFile[]): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const entries: Record<string, Uint8Array> = {};

  for (const file of files) {
    entries[`${folderName}/${file.name}`] = encoder.encode(file.content);
  }

  return new Promise((resolve, reject) => {
    zip(entries, { level: 6 }, (error, data) => {
      if (error) reject(error);
      else resolve(data);
    });
  });
}

export async function downloadZip(
  zipName: string,
  folderName: string,
  files: MarkdownFile[]
): Promise<void> {
  const data = await createZip(folderName, files);
  const blob = new Blob([new Uint8Array(data)], { type: "application/zip" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = zipName;
  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
