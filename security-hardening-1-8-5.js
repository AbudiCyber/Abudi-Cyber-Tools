// Abudi Cyber Tools v1.8.5 — Password Security Hardening
(() => {
  "use strict";

  const $ = id => document.getElementById(id);
  let secureGeneratedPassword = "";
  let securePasswordReport = "";

  function secureRandomInt(max) {
    if (!Number.isInteger(max) || max <= 0) {
      throw new Error("Invalid secure random range.");
    }

    const limit = Math.floor(0x100000000 / max) * max;