const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const script = fs.readFileSync(path.join(root, "script.js"), "utf8");
const dom = new JSDOM(html, {
  runScripts: "outside-only",
  url: "https://example.test/"
});

const { window } = dom;
window.eval(script);

const escapingCases = [
  ["&", "&amp;"],
  ["<", "&lt;"],
  [">", "&gt;"],
  ['"', "&quot;"],
  ["'", "&#39;"],
  ["&lt;script&gt;", "&amp;lt;script&amp;gt;"],
  ['"><svg onload=alert(1)>', "&quot;&gt;&lt;svg onload=alert(1)&gt;"]
];

for (const [input, expected] of escapingCases) {
  assert.equal(
    window.sanitize(input),
    expected,
    "HTML escaping must encode every HTML-significant character."
  );
}

const payload = '<img src=x onerror="window.__xssExecuted=true">';
window.__xssExecuted = false;
window.document.getElementById("emailInput").value = payload;
window.validateEmail();

const emailResult = window.document.getElementById("emailResult");
assert.equal(
  emailResult.querySelector("img"),
  null,
  "Untrusted email input must never create an HTML element."
);
assert.equal(
  window.__xssExecuted,
  false,
  "Untrusted email input must not execute an event handler."
);
assert.ok(
  emailResult.textContent.includes(payload),
  "Escaping must preserve the original user input as visible text."
);

const entityPayload = "&lt;img src=x onerror=alert(1)&gt;";
window.document.getElementById("emailInput").value = entityPayload;
window.validateEmail();
assert.equal(
  emailResult.querySelector("img"),
  null,
  "Entity-encoded input must remain text after HTML parsing."
);
assert.ok(emailResult.textContent.includes(entityPayload));

dom.window.close();
console.log("Output escaping regression test: PASS");
