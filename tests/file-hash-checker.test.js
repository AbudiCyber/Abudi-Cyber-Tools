const assert = require("node:assert/strict");
const { createHash } = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const script = fs.readFileSync(path.join(root, "script.js"), "utf8");

function makeFile(name, content, type = "text/plain") {
  const bytes = Buffer.from(content);
  return {
    name,
    type,
    size: bytes.length,
    lastModified: 1700000000000,
    arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
  };
}

function setSelectedFile(input, file) {
  Object.defineProperty(input, "files", {
    configurable: true,
    value: file ? [file] : []
  });
}

async function main() {
  const dom = new JSDOM(html, {
    runScripts: "outside-only",
    url: "https://example.test/"
  });

  try {
    const { window } = dom;
    const input = window.document.getElementById("fileHashInput");
    const result = window.document.getElementById("fileHashResult");
    const expectedHash = createHash("sha256").update("abc").digest("hex");

    Object.defineProperty(window.crypto, "subtle", {
      configurable: true,
      value: {
        digest: async (algorithm, buffer) => {
          assert.equal(algorithm, "SHA-256");
          const digest = createHash("sha256").update(Buffer.from(buffer)).digest();
          return Uint8Array.from(digest).buffer;
        }
      }
    });

    window.eval(script + `\nwindow.__testState = () => ({ lastFileHash, lastFileName, lastFileReport, maxBytes: FILE_HASH_MAX_BYTES });`);

    setSelectedFile(input, makeFile("sample.txt", "abc"));
    await window.generateFileHash();
    assert.equal(window.__testState().lastFileHash, expectedHash, "SHA-256 must match the known test vector.");
    assert.match(result.textContent, /Local-only hash analysis/);
    assert.match(result.textContent, /not an antivirus scan/i);
    assert.equal(window.__testState().lastFileName, "sample.txt");
    assert.match(window.__testState().lastFileReport, new RegExp(expectedHash));

    setSelectedFile(input, makeFile("<img src=x onerror=alert(1)>.exe", "payload"));
    await window.generateFileHash();
    assert.equal(result.querySelector("img"), null, "Untrusted file names must not create HTML elements.");
    assert.match(result.textContent, /Potentially risky file type/);
    assert.match(result.textContent, /&lt;img|img src=x/);
    assert.equal(window.__testState().lastFileHash.length, 64);

    assert.equal(window.sanitizeDownloadFileName("..\\evil/name?.exe"), "_evil_name_.exe");
    assert.equal(window.sanitizeDownloadFileName("   "), "file");
    assert.equal(window.sanitizeDownloadFileName("report.txt. "), "report.txt");
    assert.equal(window.sanitizeReportField("name\\r\\nSHA-256: forged"), "name SHA-256: forged");

    const originalCreateObjectURL = window.URL.createObjectURL;
    const originalRevokeObjectURL = window.URL.revokeObjectURL;
    let capturedDownloadName = "";
    let capturedBlob = null;
    window.URL.createObjectURL = blob => {
      capturedBlob = blob;
      return "blob:https://example.test/hash-report";
    };
    window.URL.revokeObjectURL = () => {};
    window.HTMLAnchorElement.prototype.click = function () {
      capturedDownloadName = this.download;
    };
    window.downloadReport();
    assert.equal(capturedDownloadName, "_img src=x onerror=alert(1)_.exe_hash_report.txt");
    assert.ok(capturedBlob instanceof window.Blob);
    window.URL.createObjectURL = originalCreateObjectURL;
    window.URL.revokeObjectURL = originalRevokeObjectURL;

    setSelectedFile(input, {
      name: "oversized.bin",
      type: "application/octet-stream",
      size: window.__testState().maxBytes + 1,
      lastModified: 0,
      arrayBuffer: async () => { throw new Error("must not read oversized files"); }
    });
    await window.generateFileHash();
    assert.match(result.textContent, /too large/i);
    assert.equal(window.__testState().lastFileHash, "");

    setSelectedFile(input, makeFile("report\\r\\nSHA-256: forged.txt", "metadata"));
    await window.generateFileHash();
    assert.equal(
      window.__testState().lastFileReport.split("\\n").filter(line => line === "SHA-256: forged").length,
      0,
      "Control characters in file metadata must not inject report lines."
    );

    const originalSubtle = window.crypto.subtle;
    Object.defineProperty(window.crypto, "subtle", { configurable: true, value: undefined });
    setSelectedFile(input, makeFile("unsupported.txt", "x"));
    await window.generateFileHash();
    assert.match(result.textContent, /unavailable in this browser context/i);
    assert.equal(window.__testState().lastFileHash, "");
    Object.defineProperty(window.crypto, "subtle", { configurable: true, value: originalSubtle });

    const originalDigest = originalSubtle.digest;
    let resolveDigest;
    originalSubtle.digest = () => new Promise(resolve => { resolveDigest = resolve; });
    setSelectedFile(input, makeFile("slow-digest.txt", "digest"));
    const pendingDigest = window.generateFileHash();
    await Promise.resolve();
    assert.equal(typeof resolveDigest, "function", "Digest operation should have started.");
    window.clearFileHashResult();
    resolveDigest(Uint8Array.from(Buffer.alloc(32, 7)).buffer);
    await pendingDigest;
    assert.equal(window.__testState().lastFileHash, "", "Clearing during digest must invalidate the result.");
    originalSubtle.digest = originalDigest;

    let resolveArrayBuffer;
    setSelectedFile(input, {
      name: "slow.txt",
      type: "text/plain",
      size: 4,
      lastModified: 0,
      arrayBuffer: () => new Promise(resolve => { resolveArrayBuffer = resolve; })
    });
    const pending = window.generateFileHash();
    window.clearFileHashResult();
    const slowBytes = Buffer.from("slow");
    resolveArrayBuffer(slowBytes.buffer.slice(
      slowBytes.byteOffset,
      slowBytes.byteOffset + slowBytes.byteLength
    ));
    await pending;
    assert.equal(window.__testState().lastFileHash, "", "Clearing must invalidate an in-flight hash operation.");
    assert.equal(window.__testState().lastFileName, "");
    assert.match(result.textContent, /Waiting for file input/);

    setSelectedFile(input, makeFile("change.txt", "first"));
    const pendingOnChange = window.generateFileHash();
    setSelectedFile(input, makeFile("new-selection.txt", "second"));
    input.dispatchEvent(new window.Event("change"));
    await pendingOnChange;
    assert.equal(window.__testState().lastFileHash, "", "Changing selection must invalidate an in-flight hash operation.");
    assert.match(result.textContent, /selection changed/i);

    setSelectedFile(input, null);
    await window.generateFileHash();
    assert.match(result.textContent, /choose a file first/i);

    // Assert internal state through the isolated test-only accessor appended to the VM script.
    console.log("File hash checker regression test: PASS");
  } finally {
    dom.window.close();
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
