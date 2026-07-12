// Abudi Cyber Tools v1.8.5 — Password Security Engine
(() => {
  "use strict";

  const $ = id => document.getElementById(id);

  let secureGeneratedPassword = "";
  let securePasswordReport = "";

  const CHARSETS = {
    lower: "abcdefghijklmnopqrstuvwxyz",
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    numbers: "0123456789",
    symbols: "!@#$%^&*()_+-=[]{}|;:,.<>/?~"
  };
