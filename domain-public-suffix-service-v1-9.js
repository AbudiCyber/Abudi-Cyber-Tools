// Abudi Public Suffix Intelligence Service v1.0
// Implements the Public Suffix List prevailing-rule algorithm, including
// exact, wildcard, and exception rules. Data is vendored locally.
(() => {
  "use strict";

  const source = window.AbudiPublicSuffixList;
  if (!source || !Array.isArray(source.rules)) {
    throw new Error("PUBLIC_SUFFIX_LIST_NOT_READY");
  }

  const exactRules = new Set();
  const wildcardRules = new Set();
  const exceptionRules = new Set();

  function toASCII(value) {
    try {
      return new URL("https://" + value).hostname.toLowerCase();
    } catch {
      throw new Error("INVALID_DOMAIN_HOST");
    }
  }

  for (const rawRule of source.rules) {
    let rule = rawRule.toLowerCase();
    let target = exactRules;

    if (rule.startsWith("!")) {
      target = exceptionRules;
      rule = rule.slice(1);
    } else if (rule.startsWith("*.")) {
      target = wildcardRules;
      rule = rule.slice(2);
    }

    target.add(toASCII(rule));
  }

  function parseHostname(input) {
    if (typeof input !== "string") {
      throw new Error("INVALID_INPUT_TYPE");
    }

    const raw = input.trim();
    if (!raw) throw new Error("EMPTY_INPUT");
    if (/[\x00-\x1F\x7F]/.test(raw)) {
      throw new Error("CONTROL_CHARACTERS_NOT_ALLOWED");
    }
    if (raw.includes("\\")) throw new Error("BACKSLASH_NOT_ALLOWED");

    const hasHttpScheme = /^https?:\/\//i.test(raw);
    const looksLikeHostPort =
      /^(?:localhost|[^:/?#.]+(?:\.[^:/?#.]+)+|\[[0-9a-f:.]+\]):\d+(?:[/?#]|$)/i.test(raw);
    const hasExplicitScheme = /^[a-z][a-z\d+.-]*:/i.test(raw);

    if (hasExplicitScheme && !hasHttpScheme && !looksLikeHostPort) {
      throw new Error("UNSUPPORTED_URL_SCHEME");
    }

    const url = new URL(hasHttpScheme ? raw : "https://" + raw);
    if (url.username || url.password) {
      throw new Error("URL_CREDENTIALS_NOT_ALLOWED");
    }

    return url.hostname.toLowerCase();
  }

  function isIPAddress(hostname) {
    return hostname.startsWith("[") ||
      /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname);
  }

  function getPublicSuffix(hostname) {
    const labels = hostname.split(".").filter(Boolean);
    let bestLength = 1;
    let exceptionLength = 0;

    for (let start = 0; start < labels.length; start += 1) {
      const candidate = labels.slice(start).join(".");
      const candidateLength = labels.length - start;

      if (exceptionRules.has(candidate) && candidateLength > exceptionLength) {
        exceptionLength = candidateLength;
      }

      if (exactRules.has(candidate) && candidateLength > bestLength) {
        bestLength = candidateLength;
      }

      if (
        start > 0 &&
        wildcardRules.has(candidate) &&
        candidateLength + 1 > bestLength
      ) {
        bestLength = candidateLength + 1;
      }
    }

    const suffixLength = exceptionLength
      ? exceptionLength - 1
      : bestLength;

    return labels.slice(-suffixLength).join(".");
  }

  function analyze(input) {
    const hostname = parseHostname(input);
    if (hostname === "localhost" || isIPAddress(hostname)) {
      return Object.freeze({
        hostname,
        publicSuffix: "none",
        registrableDomain: "none",
        subdomain: "none",
        tld: "none"
      });
    }

    const labels = hostname.split(".").filter(Boolean);
    const publicSuffix = getPublicSuffix(hostname);
    const suffixLabels = publicSuffix.split(".");
    const registrableCount = suffixLabels.length + 1;
    const registrableDomain = labels.length >= registrableCount
      ? labels.slice(-registrableCount).join(".")
      : "none";
    const subdomain = registrableDomain === "none"
      ? "none"
      : labels.length > registrableCount
        ? labels.slice(0, -registrableCount).join(".")
        : "none";

    return Object.freeze({
      hostname,
      publicSuffix,
      registrableDomain,
      subdomain,
      tld: labels.at(-1) || "none"
    });
  }

  function getTLD(input) {
    return analyze(input).tld;
  }

  function getSubdomain(input) {
    return analyze(input).subdomain;
  }

  window.AbudiPublicSuffixService = Object.freeze({
    version: "1.0.0",
    listVersion: source.version,
    analyze,
    getPublicSuffix: input => analyze(input).publicSuffix,
    getRegistrableDomain: input => analyze(input).registrableDomain,
    getTLD,
    getSubdomain
  });
})();
