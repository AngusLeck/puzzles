// One-off: split legacy/puzzles.js into one TypeScript module per puzzle.
// Kept for the record; the generated files under src/puzzles/data are now the
// source of truth and are edited by hand.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import vm from "node:vm";

const src = readFileSync(new URL("../legacy/puzzles.js", import.meta.url), "utf8");
const sandbox = { window: {} };
vm.runInNewContext(src, sandbox);
const puzzles = sandbox.window.PUZZLES;

const ident = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
function ser(v, indent) {
  const pad = "  ".repeat(indent),
    pad1 = "  ".repeat(indent + 1);
  if (Array.isArray(v)) {
    if (!v.length) return "[]";
    const flat = v.every((x) => typeof x !== "object");
    const items = v.map((x) => ser(x, indent + 1));
    const inline = `[${items.join(", ")}]`;
    if (flat && inline.length + pad.length < 96) return inline;
    return `[\n${items.map((s) => pad1 + s).join(",\n")},\n${pad}]`;
  }
  if (v && typeof v === "object") {
    const entries = Object.entries(v).map(
      ([k, x]) => `${ident.test(k) ? k : JSON.stringify(k)}: ${ser(x, indent + 1)}`,
    );
    const inline = `{ ${entries.join(", ")} }`;
    if (inline.length + pad.length < 96 && !inline.includes("\n")) return inline;
    return `{\n${entries.map((s) => pad1 + s).join(",\n")},\n${pad}}`;
  }
  return JSON.stringify(v);
}

mkdirSync(new URL("../src/puzzles/data", import.meta.url), { recursive: true });
const names = [];
for (const p of puzzles) {
  const file = `${p.id}.ts`;
  names.push(p.id);
  writeFileSync(
    new URL(`../src/puzzles/data/${file}`, import.meta.url),
    `import { definePuzzle } from "../schema";\n\nexport default definePuzzle(${ser(p, 0)});\n`,
  );
}
console.log(names.join("\n"));
