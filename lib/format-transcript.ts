const MIN_PARAGRAPH_LENGTH = 280;
const MAX_PARAGRAPH_LENGTH = 800;
const SENTENCE_END = /[.!?…]["'”’)\]]?$/;

export function cuesToParagraphs(cues: string[]): string[] {
  const paragraphs: string[] = [];
  let current = "";

  const flush = () => {
    if (current) paragraphs.push(current);
    current = "";
  };

  for (const cue of cues) {
    const text = cue.trim();
    if (!text) continue;

    current = current ? `${current} ${text}` : text;
    const longEnough = current.length >= MIN_PARAGRAPH_LENGTH;

    if ((longEnough && SENTENCE_END.test(current)) || current.length >= MAX_PARAGRAPH_LENGTH) {
      flush();
    }
  }

  flush();
  return paragraphs;
}
