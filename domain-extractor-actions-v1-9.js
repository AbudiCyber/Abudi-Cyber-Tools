// Abudi Domain Extractor Actions v1.9
(() => {
  "use strict";

  function bindClearAction() {
    const input = document.getElementById("i");
    const result = document.getElementById("r");
    const clearButton = document.getElementById("x");

    if (!input || !result || !clearButton) {
      throw new Error("CLEAR_ACTION_DOM_NOT_READY");
    }

    clearButton.onclick = () => {
      input.value = "";
      result.textContent = "Waiting for domain input...";
      input.focus();
    };
  }

  window.AbudiDomainActions = Object.freeze({
    version: "1.9.0",
    bindClearAction
  });
})();
