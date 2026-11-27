const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");
const { TextEncoder, TextDecoder } = require("node:util");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const script = fs.readFileSync(path.join(root, "script.js"), "utf8");
const dom = new JSDOM(html, { runScripts: "outside-only", url: "https://example.test/" });

try {
  const { window } = dom;
  window.TextEncoder = TextEncoder;
  window.TextDecoder = TextDecoder;
  const input = window.document.getElementById("base64Input");
  const result = window.document.getElementById("base64Result");
  window.eval(script + "\nwindow.__base64State = () => lastBase64Result;");

  const original = "  hello\n🌸 مرحباً  ";
  input.value = original;
  window.encodeBase64();
  const encoded = Buffer.from(original, "utf8").toString("base64");
  assert.ok(result.textContent.includes(encoded));
  assert.equal(window.__base64State(), encoded);

  input.value = encoded;
  window.decodeBase64();
  assert.ok(result.textContent.includes(original));
  assert.equal(window.__base64State(), original);

  input.value = " \t\n ";
  window.encodeBase64();
  assert.equal(window.__base64State(), Buffer.from(input.value, "utf8").toString("base64"));

  for (const invalid of ["!!!!", "YQ", "YR==", "/w==", "YQ===", "SGVsbG8_"]) {
    input.value = invalid;
    window.decodeBase64();
    assert.match(result.textContent, /Invalid Base64 or malformed UTF-8/, invalid);
    assert.equal(window.__base64State(), "");
  }

  input.value = "Y Q==\n";
  window.decodeBase64();
  assert.equal(window.__base64State(), "a", "ASCII whitespace between Base64 characters is ignored.");

  input.value = '<img src=x onerror="alert(1)">';
  window.encodeBase64();
  assert.equal(result.querySelector("img"), null, "Encoded output must not create HTML elements.");

  input.value = "";
  window.encodeBase64();
  assert.match(result.textContent, /Please enter text to encode/);
  assert.equal(window.__base64State(), "");

  window.clearBase64Result();
  assert.equal(input.value, "");
  assert.match(result.textContent, /Waiting for Base64 input/);
  assert.equal(window.__base64State(), "");

  console.log("Base64 data-integrity regression test: PASS");
} finally {
  dom.window.close();
}
