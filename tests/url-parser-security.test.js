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
  const input = window.document.getElementById("urlParserInput");
  const result = window.document.getElementById("urlParserResult");
  window.eval(script + "\nwindow.__urlParserState = () => lastUrlParserResult;");

  input.value = "example.com/path?q=hello#section";
  window.parseURL();
  assert.match(window.__urlParserState(), /Normalized URL: https:\/\/example\.com\/path\?q=hello#section/);
  assert.match(window.__urlParserState(), /Protocol: https:/);
  assert.match(window.__urlParserState(), /Hostname: example.com/);
  assert.match(window.__urlParserState(), /Credentials: None/);

  input.value = "http://example.com:8080/a";
  window.parseURL();
  assert.match(window.__urlParserState(), /Protocol: http:/);
  assert.match(window.__urlParserState(), /Port: 8080/);

  input.value = "localhost:3000/health";
  window.parseURL();
  assert.match(window.__urlParserState(), /Normalized URL: https:\/\/localhost:3000\/health/);

  input.value = "https://alice:super-secret@example.com/private?key=visible";
  window.parseURL();
  assert.match(window.__urlParserState(), /Credentials: Present \(redacted\)/);
  assert.doesNotMatch(window.__urlParserState(), /alice|super-secret/);
  assert.doesNotMatch(result.textContent, /alice|super-secret/);
  assert.match(window.__urlParserState(), /key=visible/, "Query values remain visible as parser output.");

  for (const invalid of [
    "ftp://example.com",
    "javascript:alert(1)",
    "mailto:user@example.com",
    "https://",
    "https://example.com:99999",
    "https://exa mple.com",
    "https://example.com\\u0001.evil"
  ]) {
    input.value = invalid;
    window.parseURL();
    assert.equal(window.__urlParserState(), "", invalid);
    assert.match(result.textContent, /Only HTTP and HTTPS|Invalid URL|control characters/, invalid);
  }

  input.value = '<img src=x onerror="alert(1)">';
  window.parseURL();
  assert.equal(result.querySelector("img"), null, "Untrusted input must not create HTML elements.");
  assert.equal(window.__urlParserState(), "");

  input.value = "   ";
  window.parseURL();
  assert.match(result.textContent, /Please enter a URL/);
  assert.equal(window.__urlParserState(), "");

  input.value = "https://example.com";
  window.parseURL();
  assert.notEqual(window.__urlParserState(), "");
  window.clearUrlParserResult();
  assert.equal(input.value, "");
  assert.equal(window.__urlParserState(), "");
  assert.match(result.textContent, /Waiting for URL input/);

  console.log("URL parser protocol and credential regression test: PASS");
} finally {
  dom.window.close();
}
