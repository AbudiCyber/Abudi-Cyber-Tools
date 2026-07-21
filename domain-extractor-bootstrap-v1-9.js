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

      script.src = src + "?v=1-9-6";

      script.onload = () => {
        resolve(src);
      };

      script.onerror = () => {
        reject(new Error(src));
      };

      document.head.appendChild(script);
    });
  }

  function validateRuntime() {
    const input = document.getElementById("i");
    const result = document.getElementById("r");
    const analyzeButton = document.getElementById("a");

    if (!input || !result || !analyzeButton) {
      throw new Error("DOM_NOT_READY");
    }

    if (
      typeof window.AbudiDomainExtractor?.extractDomain !== "function"
    ) {
      throw new Error("DOMAIN_EXTRACTOR_NOT_READY");
    }

    if (
      typeof window.AbudiDomainUI?.formatExtended !== "function"
    ) {
      throw new Error("DOMAIN_UI_NOT_READY");
    }

    if (
      typeof window.AbudiDomainActions?.bindAllActions !== "function"
    ) {
      throw new Error("DOMAIN_ACTIONS_NOT_READY");
    }
  }

  async function start() {
    for (const file of files) {
      await load(file);
    }

    validateRuntime();
    window.AbudiDomainActions.bindAllActions();
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
