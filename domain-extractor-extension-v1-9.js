// Abudi Domain Extension v1.9
(() => {
  "use strict";

  function getOrigin(input) {
    const raw = String(input || "").trim();
    if (!raw) throw new Error("EMPTY_INPUT");
    if (raw.includes("\\")) throw new Error("BACKSLASH_NOT_ALLOWED");

    const u = new URL(raw.includes("://") ? raw : "https://" + raw);
    return u.origin;
  }

  window.AbudiDomainExtension = Object.freeze({
    version: "1.9.1",
    getOrigin
  });
})();
