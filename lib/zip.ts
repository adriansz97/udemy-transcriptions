import { zip } from "fflate";
import { downloadBlob } from "./download";
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
  downloadBlob(zipName, new Blob([new Uint8Array(data)], { type: "application/zip" }));
}
