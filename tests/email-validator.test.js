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
  const input = window.document.getElementById("emailInput");
  const result = window.document.getElementById("emailResult");
  window.eval(script + "\nwindow.__emailState = () => lastEmailResult;");

  const validCases = [
    "alice@example.com",
    "first.last+tag@sub.example.co.uk",
    "user_name@example-domain.com",
    "alice@bücher.de"
  ];

  for (const email of validCases) {
    input.value = email;
    window.validateEmail();
    assert.match(result.textContent, /Format appears valid/, email);
    assert.match(result.textContent, /does not verify that the mailbox exists/i);
  }

  const invalidCases = [
    "alice",
    "@example.com",
    "alice@",
    "alice@@example.com",
    ".alice@example.com",
    "alice.@example.com",
    "alice..smith@example.com",
    "alice@example..com",
    "alice@-example.com",
    "alice@example-.com",
    "alice@example.c",
    "alice@123.456",
    "alice@example.123",
    "alice@example.com:25",
    "alice name@example.com",
    "alice@example.com/path",
    "a".repeat(65) + "@example.com",
    "alice@" + ["a".repeat(63), "b".repeat(63), "c".repeat(63), "d".repeat(61)].join("."),
    "alice@" + "a".repeat(64) + ".com"
  ];

  for (const email of invalidCases) {
    input.value = email;
    window.validateEmail();
    assert.match(result.textContent, /Invalid email format/, email);
  }

  const payload = '<img src=x onerror="alert(1)">@example.com';
  input.value = payload;
  window.validateEmail();
  assert.equal(result.querySelector("img"), null, "Untrusted email input must remain text.");
  assert.ok(result.textContent.includes(payload));

  input.value = "alice@example.com";
  window.validateEmail();
  assert.match(window.__emailState(), /does not verify mailbox existence or deliverability/);
  window.clearEmailResult();
  assert.equal(input.value, "");
  assert.match(result.textContent, /Waiting for email input/);
  assert.equal(window.__emailState(), "");

  console.log("Email format checker regression test: PASS");
} finally {
  dom.window.close();
}
