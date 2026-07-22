// Abudi Domain Extractor Bootstrap v1.9
(() => {
  "use strict";

  const files = [
    "domain-extractor-errors-v1-9.js",
    "domain-extractor-runtime-v1-9.js",
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

      script.src = src + "?v=1-9-9";

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
      typeof window.AbudiDomainErrors?.getStartupErrorMessage !== "function"
    ) {
      throw new Error("DOMAIN_ERRORS_NOT_READY");
    }

    if (
      typeof window.AbudiDomainRuntime?.validate !== "function"
    ) {
      throw new Error("DOMAIN_RUNTIME_NOT_READY");
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
    window.AbudiDomainRuntime.validate();
    window.AbudiDomainActions.bindAllActions();
  }

  start().catch(error => {
    const result = document.getElementById("r");
    const getStartupErrorMessage =
      window.AbudiDomainErrors?.getStartupErrorMessage;

    const startupMessage =
      typeof getStartupErrorMessage === "function"
        ? getStartupErrorMessage(error)
        : `A required module failed to load: ${error.message}`;

    if (result) {
      result.textContent =
        "Application startup failed:\n" +
        startupMessage;
    }

    console.error(
      "[Abudi Domain Extractor] Bootstrap failed:",
      error
    );
  });
})();
