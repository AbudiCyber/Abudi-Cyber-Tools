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
  const input = window.document.getElementById("urlCodecInput");
  const result = window.document.getElementById("urlCodecResult");
  window.eval(script + "\nwindow.__urlCodecState = () => lastUrlCodecResult;");

  const original = "  hello 🌸\nمرحبا  ";
  input.value = original;
  window.encodeUrlValue();
  assert.equal(window.__urlCodecState(), encodeURIComponent(original));
  assert.ok(result.textContent.includes(encodeURIComponent(original)));

  input.value = window.__urlCodecState();
  window.decodeUrlValue();
  assert.equal(window.__urlCodecState(), original);
  assert.ok(result.textContent.includes(original));

  input.value = " \t\n ";
  window.encodeUrlValue();
  assert.equal(window.__urlCodecState(), encodeURIComponent(input.value));

  for (const invalid of ["%", "%E0%A4%A", "%ZZ"]) {
    input.value = invalid;
    window.decodeUrlValue();
    assert.match(result.textContent, /Invalid percent-encoded URL text/);
    assert.equal(window.__urlCodecState(), "");
  }

  input.value = "\uD800";
  window.encodeUrlValue();
  assert.match(result.textContent, /Could not encode this value/);
  assert.equal(window.__urlCodecState(), "");

  input.value = '<img src=x onerror="alert(1)">';
  window.encodeUrlValue();
  assert.equal(result.querySelector("img"), null, "Untrusted input must not create HTML elements.");

  input.value = "";
  window.encodeUrlValue();
  assert.match(result.textContent, /Please enter text or URL to encode/);
  assert.equal(window.__urlCodecState(), "");

  window.clearUrlCodecResult();
  assert.equal(input.value, "");
  assert.match(result.textContent, /Waiting for URL encode\/decode input/);
  assert.equal(window.__urlCodecState(), "");

  console.log("URL codec whitespace-integrity regression test: PASS");
} finally {
  dom.window.close();
}
