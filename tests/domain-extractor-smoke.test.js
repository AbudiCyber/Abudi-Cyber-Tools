const assert = require("node:assert/strict");
const path = require("node:path");
const { JSDOM } = require("jsdom");

const pagePath = path.join(__dirname, "..", "domain-extractor.html");

function waitFor(condition, timeout = 5000) {
  const started = Date.now();

  return new Promise((resolve, reject) => {
    const check = () => {
      if (condition()) {
        resolve();
        return;
      }

      if (Date.now() - started >= timeout) {
        reject(new Error("Timed out waiting for Domain Extractor bootstrap."));
        return;
      }

      setTimeout(check, 25);
    };

    check();
  });
}

(async () => {
  const dom = await JSDOM.fromFile(pagePath, {
    runScripts: "dangerously",
    resources: "usable",
    beforeParse(window) {
      Object.defineProperty(window.navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async () => true
        }
      });
    }
  });

  try {
    const { window } = dom;

    await waitFor(
      () =>
        typeof window.AbudiDomainActions?.bindAllActions === "function" &&
        typeof window.AbudiDomainRuntime?.validate === "function"
    );

    window.AbudiDomainRuntime.validate();
    window.AbudiDomainActions.bindAllActions();

    const { input, result, analyzeButton, copyButton, clearButton } =
      window.AbudiDomainDOM.getElements();

    assert.ok(input);
    assert.ok(result);
    assert.ok(analyzeButton);
    assert.ok(copyButton);
    assert.ok(clearButton);

    input.value = "https://SUB.Example.COM:8443/path/to?q=1#top";
    analyzeButton.click();

    assert.match(result.textContent, /Protocol: https/);
    assert.match(result.textContent, /Hostname: sub\.example\.com/);
    assert.match(result.textContent, /Port: 8443/);
    assert.match(result.textContent, /Path: \/path\/to/);
    assert.match(result.textContent, /Query: \?q=1/);
    assert.match(result.textContent, /Fragment: #top/);
    assert.match(result.textContent, /Origin: https:\/\/sub\.example\.com:8443/);
    assert.match(result.textContent, /Secure: Yes/);
    assert.match(result.textContent, /TLD: com/);
    assert.match(result.textContent, /Subdomain: sub/);

    copyButton.click();
    await new Promise(resolve => setTimeout(resolve, 25));
    assert.equal(copyButton.textContent, "✅ Copied");

    clearButton.click();
    assert.equal(input.value, "");
    assert.equal(result.textContent, "Waiting for domain input...");

    input.value = "http://example.com";
    analyzeButton.click();

    assert.match(result.textContent, /Protocol: http/);
    assert.match(result.textContent, /Hostname: example\.com/);
    assert.match(result.textContent, /Port: default/);
    assert.match(result.textContent, /Path: \/\n/);
    assert.match(result.textContent, /Query: none/);
    assert.match(result.textContent, /Fragment: none/);
    assert.match(result.textContent, /Secure: No/);
    assert.match(result.textContent, /Subdomain: none/);

    input.value = "https://";
    analyzeButton.click();
    assert.match(result.textContent, /Please enter a valid domain or URL/);

    input.value = "";
    analyzeButton.click();
    assert.match(result.textContent, /Please enter a valid domain or URL/);

    const originalButtonText = copyButton.textContent;
    window.AbudiDomainUI.setTemporaryButtonText(copyButton, "first", 20);
    await new Promise(resolve => setTimeout(resolve, 10));
    window.AbudiDomainUI.setTemporaryButtonText(copyButton, "second", 30);
    await new Promise(resolve => setTimeout(resolve, 15));
    assert.equal(copyButton.textContent, "second");
    await new Promise(resolve => setTimeout(resolve, 25));
    assert.equal(copyButton.textContent, originalButtonText);

    console.log("Domain Extractor smoke test: PASS");
  } finally {
    dom.window.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
