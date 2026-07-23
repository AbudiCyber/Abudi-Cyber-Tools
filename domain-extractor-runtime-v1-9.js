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
    window.AbudiDomainDOM.validateElements();
  }

  window.AbudiDomainRuntime = Object.freeze({
    version: "1.9.3",
    validate
  });
})();
