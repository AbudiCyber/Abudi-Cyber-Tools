// Abudi Domain Security Extension v1.9
(() => {
  "use strict";

  function isSecure(input) {
    if (typeof input !== "string") throw new Error("INVALID_INPUT_TYPE");
    const raw = input.trim();
    if (!raw) throw new Error("EMPTY_INPUT");
    if (raw.includes("\\")) throw new Error("BACKSLASH_NOT_ALLOWED");

    const u = new URL(raw.includes("://") ? raw : "https://" + raw);
    return u.protocol === "https:";
  }

  window.AbudiDomainSecurity = Object.freeze({
    version: "1.9.1",
    isSecure
  });
})();
