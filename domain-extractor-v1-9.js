// Abudi Cyber Tools v1.9 — Domain Extractor Pro
(() => {
  "use strict";

  function extractDomain(input) {
    const raw = String(input || "").trim();

    if (!raw) {
      throw new Error("EMPTY_INPUT");
    }

    const url = new URL(
      raw.includes("://") ? raw : "https://" + raw
    );

    return Object.freeze({
      protocol: url.protocol.slice(0, -1),
      hostname: url.hostname.toLowerCase(),
      port: url.port || "default",
      path: url.pathname || "/",
      query: url.search || "none",
      fragment: url.hash || "none"
    });
  }

  window.AbudiDomainExtractor = Object.freeze({
    version: "1.9.1",
    extractDomain
  });
})();
