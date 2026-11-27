const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const script = fs.readFileSync(path.join(root, "script.js"), "utf8");

const dom = new JSDOM(html, { runScripts: "outside-only", url: "https://example.test/" });
try {
  const { window } = dom;
  const input = window.document.getElementById("linkInput");
  const result = window.document.getElementById("linkAnalyzerResult");
  window.eval(script + "\nwindow.__linkState = () => lastLinkAnalysisResult;");

  input.value = "example.com";
  window.analyzeLink();
  assert.match(result.textContent, /No obvious heuristic indicators/);
  assert.doesNotMatch(result.textContent, /Safe-looking Link|Safe Link/);
  assert.match(result.textContent, /No result proves a URL is safe/);

  input.value = "HTTPS://example.com/path";
  window.analyzeLink();
  assert.match(result.textContent, /No obvious heuristic indicators/);

  input.value = "http://example.com";
  window.analyzeLink();
  assert.match(result.textContent, /Potentially suspicious indicators/);

  input.value = "example.com:8443/path";
  window.analyzeLink();
  assert.match(result.textContent, /Non-standard port/);

  input.value = "https://user:secret@example.com";
  window.analyzeLink();
  assert.match(result.textContent, /Embedded credentials/);

  input.value = "https://login.example.com";
  window.analyzeLink();
  assert.match(result.textContent, /Suspicious keywords/);

  input.value = "https://localhost";
  window.analyzeLink();
  assert.match(result.textContent, /Single-label hostname/);

  for (const unsupported of ["ftp://example.com", "javascript:alert(1)", "mailto:user@example.com", "https://"]) {
    input.value = unsupported;
    window.analyzeLink();
    assert.match(result.textContent, /unsupported URL scheme|Invalid URL/i, unsupported);
    assert.equal(window.__linkState(), "");
  }

  const payload = 'https://example.com/<img src=x onerror="alert(1)">';
  input.value = payload;
  window.analyzeLink();
  assert.equal(result.querySelector("img"), null, "Untrusted URL input must remain text.");
  assert.ok(result.textContent.includes(payload));

  window.clearLinkAnalysisResult();
  assert.equal(input.value, "");
  assert.match(result.textContent, /Waiting for link input/);
  assert.equal(window.__linkState(), "");

  console.log("Link analyzer scope regression test: PASS");
} finally {
  dom.window.close();
}
