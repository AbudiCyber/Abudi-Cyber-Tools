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
  const input = window.document.getElementById("textInput");
  const result = window.document.getElementById("textAnalyzerResult");
  window.eval(script + "\nwindow.__textState = () => lastTextAnalysisResult;");

  input.value = "  alpha  beta  ";
  window.analyzeText();
  assert.match(result.textContent, /Characters: 15/);
  assert.match(result.textContent, /Words: 2/);
  assert.match(result.textContent, /Whitespace: 6/);
  assert.match(window.__textState(), /Characters: 15/);

  input.value = "A😀B";
  window.analyzeText();
  assert.match(result.textContent, /Characters: 3/);
  assert.match(result.textContent, /Symbols: 1/);

  input.value = "١٢٣";
  window.analyzeText();
  assert.match(result.textContent, /Numbers: 3/);
  assert.match(result.textContent, /Symbols: 0/);

  input.value = "first\r\nsecond\rthird\nfourth";
  window.analyzeText();
  assert.match(result.textContent, /Lines: 4/);
  assert.match(result.textContent, /Words: 4/);

  input.value = " \t\r\n ";
  window.analyzeText();
  assert.match(result.textContent, /Please enter text first/);
  assert.equal(window.__textState(), "");

  input.value = "x".repeat(5000);
  window.analyzeText();
  assert.match(result.textContent, /Characters: 5000/);
  assert.equal(window.__textState().includes("Characters: 5000"), true);

  input.value = "x".repeat(5001);
  window.analyzeText();
  assert.match(result.textContent, /Maximum supported length is 5000 Unicode characters/);
  assert.equal(window.__textState(), "");

  input.value = '<img src=x onerror="alert(1)">';
  window.analyzeText();
  assert.equal(result.querySelector("img"), null, "User text must be rendered as text.");
  assert.doesNotMatch(result.textContent, /alert\\(1\\)/, "Raw HTML input must never be reflected into the result.");

  window.clearTextAnalysisResult();
  assert.equal(input.value, "");
  assert.match(result.textContent, /Waiting for text input/);
  assert.equal(window.__textState(), "");

  console.log("Text analyzer Unicode and whitespace regression test: PASS");
} finally {
  dom.window.close();
}
