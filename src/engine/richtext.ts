/**
 * Author markup for prompts: `^{…}` → superscript, `_{…}` → subscript.
 * Everything downstream (highlighting, rendering) works on the *display*
 * string, so hint substrings are written against the text as it reads.
 */
export type ScriptTag = "sup" | "sub" | null;

export interface RichText {
  display: string;
  runs: [start: number, end: number, tag: Exclude<ScriptTag, null>][];
}

export function parseRichText(src: string): RichText {
  let display = "";
  const runs: RichText["runs"] = [];
  const re = /([\^_])\{([^}]*)\}/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(src))) {
    display += src.slice(last, match.index);
    const start = display.length;
    display += match[2] ?? "";
    runs.push([start, display.length, match[1] === "^" ? "sup" : "sub"]);
    last = re.lastIndex;
  }
  display += src.slice(last);
  return { display, runs };
}

export interface PromptSegment {
  text: string;
  tag: ScriptTag;
  marked: boolean;
}

/**
 * Split the prompt into renderable segments, marking (case-insensitively) the
 * first occurrence of each highlight substring. Pure: the view turns segments
 * into <mark>/<sup>/<sub> elements without any innerHTML.
 */
export function segmentPrompt(src: string, marks: readonly string[]): PromptSegment[] {
  const { display, runs } = parseRichText(src);
  const lower = display.toLowerCase();
  const marked = new Array<boolean>(display.length).fill(false);
  for (const mark of marks) {
    const needle = String(mark).toLowerCase();
    if (!needle) continue;
    const idx = lower.indexOf(needle);
    if (idx >= 0) for (let i = idx; i < idx + needle.length; i++) marked[i] = true;
  }
  const tags = new Array<ScriptTag>(display.length).fill(null);
  for (const [start, end, tag] of runs) for (let i = start; i < end; i++) tags[i] = tag;

  const out: PromptSegment[] = [];
  let i = 0;
  while (i < display.length) {
    const tag = tags[i] ?? null;
    const isMarked = marked[i] ?? false;
    let j = i;
    while (j < display.length && tags[j] === tag && marked[j] === isMarked) j++;
    out.push({ text: display.slice(i, j), tag, marked: isMarked });
    i = j;
  }
  return out;
}
