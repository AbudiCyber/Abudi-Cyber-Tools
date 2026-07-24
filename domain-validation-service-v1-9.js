// Abudi Domain Validation Service v1.9
(() => {
  "use strict";

  const EMPTY_INPUT_MESSAGE =
    "Please enter a valid domain or URL.\n" +
    "Example: example.com";

  function normalize(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function validateInput(value) {
    const normalizedValue = normalize(value);

    if (!normalizedValue) {
      return Object.freeze({
        valid: false,
        value: "",
        message: EMPTY_INPUT_MESSAGE
      });
    }

    return Object.freeze({
      valid: true,
      value: normalizedValue,
      message: ""
    });
  }

  window.AbudiDomainValidationService = Object.freeze({
    version: "1.9.0",
    validateInput
  });
})();
