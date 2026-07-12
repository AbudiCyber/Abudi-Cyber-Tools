// Abudi Cyber Tools v1.8.5 — Password Security Hardening
(() => {
  "use strict";

  const $ = id => document.getElementById(id);
  const encoder = new TextEncoder();
  let secureGeneratedPassword = "";
  let securePasswordReport = "";

  function sanitize(value) {
    return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function secureRandomInt(max) {
    if (!Number.isInteger(max) || max <= 0) throw new Error("Invalid secure random range.");
    const limit = Math.floor(