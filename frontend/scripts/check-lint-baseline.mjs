/**
 * Fails CI when eslint error count exceeds the committed baseline.
 *
 * The repo has pre-existing lint errors; the baseline is a ratchet — it never
 * allows a new error but also does not force a bulk cleanup in this phase.
 */
import { readFileSync } from "node:fs";

const BASELINE_ERRORS = 19;

const reportPath = new URL("../eslint-report.json", import.meta.url);
const report = JSON.parse(readFileSync(reportPath, "utf8"));

const errors = report.reduce((sum, file) => sum + file.errorCount, 0);
const warnings = report.reduce((sum, file) => sum + file.warningCount, 0);

console.log(`eslint: ${errors} errors, ${warnings} warnings (baseline ${BASELINE_ERRORS} errors)`);

if (errors > BASELINE_ERRORS) {
  console.error(`FAIL: ${errors} errors exceeds baseline of ${BASELINE_ERRORS}`);
  process.exit(1);
}
