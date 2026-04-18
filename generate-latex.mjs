#!/usr/bin/env node

/**
 * generate-latex.mjs — LaTeX (.tex) → PDF via pdflatex
 *
 * Usage:
 *   node generate-latex.mjs <input.tex> <output.pdf>
 *
 * Requires: pdflatex (BasicTeX or MacTeX)
 *   brew install basictex   — minimal install (~100MB), enough for Jake's template
 *   brew install --cask mactex — full install (~4GB)
 *
 * Runs pdflatex twice (standard practice for stable references/layout).
 * Cleans up auxiliary files (.aux, .log, .out) after compilation.
 */

import { resolve, dirname, basename } from 'path';
import { mkdirSync, copyFileSync, unlinkSync, existsSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = dirname(fileURLToPath(import.meta.url));

mkdirSync(resolve(__dirname, 'output'), { recursive: true });

async function generatePDF() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: node generate-latex.mjs <input.tex> <output.pdf>');
    process.exit(1);
  }

  const inputPath = resolve(args[0]);
  const outputPath = resolve(args[1]);
  const buildDir = '/tmp/career-ops-latex-build';

  mkdirSync(buildDir, { recursive: true });

  // Verify pdflatex is available
  try {
    await execAsync('which pdflatex');
  } catch {
    console.error('❌ pdflatex not found.');
    console.error('   Install BasicTeX: brew install basictex');
    console.error('   Then restart your terminal and try again.');
    process.exit(1);
  }

  console.log(`📄 Input:  ${inputPath}`);
  console.log(`📁 Output: ${outputPath}`);
  console.log(`🔨 Build:  ${buildDir}`);

  const flags = `-interaction=nonstopmode -output-directory="${buildDir}"`;

  // Run pdflatex twice for stable layout
  for (let pass = 1; pass <= 2; pass++) {
    console.log(`⚙️  pdflatex pass ${pass}/2...`);
    try {
      const { stdout } = await execAsync(
        `pdflatex ${flags} "${inputPath}"`,
        { cwd: buildDir }
      );
      if (pass === 2 && process.env.DEBUG) {
        console.log(stdout);
      }
    } catch (err) {
      // pdflatex exits non-zero even on warnings sometimes — check if PDF was produced
      const inputBase = basename(inputPath, '.tex');
      const builtPdf = `${buildDir}/${inputBase}.pdf`;
      if (!existsSync(builtPdf)) {
        console.error('❌ pdflatex failed. Log output:');
        console.error(err.stdout || err.message);
        process.exit(1);
      }
    }
  }

  // Copy PDF to final output path
  const inputBase = basename(inputPath, '.tex');
  const builtPdf = `${buildDir}/${inputBase}.pdf`;

  if (!existsSync(builtPdf)) {
    console.error('❌ PDF not produced. Check your LaTeX source.');
    process.exit(1);
  }

  copyFileSync(builtPdf, outputPath);

  // Clean up aux files
  for (const ext of ['aux', 'log', 'out', 'pdf']) {
    const f = `${buildDir}/${inputBase}.${ext}`;
    if (existsSync(f)) unlinkSync(f);
  }

  // Estimate page count from PDF (rough heuristic)
  const { readFile } = await import('fs/promises');
  const pdfBytes = await readFile(outputPath);
  const pdfString = pdfBytes.toString('latin1');
  const pageCount = (pdfString.match(/\/Type\s*\/Page[^s]/g) || []).length;

  const sizekb = (pdfBytes.length / 1024).toFixed(1);
  console.log(`✅ PDF generated: ${outputPath}`);
  console.log(`📊 Pages: ${pageCount}`);
  console.log(`📦 Size: ${sizekb} KB`);

  if (pageCount > 1) {
    console.warn(`⚠️  Resume is ${pageCount} pages. One-page target exceeded — trim content.`);
    process.exit(2); // exit 2 = success but over budget (judge step can check this)
  }
}

generatePDF().catch((err) => {
  console.error('❌ LaTeX generation failed:', err.message);
  process.exit(1);
});
