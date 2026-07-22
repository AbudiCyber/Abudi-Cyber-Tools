// Abudi Domain Extractor Contracts v1.9
(() => {
  "use strict";

  function validateModules() {
    if (
      typeof window.AbudiDomainErrors?.getStartupErrorMessage !== "function"
    ) {
      throw new Error("DOMAIN_ERRORS_NOT_READY");
    }

    if (
      typeof window.AbudiDomainDOM?.getElements !== "function"
    ) {
      throw new Error("DOMAIN_DOM_NOT_READY");
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

  window.AbudiDomainContracts = Object.freeze({
    version: "1.9.0",
    validateModules
  });
})();
