// Abudi Cyber Tools v1.9 — Browser-only utilities
(() => {
  "use strict";

  const VERSION = "1.9.0";
  const MULTI_PART_SUFFIXES = new Set([
    "co.uk", "org.uk", "gov.uk", "com.au", "net.au", "co.jp", "com.br", "com.tr"
  ]);

  function normalizeInput(input) {
    const value = String(input || "").trim();
    if (!value) throw new Error("EMPTY_INPUT");
    return /^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : `https://${value}`;
  }

  function isIPv4(hostname) {
    const parts = hostname.split(".");
    return parts.length === 4 && parts.every(part => /^\d+$/.test(part) && Number(part) >= 0 && Number(part) <= 255);
  }

  function isIPv6(hostname) {
    return hostname.includes(":") && /^[0-9a-f:]+$/i.test(hostname);
  }

  function splitDomain(hostname) {
    const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
    if (isIPv4(host) || is