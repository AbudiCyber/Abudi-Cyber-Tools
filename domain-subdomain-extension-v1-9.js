// Abudi Domain Subdomain Extension v1.9
(() => {
  "use strict";

  function isIpAddress(hostname) {
    return (
      hostname.includes(":") ||
      /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname)
    );
  }

  function getSubdomain(input) {
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

    return parts.length > 2
      ? parts.slice(0, -2).join(".")
      : "none";
  }

  window.AbudiDomainSubdomain = Object.freeze({
    version: "1.9.1",
    getSubdomain
  });
})();
