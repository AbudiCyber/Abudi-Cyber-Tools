// Abudi Domain Validation Service v1.9
(() => {
  "use strict";

  const INVALID_DOMAIN_MESSAGE =
    "Please enter a valid domain or URL.\n" +
    "Example: example.com";

  function normalize(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function createInvalidResult(value = "") {
    return Object.freeze({
      valid: false,
      value,
      message: INVALID_DOMAIN_MESSAGE
    });
  }

  function validateInput(value) {
    const normalizedValue = normalize(value);

    if (!normalizedValue) {
      return createInvalidResult();
    }

    return Object.freeze({
      valid: true,
      value: normalizedValue,
      message: ""
    });
  }

  window.AbudiDomainValidationService = Object.freeze({
    version: "1.9.1",
    createInvalidResult,
    validateInput
  });
})();
