// Abudi Cyber Tools v1.9 — Domain Extractor Pro
(() => {
  "use strict";

  function normalizeInput(input) {
    const value = String(input || "").trim();
    if (!value) throw new Error("EMPTY_INPUT");
    return /^[a-z][a-z0-9+.-]*:\/\//i.test(value)
      ? value
      : `https://${value}`;
  }

  function extractDomain(input) {
    const url = new URL(normalizeInput(input));
    return Object.freeze({
      protocol: url.protocol.replace(":", ""),
      hostname: url.hostname.toLowerCase(),
      port: url.port || "default",
      path: url.pathname || "/",
      query: url