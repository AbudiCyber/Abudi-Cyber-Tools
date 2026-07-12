// Abudi Cyber Tools v1.8.6 — Password Security Engine
// Browser-only module. No network requests. No password is uploaded.
(() => {
  "use strict";

  const VERSION = "1.8.6";

  const CHARSETS = {
    lower: "abcdefghijklmnopqrstuvwxyz",
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    numbers: "0123456789",
    symbols: "!@#$%^&*()_+-=[]{}|;:,.<>/?~"
  };

  const COMMON_PASSWORDS =