// Abudi Cyber Tools v1.9 — Domain Extractor Pro
(() => {
  "use strict";

  function extractDomain(input) {
    if (typeof input !== "string") {
      throw new Error("INVALID_INPUT_TYPE");
    }

    const raw = input.trim();

    if (!raw) {
      throw new Error("EMPTY_INPUT");
    }

    if (raw.includes("\\")) {
      throw new Error("BACKSLASH_NOT_ALLOWED");
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
    version: "1.9.2",
    extractDomain
  });
})();
