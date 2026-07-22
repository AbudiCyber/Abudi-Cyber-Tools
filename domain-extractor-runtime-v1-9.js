// Abudi Domain Extractor Runtime v1.9
(() => {
  "use strict";

  function validate() {
    if (
      typeof window.AbudiDomainDOM?.getElements !== "function"
    ) {
      throw new Error("DOMAIN_DOM_NOT_READY");
    }

    const {
      input,
      result,
      analyzeButton
    } = window.AbudiDomainDOM.getElements();

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
    version: "1.9.1",
    validate
  });
})();
