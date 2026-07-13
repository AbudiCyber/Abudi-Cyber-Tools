// Abudi Cyber Tools v1.9 — Domain Extractor Pro
(() => {
  "use strict";

  function extractDomain(input) {
    const raw = String(input || "").trim();
    if (!raw) throw new Error("EMPTY_INPUT");
    const url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`);
    return Object.freeze({
      protocol: url.protocol.replace(":", ""),
      hostname: url.hostname.toLowerCase(),
      port: url.port || "default",
      path: url.pathname ||