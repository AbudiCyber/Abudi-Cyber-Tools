// Abudi Domain Validation Service v1.9
(() => {
  "use strict";

  const INVALID_DOMAIN_MESSAGE =
    "Please enter a valid domain or URL.\n" +
    "Example: example.com";

  const SUPPORTED_PROTOCOLS = Object.freeze([
    "http:",
    "https:"
  ]);

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

    if (
      !normalizedValue ||
      normalizedValue.includes("\\") ||
      /[\\x00-\\x1F\\x7F]/.test(normalizedValue)
    ) {
      return createInvalidResult(normalizedValue);
    }

    const hasHttpScheme = /^https?:\/\//i.test(normalizedValue);
      /^(?:localhost|[^:/?#.]+(?:\.[^:/?#.]+)+|\[[0-9a-f:.]+\]):\d+(?:[/?#]|$)/i.test(normalizedValue);
      /^(?:localhost|[^:/?#.]+(?:\\.[^:/?#.]+)+|\\[[0-9a-f:.]+\\]):\\d+(?:[/?#]|$)/i.test(normalizedValue);
    const hasExplicitScheme = /^[a-z][a-z\d+.-]*:/i.test(normalizedValue);

    if (hasExplicitScheme && !hasHttpScheme && !looksLikeHostPort) {
      return createInvalidResult(normalizedValue);
    }

    try {
      const candidate = hasHttpScheme
        ? normalizedValue
        : "https://" + normalizedValue;

      const url = new URL(candidate);

      if (
        !url.hostname ||
        !SUPPORTED_PROTOCOLS.includes(url.protocol)
      ) {
        return createInvalidResult(normalizedValue);
      }
    } catch {
      return createInvalidResult(normalizedValue);
    }

    return Object.freeze({
      valid: true,
      value: normalizedValue,
      message: ""
    });
  }

  window.AbudiDomainValidationService = Object.freeze({
    version: "1.9.3",
    createInvalidResult,
    validateInput
  });
})();
