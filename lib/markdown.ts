export function buildMarkdown(title: string, body: string): string {
  const heading = title.trim();
  const content = body.trim();

  return content ? `# ${heading}\n\n${content}\n` : `# ${heading}\n`;
}
