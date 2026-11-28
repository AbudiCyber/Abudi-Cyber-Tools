// Abudi Domain Extractor Actions v1.9
(() => {
  "use strict";

  const WAITING_MESSAGE = "Waiting for domain input...";
  const COPY_PROMPT_MESSAGE = "Analyze a domain before copying the result.";
  let dnsController = null;
  let dnsRequestId = 0;

  function cancelDNSLookup() {
    dnsRequestId += 1;
    dnsController?.abort();
    dnsController = null;
    const { dnsButton } = window.AbudiDomainDOM.getElements();
    if (dnsButton) {
      dnsButton.disabled = false;
      dnsButton.textContent = "Resolve DNS Records";
    }
  }

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
      !window.AbudiDomainUI ||
      typeof window.AbudiDomainUI.formatExtended !== "function" ||
      typeof window.AbudiDomainValidationService?.validateInput !== "function" ||
      typeof window.AbudiDomainValidationService?.createInvalidResult !== "function" ||
      typeof window.AbudiDomainResultService?.setText !== "function"
    ) {
      throw new Error("ANALYZE_ACTION_NOT_READY");
    }

    analyzeButton.onclick = () => {
      cancelDNSLookup();
      const validation =
        window.AbudiDomainValidationService.validateInput(input.value);

      if (!validation.valid) {
        window.AbudiDomainResultService.setText(
          result,
          validation.message
        );
        return;
      }

      try {
        const base =
          window.AbudiDomainExtractor.extractDomain(validation.value);

        const formattedResult =
          window.AbudiDomainUI.formatExtended(
            base,
            validation.value
          );

        window.AbudiDomainResultService.setText(
          result,
          formattedResult
        );
      } catch (error) {
        const invalidResult =
          window.AbudiDomainValidationService.createInvalidResult(
            validation.value
          );

        window.AbudiDomainResultService.setText(
          result,
          invalidResult.message
        );

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

    if (
      !input ||
      !result ||
      !clearButton ||
      typeof window.AbudiDomainResultService?.setText !== "function"
    ) {
      throw new Error("CLEAR_ACTION_DOM_NOT_READY");
    }

    clearButton.onclick = () => {
      cancelDNSLookup();
      input.value = "";
      window.AbudiDomainResultService.setText(
        result,
        WAITING_MESSAGE
      );
    };
  }

  function bindCopyAction() {
    const {
      result,
      copyButton
    } = window.AbudiDomainDOM.getElements();

    if (
      !result ||
      !copyButton ||
      typeof window.AbudiDomainClipboardService?.copy !== "function" ||
      typeof window.AbudiDomainResultService?.getText !== "function" ||
      typeof window.AbudiDomainResultService?.setText !== "function" ||
      typeof window.AbudiDomainUI?.setTemporaryButtonText !== "function"
    ) {
      throw new Error("COPY_ACTION_NOT_READY");
    }

    copyButton.onclick = async () => {
      const text =
        window.AbudiDomainResultService.getText(result);

      if (!text || text === WAITING_MESSAGE) {
        window.AbudiDomainResultService.setText(
          result,
          COPY_PROMPT_MESSAGE
        );
        return;
      }

      try {
        const copied =
          await window.AbudiDomainClipboardService.copy(text);

        window.AbudiDomainUI.setTemporaryButtonText(
          copyButton,
          copied ? "✅ Copied" : "❌ Copy failed"
        );

        if (!copied) {
          console.error(
            "[Abudi Domain Extractor] Copy failed: clipboard service returned false."
          );
        }
      } catch (error) {
        window.AbudiDomainUI.setTemporaryButtonText(copyButton, "❌ Copy failed");

        console.error(
          "[Abudi Domain Extractor] Copy failed:",
          error
        );
      }
    };
  }

  function bindDNSAction() {
    const { input, result, dnsButton } = window.AbudiDomainDOM.getElements();

    if (
      !input || !result || !dnsButton ||
      typeof window.AbudiDNSIntelligence?.lookup !== "function" ||
      typeof window.AbudiDNSIntelligence?.format !== "function" ||
      typeof window.AbudiDomainValidationService?.validateInput !== "function" ||
      typeof window.AbudiDomainResultService?.setText !== "function"
    ) {
      throw new Error("DNS_ACTION_NOT_READY");
    }

    dnsButton.onclick = async () => {
      cancelDNSLookup();
      const requestId = dnsRequestId;
      const validation = window.AbudiDomainValidationService.validateInput(input.value);

      if (!validation.valid) {
        window.AbudiDomainResultService.setText(result, validation.message);
        return;
      }

      dnsController = new AbortController();
      dnsButton.disabled = true;
      dnsButton.textContent = "Resolving DNS…";
      window.AbudiDomainResultService.setText(
        result,
        "DNS lookup in progress. The hostname is being sent to Google Public DNS."
      );

      try {
        const hostname =
          window.AbudiDomainExtractor.extractDomain(validation.value).hostname;
        const report = await window.AbudiDNSIntelligence.lookup(
          hostname,
          { signal: dnsController.signal }
        );
        if (requestId !== dnsRequestId) return;
        window.AbudiDomainResultService.setText(
          result,
          window.AbudiDNSIntelligence.format(report)
        );
      } catch (error) {
        if (requestId !== dnsRequestId) return;
        const message = error?.message === "DNS_LOOKUP_CANCELLED"
          ? "DNS lookup cancelled."
          : "DNS lookup failed: " + (error?.message || "DNS_LOOKUP_FAILED");
        window.AbudiDomainResultService.setText(result, message);
      } finally {
        if (requestId === dnsRequestId) {
          dnsController = null;
          dnsButton.disabled = false;
          dnsButton.textContent = "Resolve DNS Records";
        }
      }
    };
  }

  function bindAllActions() {
    bindDNSAction();
    bindAnalyzeAction();
    bindCopyAction();
    bindClearAction();
  }

  window.AbudiDomainActions = Object.freeze({
    version: "1.9.16",
    bindAllActions,
    bindAnalyzeAction,
    bindClearAction,
    bindCopyAction,
    bindDNSAction
  });
})();
