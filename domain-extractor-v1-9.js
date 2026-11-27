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

    if (/[\x00-\x1F\x7F]/.test(raw)) {
      throw new Error("CONTROL_CHARACTERS_NOT_ALLOWED");
    }

    if (raw.includes("\\")) {
      throw new Error("BACKSLASH_NOT_ALLOWED");
    }

    const hasHttpScheme = /^https?:\/\//i.test(raw);
    const looksLikeHostPort =
      /^(?:localhost|[^:/?#.]+(?:\.[^:/?#.]+)+|\[[0-9a-f:.]+\]):\d+(?:[/?#]|$)/i.test(raw);
    const hasExplicitScheme = /^[a-z][a-z\d+.-]*:/i.test(raw);

    if (hasExplicitScheme && !hasHttpScheme && !looksLikeHostPort) {
      throw new Error("UNSUPPORTED_URL_SCHEME");
    }

    const url = new URL(hasHttpScheme ? raw : "https://" + raw);
    const redactSensitiveParameters = value =>
      value.replace(
        /([?&#])(access_token|refresh_token|token|api[_-]?key|password|passwd|secret|sessionid|authorization)=([^&#]*)/gi,
        "$1$2=[REDACTED]"
      );

    return Object.freeze({
      protocol: url.protocol.slice(0, -1),
      hostname: url.hostname.toLowerCase(),
      port: url.port || "default",
      path: url.pathname || "/",
      query: url.search ? redactSensitiveParameters(url.search) : "none",
      fragment: url.hash ? redactSensitiveParameters(url.hash) : "none"
    });
  }

  window.AbudiDomainExtractor = Object.freeze({
    version: "1.9.2",
    extractDomain
  });
})();
