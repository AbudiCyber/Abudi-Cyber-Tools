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
      window.__fallbackCopyCalls = 0;
      window.__shouldThrowOnFallbackCopy = false;
      window.__fallbackCopyShouldReturnFalse = false;

      window.document.execCommand = command => {
        assert.equal(command, "copy");
        window.__fallbackCopyCalls += 1;

        if (window.__shouldThrowOnFallbackCopy) {
          throw new Error("FALLBACK_COPY_FAILED");
        }

        return !window.__fallbackCopyShouldReturnFalse;
      };
    }
  });

  try {
    const { window } = dom;

    let clipboardWrites = 0;
    let shouldRejectClipboard = false;

    window.navigator.clipboard.writeText = async () => {
      clipboardWrites += 1;

      if (shouldRejectClipboard) {
        throw new Error("CLIPBOARD_DENIED");
      }
    };

    await waitFor(
      () =>
        typeof window.AbudiDomainActions?.bindAllActions === "function" &&
        typeof window.AbudiDomainRuntime?.validate === "function"
    );

    assert.ok(window.AbudiDomainBootstrap);
    assert.equal(window.AbudiDomainBootstrap.version, "1.9.1");
    assert.equal(Object.isFrozen(window.AbudiDomainBootstrap), true);
    assert.equal(typeof window.AbudiDomainBootstrap.start, "function");
    assert.equal(typeof window.AbudiDomainBootstrap.load, "function");
    assert.equal(
      window.AbudiDomainErrors.getStartupErrorMessage(
        new Error("MODULE_LOAD_FAILED")
      ),
      "A required module failed to load: UNKNOWN_STARTUP_ERROR"
    );

    const clipboardWritesBeforeInvalidInputs = clipboardWrites;
    const fallbackCallsBeforeInvalidInputs = window.__fallbackCopyCalls;

    for (const invalidClipboardInput of [null, "", "   ", 123]) {
      await assert.rejects(
        window.AbudiDomainClipboardService.copy(invalidClipboardInput),
        error => error && error.message === "CLIPBOARD_TEXT_INVALID"
      );
    }

    assert.equal(
      clipboardWrites,
      clipboardWritesBeforeInvalidInputs,
      "Invalid clipboard input must not call the Clipboard API."
    );
    assert.equal(
      window.__fallbackCopyCalls,
      fallbackCallsBeforeInvalidInputs,
      "Invalid clipboard input must not invoke the fallback copy command."
    );

    const startupErrorCases = [
      {
        error: new window.Error("DOM_NOT_READY"),
        message: "Required page elements are unavailable."
      },
      {
        error: new window.Error("DOMAIN_RUNTIME_NOT_READY"),
        message: "The runtime validation module is unavailable."
      },
      {
        error: new window.Error("SOME_UNMAPPED_ERROR"),
        message: "A required module failed to load: SOME_UNMAPPED_ERROR"
      },
      {
        error: null,
        message: "A required module failed to load: UNKNOWN_STARTUP_ERROR"
      },
      {
        error: { message: "DOM_NOT_READY" },
        message: "A required module failed to load: UNKNOWN_STARTUP_ERROR"
      }
    ];

    for (const testCase of startupErrorCases) {
      assert.equal(
        window.AbudiDomainErrors.getStartupErrorMessage(testCase.error),
        testCase.message
      );
    }

    assert.equal(
      window.AbudiDomainBootstrap
        ? "present"
        : "missing",
      "present"
    );

    const bootstrapModuleLoader = window.AbudiDomainBootstrap.load.bind(
      window.AbudiDomainBootstrap
    );

    await assert.rejects(
      bootstrapModuleLoader("missing-test-module.js"),
      error =>
        error &&
        error.message === "MODULE_LOAD_FAILED" &&
        error.moduleFile === "missing-test-module.js"
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

    assert.equal(Object.isFrozen(window.AbudiDomainDOM.getElements()), true);
    assert.doesNotThrow(() => window.AbudiDomainDOM.validateElements());

    const originalClearButton = clearButton;
    clearButton.remove();

    assert.throws(
      () => window.AbudiDomainDOM.validateElements(),
      error => error && error.message === "DOM_NOT_READY"
    );

    assert.equal(window.AbudiDomainDOM.getElements().clearButton, null);
    originalClearButton.remove();

    window.document.body.appendChild(originalClearButton);
    assert.doesNotThrow(() => window.AbudiDomainDOM.validateElements());

    const missingResultElement = window.document.createElement("div");

    assert.throws(
      () => window.AbudiDomainResultService.getText(null),
      error => error && error.message === "DOMAIN_RESULT_ELEMENT_NOT_READY"
    );
    assert.throws(
      () => window.AbudiDomainResultService.setText(null, "ignored"),
      error => error && error.message === "DOMAIN_RESULT_ELEMENT_NOT_READY"
    );

    window.AbudiDomainResultService.setText(missingResultElement, "safe text");
    assert.equal(window.AbudiDomainResultService.getText(missingResultElement), "safe text");

    window.AbudiDomainResultService.setText(missingResultElement, 42);
    assert.equal(missingResultElement.textContent, "");

    window.AbudiDomainResultService.setText(missingResultElement, "<img src=x onerror=alert(1)>");
    assert.equal(
      missingResultElement.querySelector("img"),
      null,
      "Result service must write text rather than parse HTML."
    );
    assert.equal(
      window.AbudiDomainResultService.getText(missingResultElement),
      "<img src=x onerror=alert(1)>"
    );
    assert.equal(Object.isFrozen(window.AbudiDomainResultService), true);

    missingResultElement.textContent = "  padded result  ";
    assert.equal(
      window.AbudiDomainResultService.getText(missingResultElement),
      "padded result"
    );

    const validHttp = window.AbudiDomainValidationService.validateInput("http://example.com:8080/a?b=2#c");
    assert.equal(validHttp.valid, true);
    assert.equal(validHttp.value, "http://example.com:8080/a?b=2#c");
    assert.equal(validHttp.message, "");
    assert.equal(Object.isFrozen(validHttp), true);

    const validBare = window.AbudiDomainValidationService.validateInput("Example.COM");
    assert.equal(validBare.valid, true);
    assert.equal(validBare.value, "Example.COM");
    assert.equal(validBare.message, "");
    assert.equal(Object.isFrozen(validBare), true);

    const nonStringInputs = [null, undefined, 42, {}, []];

    for (const value of nonStringInputs) {
      const validation = window.AbudiDomainValidationService.validateInput(value);

      assert.equal(validation.valid, false);
      assert.equal(validation.value, "");
      assert.equal(
        validation.message,
        "Please enter a valid domain or URL.\nExample: example.com"
      );
      assert.equal(Object.isFrozen(validation), true);
    }

    const invalidResult = window.AbudiDomainValidationService.createInvalidResult("bad input");
    assert.equal(invalidResult.valid, false);
    assert.equal(invalidResult.value, "bad input");
    assert.equal(Object.isFrozen(invalidResult), true);

    const unsupportedProtocols = [
      "ftp://example.com",
      "file://example.com",
      "javascript://example.com"
    ];

    for (const value of unsupportedProtocols) {
      const validation =
        window.AbudiDomainValidationService.validateInput(value);

      assert.equal(validation.valid, false);
    }

    const malformedInputs = [
      "https://",
      "https://?",
      "https://#fragment",
      "http://[invalid"
    ];

    for (const value of malformedInputs) {
      const validation =
        window.AbudiDomainValidationService.validateInput(value);

      assert.equal(validation.valid, false);
    }

    const extracted = window.AbudiDomainExtractor.extractDomain(
      "https://api.v1.example.com:8443/a/b?x=1&y=2#frag"
    );
    assert.equal(extracted.protocol, "https");
    assert.equal(extracted.hostname, "api.v1.example.com");
    assert.equal(extracted.port, "8443");
    assert.equal(extracted.path, "/a/b");
    assert.equal(extracted.query, "?x=1&y=2");
    assert.equal(extracted.fragment, "#frag");
    assert.equal(Object.isFrozen(extracted), true);

    assert.throws(
      () => window.AbudiDomainExtractor.extractDomain(""),
      error => error && error.message === "EMPTY_INPUT"
    );
    assert.throws(
      () => window.AbudiDomainExtractor.extractDomain("   "),
      error => error && error.message === "EMPTY_INPUT"
    );
    assert.throws(
      () => window.AbudiDomainExtractor.extractDomain("https://[invalid"),
      error => error instanceof window.TypeError || error.name === "TypeError"
    );

    assert.equal(
      window.AbudiDomainTLD.getTLD("https://api.v1.example.com"),
      "com"
    );
    assert.equal(
      window.AbudiDomainSubdomain.getSubdomain(
        "https://api.v1.example.com"
      ),
      "api.v1"
    );

    const defaultPortCases = [
      {
        value: "https://example.com",
        port: "default",
        origin: "https://example.com"
      },
      {
        value: "http://example.com:80",
        port: "default",
        origin: "http://example.com"
      },
      {
        value: "https://example.com:443",
        port: "default",
        origin: "https://example.com"
      },
      {
        value: "https://example.com:8443",
        port: "8443",
        origin: "https://example.com:8443"
      }
    ];

    for (const testCase of defaultPortCases) {
      const base = window.AbudiDomainExtractor.extractDomain(testCase.value);

      assert.equal(base.port, testCase.port);
      assert.equal(
        window.AbudiDomainExtension.getOrigin(testCase.value),
        testCase.origin
      );
    }

    assert.equal(
      window.AbudiDomainSecurity.isSecure("https://example.com"),
      true
    );
    assert.equal(
      window.AbudiDomainSecurity.isSecure("http://example.com"),
      false
    );

    const specialHostCases = [
      {
        value: "https://localhost:3000",
        hostname: "localhost",
        tld: "none",
        subdomain: "none"
      },
      {
        value: "https://127.0.0.1:8080",
        hostname: "127.0.0.1",
        tld: "none",
        subdomain: "none"
      },
      {
        value: "https://[::1]:8080",
        hostname: "[::1]",
        tld: "none",
        subdomain: "none"
      }
    ];

    for (const testCase of specialHostCases) {
      const validation =
        window.AbudiDomainValidationService.validateInput(testCase.value);

      assert.equal(validation.valid, true);

      const base =
        window.AbudiDomainExtractor.extractDomain(testCase.value);

      assert.equal(base.hostname, testCase.hostname);
      assert.equal(
        window.AbudiDomainTLD.getTLD(testCase.value),
        testCase.tld
      );
      assert.equal(
        window.AbudiDomainSubdomain.getSubdomain(testCase.value),
        testCase.subdomain
      );
    }


    input.value = " HTTPS://Example.COM:443/path ";
    analyzeButton.click();
    assert.match(result.textContent, /Protocol: https/);
    assert.match(result.textContent, /Hostname: example\.com/);
    assert.match(result.textContent, /Port: default/);
    assert.match(result.textContent, /Path: \/path/);
    assert.match(result.textContent, /Origin: https:\/\/example\.com/);
    assert.match(result.textContent, /Secure: Yes/);

    const whitespaceValidation =
      window.AbudiDomainValidationService.validateInput(
        "   example.com   "
      );

    assert.equal(whitespaceValidation.valid, true);
    assert.equal(whitespaceValidation.value, "example.com");

    const baselineButtonText = copyButton.textContent;

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
    assert.equal(clipboardWrites, 1);
    assert.equal(copyButton.textContent, "✅ Copied");

    shouldRejectClipboard = true;
    copyButton.click();
    await new Promise(resolve => setTimeout(resolve, 25));
    assert.equal(clipboardWrites, 2);
    assert.equal(window.__fallbackCopyCalls, 1);
    assert.equal(copyButton.textContent, "✅ Copied");

    shouldRejectClipboard = false;

    const originalNavigatorClipboard = window.navigator.clipboard;

    delete window.navigator.clipboard;

    assert.equal(
      await window.AbudiDomainClipboardService.copy("fallback-only"),
      true
    );
    assert.equal(window.__fallbackCopyCalls, 2);

    window.navigator.clipboard = originalNavigatorClipboard;

    const invalidClipboardValues = ["", "   ", null, undefined, 42];

    for (const value of invalidClipboardValues) {
      await assert.rejects(
        window.AbudiDomainClipboardService.copy(value),
        error =>
          error &&
          typeof error.message === "string" &&
          error.message === "CLIPBOARD_TEXT_INVALID"
      );
    }

    shouldRejectClipboard = true;
    window.__shouldThrowOnFallbackCopy = true;

    await assert.rejects(
      window.AbudiDomainClipboardService.copy("cleanup-test")
    );

    assert.equal(
      window.document.querySelectorAll("textarea").length,
      0,
      "Clipboard fallback must remove its temporary textarea after an error."
    );

    input.value = "example.com";
    analyzeButton.click();
    assert.match(result.textContent, /Hostname: example\.com/);

    shouldRejectClipboard = true;
    window.__shouldThrowOnFallbackCopy = true;
    copyButton.click();
    await new Promise(resolve => setTimeout(resolve, 25));

    assert.equal(
      copyButton.textContent,
      "❌ Copy failed",
      "Copy action must show failure feedback when both clipboard paths fail."
    );
    assert.equal(
      window.document.querySelectorAll("textarea").length,
      0,
      "Failed copy action must clean up the fallback textarea."
    );

    window.__shouldThrowOnFallbackCopy = false;
    shouldRejectClipboard = false;

    shouldRejectClipboard = true;
    window.__fallbackCopyShouldReturnFalse = true;
    assert.equal(
      await window.AbudiDomainClipboardService.copy("fallback-rejected"),
      false,
      "Clipboard fallback must report false when execCommand rejects the copy."
    );
    assert.equal(
      window.document.querySelectorAll("textarea").length,
      0,
      "Fallback returning false must still remove its temporary textarea."
    );
    window.__fallbackCopyShouldReturnFalse = false;
    shouldRejectClipboard = false;

    input.value = "example.com";
    analyzeButton.click();
    shouldRejectClipboard = true;
    window.__fallbackCopyShouldReturnFalse = true;
    copyButton.click();
    await new Promise(resolve => setTimeout(resolve, 25));
    assert.equal(
      copyButton.textContent,
      "❌ Copy failed",
      "The copy action must report failure when the fallback returns false."
    );
    assert.equal(
      window.document.querySelectorAll("textarea").length,
      0,
      "A rejected fallback copy must clean up its temporary textarea."
    );
    shouldRejectClipboard = false;
    window.__fallbackCopyShouldReturnFalse = false;

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

    input.value = "ftp://example.com";
    analyzeButton.click();
    assert.match(result.textContent, /Please enter a valid domain or URL/);

    input.value = "file://example.com";
    analyzeButton.click();
    assert.match(result.textContent, /Please enter a valid domain or URL/);

    input.value = "";
    analyzeButton.click();
    assert.match(result.textContent, /Please enter a valid domain or URL/);

    copyButton.click();
    await new Promise(resolve => setTimeout(resolve, 25));
    assert.equal(
      result.textContent,
      "Please enter a valid domain or URL.\nExample: example.com"
    );

    assert.throws(
      () => window.AbudiDomainUI.setTemporaryButtonText(null, "invalid"),
      error => error && error.message === "UI_BUTTON_NOT_READY"
    );

    const unrelatedButton = window.document.createElement("button");
    unrelatedButton.textContent = "Keep this text";
    window.AbudiDomainUI.setTemporaryButtonText(unrelatedButton, "temporary", 20);
    assert.equal(unrelatedButton.textContent, "temporary");
    await new Promise(resolve => setTimeout(resolve, 30));
    assert.equal(unrelatedButton.textContent, "Keep this text");

    window.AbudiDomainUI.setTemporaryButtonText(copyButton, "first", 20);
    await new Promise(resolve => setTimeout(resolve, 10));
    window.AbudiDomainUI.setTemporaryButtonText(copyButton, "second", 30);
    await new Promise(resolve => setTimeout(resolve, 15));
    assert.equal(copyButton.textContent, "second");
    await new Promise(resolve => setTimeout(resolve, 25));
    assert.equal(copyButton.textContent, baselineButtonText);

    window.AbudiDomainUI.setTemporaryButtonText(
      unrelatedButton,
      "timed text",
      30
    );
    unrelatedButton.textContent = "Changed externally";
    await new Promise(resolve => setTimeout(resolve, 40));
    assert.equal(
      unrelatedButton.textContent,
      "Changed externally",
      "Temporary feedback must not overwrite text changed by another action."
    );

    console.log("Domain Extractor smoke test: PASS");
  } finally {
    dom.window.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
