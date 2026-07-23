// Abudi Domain Extractor DOM v1.9
(() => {
  "use strict";

  function getElements() {
    return Object.freeze({
      input: document.getElementById("i"),
      result: document.getElementById("r"),
      analyzeButton: document.getElementById("a"),
      copyButton: document.getElementById("c"),
      clearButton: document.getElementById("x")
    });
  }

  function validateElements() {
    const {
      input,
      result,
      analyzeButton,
      copyButton,
      clearButton
    } = getElements();

    if (
      !input ||
      !result ||
      !analyzeButton ||
      !copyButton ||
      !clearButton
    ) {
      throw new Error("DOM_NOT_READY");
    }
  }

  window.AbudiDomainDOM = Object.freeze({
    version: "1.9.1",
    getElements,
    validateElements
  });
})();
