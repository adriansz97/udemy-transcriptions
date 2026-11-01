const INVALID_FILENAME_CHARS = /[<>:"/\\|?*\u0000-\u001F\u007F]/g;
const TRAILING_DOTS_OR_SPACES = /[. ]+$/;
const MAX_FILENAME_LENGTH = 100;

export function sanitizeFilename(value: string, fallback = "sin-titulo"): string {
  const cleaned = value
    .normalize("NFC")
    .replace(INVALID_FILENAME_CHARS, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(TRAILING_DOTS_OR_SPACES, "")
    .slice(0, MAX_FILENAME_LENGTH)
    .replace(TRAILING_DOTS_OR_SPACES, "");

  return cleaned || fallback;
}

export function uniqueName(baseName: string, used: Set<string>): string {
  let candidate = baseName;
  let suffix = 2;

  while (used.has(candidate.toLocaleLowerCase())) {
    candidate = `${baseName} (${suffix})`;
    suffix += 1;
  }

  used.add(candidate.toLocaleLowerCase());
  return candidate;
}
