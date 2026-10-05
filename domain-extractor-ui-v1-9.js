// Abudi Domain Extractor UI v1.9
(() => {
  "use strict";

  function formatExtended(base, input) {
    const lines = [
      "Protocol: " + base.protocol,
      "Hostname: " + base.hostname,
      "Port: " + base.port,
      "Path: " + base.path,
      "Query: " + base.query,
      "Fragment: " + base.fragment
    ];

    if (window.AbudiDomainExtension) {
      lines.push(
        "Origin: " + window.AbudiDomainExtension.getOrigin(input)
      );
    }

    if (window.AbudiDomainSecurity) {
      lines.push(
        "Secure: " +
        (window.AbudiDomainSecurity.isSecure(input) ? "Yes" : "No")
      );
    }

    if (window.AbudiDomainTLD) {
      lines.push(
        "TLD: " + window.AbudiDomainTLD.getTLD(input)
      );
    }

    if (window.AbudiDomainSubdomain) {
      lines.push(
        "Subdomain: " + window.AbudiDomainSubdomain.getSubdomain(input)
      );
    }

    return lines.join("\n");
  }

  function setTemporaryButtonText(button, text, duration = 1500) {
    if (!button) {
      throw new Error("UI_BUTTON_NOT_READY");
    }

    const originalText = button.textContent;

    button.textContent = text;

    const timeoutId = window.setTimeout(() => {
      if (button.textContent === text) {
        button.textContent = originalText;
      }
    }, duration);

    return timeoutId;
  }

  window.AbudiDomainUI = Object.freeze({
    version: "1.9.2",
    formatExtended,
    setTemporaryButtonText
  });
})();
