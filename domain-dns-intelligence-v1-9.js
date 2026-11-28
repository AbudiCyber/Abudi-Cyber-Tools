// Abudi DNS Intelligence Service v1.0
// Uses Google Public DNS JSON API. DNS queries are opt-in and disclose the
// queried hostname to the resolver; this service never sends page paths,
// query strings, fragments, cookies, or URL credentials.
(() => {
  "use strict";

  const ENDPOINT = "https://dns.google/resolve";
  const DEFAULT_TYPES = Object.freeze([
    "A", "AAAA", "CNAME", "MX", "NS", "TXT", "SOA", "CAA"
  ]);
  const TYPE_CODES = Object.freeze({
    1: "A",
    2: "NS",
    5: "CNAME",
    6: "SOA",
    12: "PTR",
    15: "MX",
    16: "TXT",
    28: "AAAA",
    33: "SRV",
    257: "CAA"
  });
  const ALLOWED_TYPES = new Set(DEFAULT_TYPES);
  const STATUS_NAMES = Object.freeze({
    0: "NOERROR",
    1: "FORMERR",
    2: "SERVFAIL",
    3: "NXDOMAIN",
    4: "NOTIMP",
    5: "REFUSED"
  });
  const MAX_ANSWERS = 128;
  const MAX_DATA_LENGTH = 2048;
  const MAX_CONTENT_LENGTH = 262144;
  const DEFAULT_TIMEOUT_MS = 7000;

  function normalizeHostname(input) {
    if (typeof input !== "string") throw new Error("INVALID_INPUT_TYPE");
    const raw = input.trim();
    if (!raw) throw new Error("EMPTY_INPUT");
    if (/[\x00-\x20\x7f]/.test(raw) || raw.includes("\\")) {
      throw new Error("INVALID_DNS_HOSTNAME");
    }

    let url;
    try {
      url = new URL(/^https?:\/\//i.test(raw) ? raw : "https://" + raw);
    } catch {
      throw new Error("INVALID_DNS_HOSTNAME");
    }

    if (
      !/^https?:$/.test(url.protocol) ||
      url.username ||
      url.password ||
      url.port ||
      url.hostname.startsWith("[") ||
      /^(?:\d{1,3}\.){3}\d{1,3}$/.test(url.hostname) ||
      url.hostname === "localhost" ||
      !url.hostname.includes(".")
    ) {
      throw new Error("DNS_REQUIRES_PUBLIC_DOMAIN");
    }

    const intelligence = window.AbudiPublicSuffixService?.analyze(url.hostname);
    if (!intelligence || intelligence.registrableDomain === "none") {
      throw new Error("DNS_REQUIRES_REGISTRABLE_DOMAIN");
    }

    return url.hostname.toLowerCase();
  }

  function normalizeTypes(types) {
    if (!Array.isArray(types) || types.length === 0 || types.length > 8) {
      throw new Error("DNS_RECORD_TYPES_INVALID");
    }

    const normalized = [...new Set(types.map(type =>
      typeof type === "string" ? type.toUpperCase() : ""
    ))];

    if (
      normalized.length !== types.length ||
      normalized.some(type => !ALLOWED_TYPES.has(type))
    ) {
      throw new Error("DNS_RECORD_TYPE_UNSUPPORTED");
    }

    return normalized;
  }

  function sanitizeData(value) {
    if (typeof value !== "string") return "";
    return value
      .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, "")
      .slice(0, MAX_DATA_LENGTH);
  }

  function parseResponse(payload, requestedType, hostname) {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      throw new Error("DNS_RESPONSE_INVALID");
    }

    if (
      !Number.isInteger(payload.Status) ||
      payload.Status < 0 ||
      payload.Status > 5
    ) {
      throw new Error("DNS_RESPONSE_STATUS_INVALID");
    }

    const status = payload.Status;
    const answers = payload.Answer === undefined ? [] : payload.Answer;

    if (!Array.isArray(answers) || answers.length > MAX_ANSWERS) {
      throw new Error("DNS_ANSWER_SECTION_INVALID");
    }

    const records = answers.map(answer => {
      if (
        !answer ||
        typeof answer !== "object" ||
        typeof answer.name !== "string" ||
        !Number.isInteger(answer.type) ||
        !Number.isFinite(answer.TTL) ||
        answer.TTL < 0 ||
        typeof answer.data !== "string"
      ) {
        throw new Error("DNS_RECORD_INVALID");
      }

      const type = TYPE_CODES[answer.type];
      if (!type) throw new Error("DNS_RECORD_TYPE_UNKNOWN");

      const name = sanitizeData(answer.name);
      const data = sanitizeData(answer.data);
      if (!name || !data) throw new Error("DNS_RECORD_DATA_INVALID");

      return Object.freeze({
        name,
        type,
        ttl: answer.TTL,
        data
      });
    });

    return Object.freeze({
      hostname,
      requestedType,
      status,
      statusName: STATUS_NAMES[status],
      authenticatedData: payload.AD === true,
      recursionAvailable: payload.RA === true,
      truncated: payload.TC === true,
      records: Object.freeze(records)
    });
  }

  async function queryType(hostname, type, options) {
    const controller = new AbortController();
    const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    if (!Number.isInteger(timeoutMs) || timeoutMs < 500 || timeoutMs > 20000) {
      throw new Error("DNS_TIMEOUT_INVALID");
    }

    let timedOut = false;
    const timeoutId = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);

    const abortFromCaller = () => controller.abort();
    options.signal?.addEventListener("abort", abortFromCaller, { once: true });

    try {
      const url = new URL(ENDPOINT);
      url.searchParams.set("name", hostname);
      url.searchParams.set("type", type);
      url.searchParams.set("do", "true");

      const fetcher = options.fetchImpl || window.fetch?.bind(window);
      if (typeof fetcher !== "function") throw new Error("DNS_FETCH_UNAVAILABLE");

      const response = await fetcher(url.toString(), {
        method: "GET",
        mode: "cors",
        credentials: "omit",
        cache: "no-store",
        referrerPolicy: "no-referrer",
        headers: { Accept: "application/dns-json" },
        signal: controller.signal
      });

      if (!response || response.ok !== true) {
        throw new Error("DNS_HTTP_ERROR");
      }

      const contentType = response.headers?.get?.("content-type") || "";
      if (!/application\/(?:dns-json|json)(?:\s*;|$)/i.test(contentType)) {
        throw new Error("DNS_CONTENT_TYPE_INVALID");
      }

      const contentLength = Number(response.headers?.get?.("content-length"));
      if (Number.isFinite(contentLength) && contentLength > MAX_CONTENT_LENGTH) {
        throw new Error("DNS_RESPONSE_TOO_LARGE");
      }

      const payload = await response.json();
      return parseResponse(payload, type, hostname);
    } catch (error) {
      if (timedOut) throw new Error("DNS_TIMEOUT");
      if (options.signal?.aborted) throw new Error("DNS_LOOKUP_CANCELLED");
      if (error?.name === "AbortError") throw new Error("DNS_LOOKUP_CANCELLED");
      throw error;
    } finally {
      clearTimeout(timeoutId);
      options.signal?.removeEventListener("abort", abortFromCaller);
    }
  }

  async function lookup(input, options = {}) {
    const hostname = normalizeHostname(input);
    const types = normalizeTypes(options.types || DEFAULT_TYPES);
    const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    if (!Number.isInteger(timeoutMs) || timeoutMs < 500 || timeoutMs > 20000) {
      throw new Error("DNS_TIMEOUT_INVALID");
    }

    if (options.signal?.aborted) throw new Error("DNS_LOOKUP_CANCELLED");

    const results = await Promise.all(types.map(async type => {
      try {
        return await queryType(hostname, type, options);
      } catch (error) {
        return Object.freeze({
          hostname,
          requestedType: type,
          error: error?.message || "DNS_LOOKUP_FAILED",
          records: Object.freeze([])
        });
      }
    }));

    if (options.signal?.aborted) throw new Error("DNS_LOOKUP_CANCELLED");

    const records = results.flatMap(result => result.records);
    const failures = results.filter(result => result.error);
    return Object.freeze({
      hostname,
      provider: "Google Public DNS",
      providerEndpoint: ENDPOINT,
      queriedAt: new Date().toISOString(),
      results: Object.freeze(results),
      records: Object.freeze(records),
      failures: Object.freeze(failures),
      complete: failures.length === 0
    });
  }

  function format(result) {
    if (!result || !Array.isArray(result.results)) {
      throw new Error("DNS_RESULT_INVALID");
    }

    const lines = [
      "DNS Intelligence — Google Public DNS",
      "Hostname: " + result.hostname,
      "Queries: " + result.results.length,
      "Records returned: " + result.records.length,
      "Resolver: dns.google",
      ""
    ];

    for (const item of result.results) {
      if (item.error) {
        lines.push(item.requestedType + ": ERROR (" + item.error + ")");
        continue;
      }

      lines.push(
        item.requestedType + ": " + item.statusName +
        " | DNSSEC AD flag: " + (item.authenticatedData ? "set" : "not set")
      );

      if (item.records.length === 0) {
        lines.push("  No answer records returned");
      }

      for (const record of item.records) {
        lines.push(
          "  " + record.type +
          " | TTL " + record.ttl + "s" +
          " | " + record.name +
          " | " + record.data
        );
      }
    }

    lines.push("");
    lines.push(
      "Completeness: " + (result.complete ? "all queries completed" : "some queries failed")
    );
    lines.push(
      "Note: AD is a resolver-provided flag, not independent DNSSEC validation."
    );

    return lines.join("\n");
  }

  window.AbudiDNSIntelligence = Object.freeze({
    version: "1.0.0",
    provider: "Google Public DNS",
    supportedTypes: DEFAULT_TYPES,
    normalizeHostname,
    parseResponse,
    lookup,
    format
  });
})();
