// Abudi Cyber Tools v1.8.6 — Password Security Engine
(() => {
  "use strict";

  const $ = id => document.getElementById(id);
  const CHARSETS = {
    lower: "abcdefghijklmnopqrstuvwxyz",
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    numbers: "0123456789",
    symbols: "!@#$%^&*()_+-=[]{}|;:,.<>/?~"
  };

  const COMMON_PASSWORDS = new Set([
    "123456", "123456789", "password", "qwerty", "abc123", "