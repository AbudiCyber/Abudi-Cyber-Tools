// Abudi Domain Result Service v1.9
(() => {
  "use strict";

  function setText(element, text) {
    if (!element) {
      throw new Error("DOMAIN_RESULT_ELEMENT_NOT_READY");
    }

    element.textContent = typeof text === "string" ? text : "";
  }

  window.AbudiDomainResultService = Object.freeze({
    version: "1.9.0",
    setText
  });
})();
