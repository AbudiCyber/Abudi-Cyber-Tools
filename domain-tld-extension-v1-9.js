// Abudi Domain TLD Extension v1.9
(() => {
  "use strict";

  function isIpAddress(hostname) {
    return (
      hostname.includes(":") ||
      /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname)
    );
  }

  function getTLD(input) {
    const raw = String(input || "").trim();

    if (!raw) {
      throw new Error("EMPTY_INPUT");
    }

    const u = new URL(
      raw.includes("://") ? raw : "https://" + raw
    );

    const hostname = u.hostname.toLowerCase();

    if (hostname === "localhost" || isIpAddress(hostname)) {
      return "none";
    }

    const parts = hostname.split(".").filter(Boolean);

    return parts.length > 1 ? parts.at(-1) : "none";
  }

  window.AbudiDomainTLD = Object.freeze({
    version: "1.9.1",
    getTLD
  });
})();
