// Abudi Domain Extractor Bootstrap v1.9
(() => {
  "use strict";

  const files = [
    "domain-extractor-extension-v1-9.js",
    "domain-security-extension-v1-9.js",
    "domain-tld-extension-v1-9.js",
    "domain-subdomain-extension-v1-9.js",
    "domain-extractor-ui-v1-9.js",
    "domain-extractor-actions-v1-9.js"
  ];

  function load(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");

      script.src = src + "?v=1-9-4";

      script.onload = () => {
        resolve(src);
      };

      script.onerror = () => {
        reject(new Error(src));
      };

      document.head.appendChild(script);
    });
  }

  async function start() {
    for (const file of files) {
      await load(file);
    }

    const input = document.getElementById("i");
    const result = document.getElementById("r");
    const analyzeButton = document.getElementById("a");

    if (
      !input ||
      !result ||
      !analyzeButton ||
      !window.AbudiDomainExtractor ||
      !window.AbudiDomainUI ||
      !window.AbudiDomainActions
    ) {
      throw new Error("DOM_OR_ENGINE_NOT_READY");
    }

    window.AbudiDomainActions.bindAnalyzeAction();
    window.AbudiDomainActions.bindClearAction();
    window.AbudiDomainActions.bindCopyAction();
  }

  start().catch(error => {
    const result = document.getElementById("r");

    const failedFile =
      error.message === "DOM_OR_ENGINE_NOT_READY"
        ? "Required DOM element or engine"
        : error.message;

    if (result) {
      result.textContent =
        "Extension loading failed:\n" +
        failedFile;
    }

    console.error(
      "[Abudi Domain Extractor] Bootstrap failed:",
      error
    );
  });
})();
