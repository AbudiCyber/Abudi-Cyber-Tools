const assert = require("node:assert/strict");
const { createHash } = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const script = fs.readFileSync(path.join(root, "script.js"), "utf8");

async function main() {
  const dom = new JSDOM(html, { runScripts: "outside-only", url: "https://example.test/" });
  try {
    const { window } = dom;
    window.TextEncoder = TextEncoder;
    const input = window.document.getElementById("hashInput");
    const algorithm = window.document.getElementById("hashType");
    const result = window.document.getElementById("hashResult");
    const expected = createHash("sha256").update("abc").digest("hex");

    Object.defineProperty(window.crypto, "subtle", {
      configurable: true,
      value: {
        digest: async (name, data) => {
          assert.equal(name, "SHA-256");
          return Uint8Array.from(createHash("sha256").update(Buffer.from(data)).digest()).buffer;
        }
      }
    });

    window.eval(script + "\nwindow.__hashState = () => ({ value: lastHashResult, max: HASH_GENERATOR_MAX_BYTES });");

    input.value = "abc";
    await window.generateHash();
    assert.equal(window.__hashState().value, expected, "SHA-256 must match the known test vector.");
    assert.match(result.textContent, /3 UTF-8 bytes/);

    input.value = " a ";
    await window.generateHash();
    assert.equal(
      window.__hashState().value,
      createHash("sha256").update(" a ").digest("hex"),
      "Leading and trailing spaces are part of the input and must affect the digest."
    );

    algorithm.value = "SHA-1";
    await window.generateHash();
    assert.equal(
      window.__hashState().value,
      createHash("sha1").update(" a ").digest("hex"),
      "SHA-1 must remain supported."
    );

    input.value = "change me";
    algorithm.value = "SHA-256";
    await window.generateHash();
    assert.ok(window.__hashState().value);
    input.value = "changed";
    input.dispatchEvent(new window.Event("input"));
    assert.equal(window.__hashState().value, "", "Editing input must invalidate a previous digest.");
    assert.match(result.textContent, /Input changed/);

    input.value = "algorithm";
    await window.generateHash();
    algorithm.value = "SHA-1";
    algorithm.dispatchEvent(new window.Event("change"));
    assert.equal(window.__hashState().value, "", "Changing algorithm must invalidate a previous digest.");

    let resolveDigest;
    window.crypto.subtle.digest = () => new Promise(resolve => { resolveDigest = resolve; });
    input.value = "slow";
    algorithm.value = "SHA-256";
    const pending = window.generateHash();
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(typeof resolveDigest, "function");
    window.clearHashResult();
    resolveDigest(Uint8Array.from(Buffer.alloc(32, 9)).buffer);
    await pending;
    assert.equal(window.__hashState().value, "", "Clearing while hashing must discard the stale result.");
    assert.match(result.textContent, /Waiting for hash input/);

    input.value = "x".repeat(window.__hashState().max + 1);
    await window.generateHash();
    assert.match(result.textContent, /too large/i);
    assert.equal(window.__hashState().value, "");

    input.value = "";
    await window.generateHash();
    assert.match(result.textContent, /enter text/i);
    assert.equal(window.__hashState().value, "");

    console.log("Hash generator lifecycle regression test: PASS");
  } finally {
    dom.window.close();
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
