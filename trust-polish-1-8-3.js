// Abudi Cyber Tools — v1.8.3 Stability & Trust Polish
// Lightweight, browser-only polish layer. No uploads. No external calls.
(function () {
  const $ = id => document.getElementById(id);

  const toolState = {
    textAnalyzerResult: "Waiting for text input...",
    passwordCheckerResult: "Waiting for password input...",
    passwordGeneratorResult: "Waiting for password generation...",
    linkAnalyzerResult: "Waiting for link input...",
    urlParserResult: "Waiting for URL input...",
    urlCodecResult: "Waiting for URL encode/decode input...",
    ipAnalyzerResult: "Waiting for IP input...",
    hashResult: "Waiting for hash input...",
    fileHashResult: "Waiting for file input...",
    base64Result: "Waiting for Base64 input...",
    emailResult: "Waiting for email input..."
  };

  function setText(id, text) {
    const node = $(id);
    if (node) node.textContent = text;
  }

  function normalizeWaitingMessages() {
    Object.entries(toolState).forEach(([id, text]) => {
      const node = $(id);
      if (!node) return;
      const current = node.textContent.trim().toLowerCase();
      if (current.startsWith("waiting for")) node.textContent = text;
    });
  }

  function addPrivacyNote(anchorId, text) {
    const result = $(anchorId);
    if (!result || result.parentElement.querySelector(`[data-trust-note="${anchorId}"]`)) return;

    const note = document.createElement("div");
    note.className = "privacy-note";
    note.dataset.trustNote = anchorId;
    note.textContent = text;
    result.insertAdjacentElement("beforebegin", note);
  }

  function addTrustNotes() {
    addPrivacyNote("passwordCheckerResult", "🛡️ Runs locally in your browser. Nothing is uploaded.");
    addPrivacyNote("passwordGeneratorResult", "🛡️ Generated locally in your browser. Nothing is uploaded.");
    addPrivacyNote("hashResult", "🛡️ Hashing runs locally in your browser. Nothing is uploaded.");
    addPrivacyNote("fileHashResult", "🛡️ Files are read locally for hashing only. They are not uploaded or executed.");
    addPrivacyNote("ipAnalyzerResult", "🛡️ Offline IP format analysis only. No lookup request is sent.");
  }

  function showInputError(resultId, message) {
    const node = $(resultId);
    if (node) node.textContent = message;
  }

  function resultHasRealValue(resultId) {
    const node = $(resultId);
    if (!node) return false;
    const text = node.textContent.trim().toLowerCase();
    return text && !text.startsWith("waiting for") && !text.startsWith("⚠") && !text.startsWith("❌");
  }

  const inputGuards = [
    { btn: "analyzeTextBtn", input: "textInput", result: "textAnalyzerResult", message: "⚠️ Please enter text first." },
    { btn: "checkPasswordBtn", input: "passwordInput", result: "passwordCheckerResult", message: "⚠️ Please enter a password first." },
    { btn: "analyzeLinkBtn", input: "linkInput", result: "linkAnalyzerResult", message: "⚠️ Please enter a URL or domain first." },
    { btn: "parseUrlBtn", input: "urlParserInput", result: "urlParserResult", message: "⚠️ Please enter a valid URL first." },
    { btn: "generateHashBtn", input: "hashInput", result: "hashResult", message: "⚠️ Please enter text to hash first." },
    { btn: "encodeBtn", input: "base64Input", result: "base64Result", message: "⚠️ Please enter text to encode first." },
    { btn: "decodeBtn", input: "base64Input", result: "base64Result", message: "⚠️ Please enter Base64 text to decode first." },
    { btn: "validateEmailBtn", input: "emailInput", result: "emailResult", message: "⚠️ Please enter an email address first." },
    { btn: "urlEncodeBtn", input: "urlCodecInput", result: "urlCodecResult", message: "⚠️ Please enter URL text to encode first." },
    { btn: "urlDecodeBtn", input: "urlCodecInput", result: "urlCodecResult", message: "⚠️ Please enter encoded URL text to decode first." },
    { btn: "analyzeIpBtn", input: "ipInput", result: "ipAnalyzerResult", message: "⚠️ Please enter an IPv4 or IPv6 address first." }
  ];

  function installInputGuards() {
    inputGuards.forEach(({ btn, input, result, message }) => {
      const button = $(btn);
      const field = $(input);
      if (!button || !field) return;
      button.addEventListener("click", event => {
        if (!field.value.trim()) {
          event.preventDefault();
          event.stopImmediatePropagation();
          showInputError(result, message);
        }
      }, true);
    });

    const fileButton = $("generateFileHashBtn");
    const fileInput = $("fileHashInput");
    if (fileButton && fileInput) {
      fileButton.addEventListener("click", event => {
        if (!fileInput.files || fileInput.files.length === 0) {
          event.preventDefault();
          event.stopImmediatePropagation();
          showInputError("fileHashResult", "⚠️ Please choose a file first.");
        }
      }, true);
    }
  }

  const copyGuards = [
    { btn: "copyTextAnalysisBtn", result: "textAnalyzerResult" },
    { btn: "copyPasswordCheckBtn", result: "passwordCheckerResult" },
    { btn: "copyPasswordBtn", result: "passwordGeneratorResult" },
    { btn: "copyLinkAnalysisBtn", result: "linkAnalyzerResult" },
    { btn: "copyUrlParserBtn", result: "urlParserResult" },
    { btn: "copyUrlCodecBtn", result: "urlCodecResult" },
    { btn: "copyIpAnalysisBtn", result: "ipAnalyzerResult" },
    { btn: "copyHashBtn", result: "hashResult" },
    { btn: "copyFileHashBtn", result: "fileHashResult" },
    { btn: "copyBase64Btn", result: "base64Result" },
    { btn: "copyEmailBtn", result: "emailResult" }
  ];

  function installCopyGuards() {
    copyGuards.forEach(({ btn, result }) => {
      const button = $(btn);
      if (!button) return;
      button.addEventListener("click", event => {
        if (!resultHasRealValue(result)) {
          event.preventDefault();
          event.stopImmediatePropagation();
          showInputError(result, "⚠️ Generate a result before copying.");
        }
      }, true);
    });
  }

  function upgradeFooterVersion() {
    const panel = document.querySelector(".platform-panel");
    const existingBadge = document.querySelector(".version-badge");
    if (existingBadge) {
      existingBadge.textContent = "🚀 v1.8.3";
      return;
    }
    if (!panel) return;
    const badge = document.createElement("div");
    badge.className = "version-badge";
    badge.textContent = "🚀 v1.8.3";
    panel.appendChild(badge);
  }

  normalizeWaitingMessages();
  addTrustNotes();
  installInputGuards();
  installCopyGuards();
  upgradeFooterVersion();
})();
