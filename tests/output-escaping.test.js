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

try {
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

  const payload = '<img src=x onerror="alert(1)">';
  window.document.getElementById("emailInput").value = payload;
  window.validateEmail();

  const emailResult = window.document.getElementById("emailResult");
  assert.equal(
    emailResult.querySelector("img"),
    null,
    "Untrusted email input must not create an HTML element."
  );
  assert.equal(
    emailResult.textContent.includes(payload),
    true,
    "Escaped user input must remain visible as literal text."
  );

  const entityPayload = "&lt;img src=x onerror=alert(1)&gt;";
  window.document.getElementById("emailInput").value = entityPayload;
  window.validateEmail();

  assert.equal(
    emailResult.querySelector("img"),
    null,
    "Entity-encoded input must remain text and not be parsed as an element."
  );
  assert.equal(
    emailResult.textContent.includes(entityPayload),
    true,
    "Entity-encoded input must retain its literal visible representation."
  );

  const decodedPayload = '<svg onload="alert(1)">';
  window.document.getElementById("base64Input").value =
    Buffer.from(decodedPayload, "utf8").toString("base64");
  window.decodeBase64();

  const base64Result = window.document.getElementById("base64Result");
  assert.equal(
    base64Result.querySelector("svg"),
    null,
    "Decoded Base64 content must be rendered as text, not parsed HTML."
  );
  assert.equal(
    base64Result.textContent.includes(decodedPayload),
    true,
    "Decoded content must remain readable to the user."
  );

  console.log("Output escaping regression test: PASS");
} finally {
  dom.window.close();
}
