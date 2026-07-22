// Abudi Domain Extractor Bootstrap v1.9
(() => {
  "use strict";

  const files = [
    "domain-extractor-errors-v1-9.js",
    "domain-extractor-dom-v1-9.js",
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

      script.src = src + "?v=1-9-11";

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
