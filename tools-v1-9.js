// Abudi Cyber Tools v1.9 — Browser-only utilities
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
    return {
      protocol: url.protocol.replace(":", ""),
      hostname: url.hostname,
      port: url.port