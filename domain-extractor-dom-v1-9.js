// Abudi Domain Extractor DOM v1.9
(() => {
  "use strict";

  function getElements() {
    return Object.freeze({
      input: document.getElementById("i"),
      result: document.getElementById("r"),
      analyzeButton: document.getElementById("a"),
      copyButton: document.getElementById("c"),
      clearButton: document.getElementById("x"),
      dnsButton: document.getElementById("dns")
    });
  }

  function validateElements() {
    const {
      input,
      result,
      analyzeButton,
      copyButton,
      clearButton,
      dnsButton
    } = getElements();

    if (
      !input ||
      !result ||
      !analyzeButton ||
      !copyButton ||
      !clearButton ||
      !dnsButton
    ) {
      throw new Error("DOM_NOT_READY");
    }
  }

  window.AbudiDomainDOM = Object.freeze({
    version: "1.9.2",
    getElements,
    validateElements
  });
})();
