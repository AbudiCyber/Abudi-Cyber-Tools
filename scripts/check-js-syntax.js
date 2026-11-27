"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const ROOT = path.resolve(__dirname, "..");
const IGNORED_DIRECTORIES = new Set([".git", "node_modules"]);
const QUARANTINED_ARTIFACT =
  "legacy/security-hardening-1-8-5.js.incomplete.txt";

function collectJavaScriptFiles(directory, output = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && IGNORED_DIRECTORIES.has(entry.name)) {
      continue;
    }

    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      collectJavaScriptFiles(absolutePath, output);
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      output.push(absolutePath);
    }
  }

  return output;
}

function main() {
  const quarantinedPath = path.join(ROOT, QUARANTINED_ARTIFACT);

  if (!fs.existsSync(quarantinedPath)) {
    throw new Error(
      "Repository integrity failure: the documented quarantined artifact is missing."
    );
  }

  const files = collectJavaScriptFiles(ROOT).sort();
  const failures = [];

  for (const file of files) {
    const relativePath = path.relative(ROOT, file).split(path.sep).join("/");
    const source = fs.readFileSync(file, "utf8");

    try {
      new vm.Script(source, { filename: relativePath });
    } catch (error) {
      failures.push({ file: relativePath, error: error.message });
    }
  }

  if (failures.length > 0) {
    for (const failure of failures) {
      process.stderr.write(
        `[SYNTAX ERROR] ${failure.file}: ${failure.error}\n`
      );
    }

    process.stderr.write(
      `JavaScript syntax validation failed: ${failures.length} of ${files.length} files are invalid.\n`
    );
    process.exitCode = 1;
    return;
  }

  process.stdout.write(
    `JavaScript syntax validation passed: ${files.length} files checked.\n`
  );
  process.stdout.write(
    `[QUARANTINED] ${QUARANTINED_ARTIFACT} is preserved as non-executable historical evidence; see legacy/README.md.\n`
  );
}

main();
