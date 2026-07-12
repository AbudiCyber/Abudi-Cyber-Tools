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
    return /^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : `https