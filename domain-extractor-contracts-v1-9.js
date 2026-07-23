// Abudi Domain Extractor Contracts v1.9
(() => {
  "use strict";

  const MODULE_CONTRACTS = Object.freeze([
    Object.freeze({
      errorCode: "DOMAIN_ERRORS_NOT_READY",
      checks: Object.freeze([
        () => window.AbudiDomainErrors?.getStartupErrorMessage
      ])
    }),
    Object.freeze({
      errorCode: "DOMAIN_DOM_NOT_READY",
      checks: Object.freeze([
        () => window.AbudiDomainDOM?.getElements,
        () => window.AbudiDomainDOM?.validateElements
      ])
    }),
    Object.freeze({
      errorCode: "DOMAIN_EXTRACTOR_NOT_READY",
      checks: Object.freeze([
        () => window.AbudiDomainExtractor?.extractDomain
      ])
    }),
    Object.freeze({
      errorCode: "DOMAIN_UI_NOT_READY",
      checks: Object.freeze([
        () => window.AbudiDomainUI?.formatExtended
      ])
    }),
    Object.freeze({
      errorCode: "DOMAIN_CLIPBOARD_SERVICE_NOT_READY",
      checks: Object.freeze([
        () => window.AbudiDomainClipboardService?.copy
      ])
    }),
    Object.freeze({
      errorCode: "DOMAIN_ACTIONS_NOT_READY",
      checks: Object.freeze([
        () => window.AbudiDomainActions?.bindAllActions
      ])
    })
  ]);

  function validateContract(contract) {
    const isReady = contract.checks.every(
      check => typeof check() === "function"
    );

    if (!isReady) {
      throw new Error(contract.errorCode);
    }
  }

  function validateModules() {
    MODULE_CONTRACTS.forEach(validateContract);
  }

  window.AbudiDomainContracts = Object.freeze({
    version: "1.9.2",
    validateModules
  });
})();
