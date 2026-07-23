// Abudi Domain Extractor Bootstrap v1.9
(() => {
  "use strict";

  const CACHE_VERSION = "1-9-14";

  const files = [
    "domain-extractor-errors-v1-9.js",
    "domain-extractor-dom-v1-9.js",
    "domain-extractor-contracts-v1-9.js",
    "domain-extractor-runtime-v1-9.js",
    "domain-extractor-extension-v1-9.js",
    "domain-security-extension-v1-9.js",
    "domain-tld-extension-v1-9.js",
    "domain-subdomain-extension-v1-9.js",
    "domain-extractor-ui-v1-9.js",
    "domain-clipboard-service-v1-9.js",
    "domain-extractor-actions-v1-9.js"
  ];

  function createModuleLoadError(src) {
    const error = new Error("MODULE_LOAD_FAILED");
    error.moduleFile = src;

    return error;
  }

  function load(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");

      script.src = `${src}?v=${CACHE_VERSION}`;

      script.onload = () => {
        resolve(src);
      };

      script.onerror = () => {
        reject(createModuleLoadError(src));
      };

      document.head.appendChild(script);
    });
  }

  function getResultElement() {
    try {
      const getElements = window.AbudiDomainDOM?.getElements;

      if (typeof getElements === "function") {
        return getElements().result;
      }
    } catch (error) {
      console.warn(
        "[Abudi Domain Extractor] DOM module fallback activated:",
        error
      );
    }

    return document.getElementById("r");
  }

  function getStartupMessage(error) {
    if (error?.message === "MODULE_LOAD_FAILED" && error.moduleFile) {
      return `Failed to load required module: ${error.moduleFile}`;
    }

    const getStartupErrorMessage =
      window.AbudiDomainErrors?.getStartupErrorMessage;

    if (typeof getStartupErrorMessage === "function") {
      return getStartupErrorMessage(error);
    }

    return `A required module failed to load: ${error?.message || "UNKNOWN_STARTUP_ERROR"}`;
  }

  async function start() {
    for (const file of files) {
      await load(file);
    }

    window.AbudiDomainRuntime.validate();
    window.AbudiDomainActions.bindAllActions();
  }

  start().catch(error => {
    const result = getResultElement();
    const startupMessage = getStartupMessage(error);

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
