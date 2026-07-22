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

  window.AbudiDomainDOM = Object.freeze({
    version: "1.9.0",
    getElements
  });
})();
