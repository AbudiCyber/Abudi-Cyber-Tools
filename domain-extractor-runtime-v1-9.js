// Abudi Domain Extractor Runtime v1.9
(() => {
  "use strict";

  function validate() {
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

  window.AbudiDomainRuntime = Object.freeze({
    version: "1.9.0",
    validate
  });
})();
