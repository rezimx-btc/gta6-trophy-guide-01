// Leonida Ledger — entry program for the make.fun trophy-guide bounty.
//
// Copies app/ and screenshots/ from this repository into the output
// directory named by MAKEFUN_OUTPUT_DIR, then writes dossier.json there
// using buildDossier from the vendored kit library.
//
// Runs on Node 22, stdlib only, no network, deterministic: the same
// repository always produces the same output bytes.

import { buildDossier } from "./vendor/makefun-frontend.ts";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.dirname(fileURLToPath(import.meta.url));

const outDir = process.env.MAKEFUN_OUTPUT_DIR;
if (!outDir) {
  console.error("MAKEFUN_OUTPUT_DIR is not set");
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

for (const dir of ["app", "screenshots"]) {
  const src = path.join(repoRoot, dir);
  const dst = path.join(outDir, dir);
  fs.rmSync(dst, { recursive: true, force: true });
  fs.cpSync(src, dst, { recursive: true });
}

const dossier = await buildDossier(repoRoot, { text_max_bytes: 163840 });
const dossierPath = path.join(outDir, "dossier.json");
if (typeof dossier === "string") {
  fs.writeFileSync(dossierPath, dossier);
} else if (dossier instanceof Uint8Array) {
  fs.writeFileSync(dossierPath, dossier);
} else if (dossier !== undefined && dossier !== null) {
  fs.writeFileSync(dossierPath, JSON.stringify(dossier, null, 2) + "\n");
}
console.log(`wrote ${dossierPath}`);
