// Abudi Domain Clipboard Service v1.9
(() => {
  "use strict";

  function copyWithFallback(text) {
    const textarea = document.createElement("textarea");

    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";

    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);

    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);

    return copied;
  }

  async function copy(text) {
    if (typeof text !== "string" || !text.trim()) {
      throw new Error("CLIPBOARD_TEXT_INVALID");
    }

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (error) {
        console.warn(
          "[Abudi Domain Extractor] Clipboard API failed, using fallback:",
          error
        );
      }
    }

    return copyWithFallback(text);
  }

  window.AbudiDomainClipboardService = Object.freeze({
    version: "1.9.0",
    copy
  });
})();
