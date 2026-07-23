// Abudi Domain Extractor Actions v1.9
(() => {
  "use strict";

  const WAITING_MESSAGE = "Waiting for domain input...";
  const COPY_PROMPT_MESSAGE = "Analyze a domain before copying the result.";
  const INVALID_DOMAIN_MESSAGE =
    "Please enter a valid domain or URL.\n" +
    "Example: example.com";

  function bindAnalyzeAction() {
    const {
      input,
      result,
      analyzeButton
    } = window.AbudiDomainDOM.getElements();

    if (
      !input ||
      !result ||
      !analyzeButton ||
      !window.AbudiDomainExtractor ||
      !window.AbudiDomainUI
    ) {
      throw new Error("ANALYZE_ACTION_NOT_READY");
    }

    analyzeButton.onclick = () => {
      try {
        const base =
          window.AbudiDomainExtractor.extractDomain(input.value);

        result.textContent =
          window.AbudiDomainUI.formatExtended(
            base,
            input.value
          );
      } catch (error) {
        result.textContent = INVALID_DOMAIN_MESSAGE;

        console.error(
          "[Abudi Domain Extractor] Analysis failed:",
          error
        );
      }
    };
  }

  function bindClearAction() {
    const {
      input,
      result,
      clearButton
    } = window.AbudiDomainDOM.getElements();

    if (!input || !result || !clearButton) {
      throw new Error("CLEAR_ACTION_DOM_NOT_READY");
    }

    clearButton.onclick = () => {
      input.value = "";
      result.textContent = WAITING_MESSAGE;
    };
  }

  function setTemporaryButtonText(button, text) {
    const originalText = button.textContent;
    button.textContent = text;

    window.setTimeout(() => {
      button.textContent = originalText;
    }, 1500);
  }

  function bindCopyAction() {
    const {
      result,
      copyButton
    } = window.AbudiDomainDOM.getElements();

    if (
      !result ||
      !copyButton ||
      typeof window.AbudiDomainClipboardService?.copy !== "function"
    ) {
      throw new Error("COPY_ACTION_NOT_READY");
    }

    copyButton.onclick = async () => {
      const text = result.textContent.trim();

      if (!text || text === WAITING_MESSAGE) {
        result.textContent = COPY_PROMPT_MESSAGE;
        return;
      }

      try {
        const copied =
          await window.AbudiDomainClipboardService.copy(text);

        setTemporaryButtonText(
          copyButton,
          copied ? "✅ Copied" : "❌ Copy failed"
        );

        if (!copied) {
          console.error(
            "[Abudi Domain Extractor] Copy failed: clipboard service returned false."
          );
        }
      } catch (error) {
        setTemporaryButtonText(copyButton, "❌ Copy failed");

        console.error(
          "[Abudi Domain Extractor] Copy failed:",
          error
        );
      }
    };
  }

  function bindAllActions() {
    bindAnalyzeAction();
    bindCopyAction();
    bindClearAction();
  }

  window.AbudiDomainActions = Object.freeze({
    version: "1.9.8",
    bindAllActions,
    bindAnalyzeAction,
    bindClearAction,
    bindCopyAction
  });
})();
