// Abudi Domain Result Service v1.9
(() => {
  "use strict";

  function validateElement(element) {
    if (!element) {
      throw new Error("DOMAIN_RESULT_ELEMENT_NOT_READY");
    }
  }

  function getText(element) {
    validateElement(element);

    return typeof element.textContent === "string"
      ? element.textContent.trim()
      : "";
  }

  function setText(element, text) {
    validateElement(element);

    element.textContent = typeof text === "string" ? text : "";
  }

  window.AbudiDomainResultService = Object.freeze({
    version: "1.9.1",
    getText,
    setText
  });
})();
