// Abudi Domain Extractor Runtime v1.9
(() => {
  "use strict";

  function validate() {
    if (
      typeof window.AbudiDomainContracts?.validateModules !== "function"
    ) {
      throw new Error("DOMAIN_CONTRACTS_NOT_READY");
    }

    window.AbudiDomainContracts.validateModules();

    const {
      input,
      result,
      analyzeButton
    } = window.AbudiDomainDOM.getElements();

    if (!input || !result || !analyzeButton) {
      throw new Error("DOM_NOT_READY");
    }
  }

  window.AbudiDomainRuntime = Object.freeze({
    version: "1.9.2",
    validate
  });
})();
