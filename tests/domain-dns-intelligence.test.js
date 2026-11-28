"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const sourcePath = path.join(
  __dirname,
  "..",
  "domain-dns-intelligence-v1-9.js"
);
const source = fs.readFileSync(sourcePath, "utf8");

function createService() {
  const window = {
    AbudiPublicSuffixService: {
      analyze(hostname) {
        return {
          hostname,
          registrableDomain: hostname.endsWith(".com") ? hostname : "none"
        };
      }
    }
  };

  vm.runInNewContext(source, {
    window,
    URL,
    AbortController,
    setTimeout,
    clearTimeout,
    Date,
    Object,
    Array,
    Number,
    String,
    Set,
    Promise,
    Error,
    RegExp
  }, { filename: "domain-dns-intelligence-v1-9.js" });

  return window.AbudiDNSIntelligence;
}

function response(payload, options = {}) {
  return {
    ok: options.ok !== false,
    headers: {
      get(name) {
        if (name.toLowerCase() === "content-type") {
          return options.contentType || "application/dns-json; charset=UTF-8";
        }
        if (name.toLowerCase() === "content-length") {
          return options.contentLength || "128";
        }
        return null;
      }
    },
    json: async () => payload
  };
}

(async () => {
  const service = createService();

  assert.equal(service.version, "1.0.0");
  assert.deepEqual(
    Array.from(service.supportedTypes),
    ["A", "AAAA", "CNAME", "MX", "NS", "TXT", "SOA", "CAA"]
  );

  assert.equal(
    service.normalizeHostname("https://Example.COM/path?token=private#fragment"),
    "example.com",
    "Only the hostname must be sent to the resolver."
  );
  assert.equal(
    service.normalizeHostname("https://bücher.com/path"),
    "xn--bcher-kva.com"
  );

  for (const invalid of [
    "",
    "localhost",
    "127.0.0.1",
    "https://[::1]/",
    "https://user:pass@example.com",
    "https://example.com:8443",
    "https://example.com\\@evil.com",
    "https://bad..example.com",
    "https://bad_label.example.com",
    "not a domain",
    "co.uk"
  ]) {
    assert.throws(
      () => service.normalizeHostname(invalid),
      undefined,
      "Unsafe or non-registrable DNS input must be rejected: " + invalid
    );
  }

  assert.throws(
    () => service.normalizeHostname(null),
    error => error.message === "INVALID_INPUT_TYPE"
  );

  assert.throws(
    () => service.parseResponse({
      Status: 0,
      Question: [{ name: "attacker.example.", type: 1 }],
      Answer: []
    }, "A", "example.com"),
    error => error.message === "DNS_QUESTION_MISMATCH"
  );
  assert.throws(
    () => service.parseResponse({
      Status: 0,
      Question: "invalid",
      Answer: []
    }, "A", "example.com"),
    error => error.message === "DNS_QUESTION_SECTION_INVALID"
  );

  const parsed = service.parseResponse({
    Status: 0,
    Question: [{ name: "example.com.", type: 1 }],
    AD: true,
    RA: true,
    Answer: [
      { name: "example.com.", type: 1, TTL: 300, data: "192.0.2.10" },
      { name: "example.com.", type: 28, TTL: 60, data: "2001:db8::10" }
    ]
  }, "A", "example.com");

  assert.equal(parsed.statusName, "NOERROR");
  assert.equal(parsed.authenticatedData, true);
  assert.equal(parsed.recursionAvailable, true);
  assert.equal(parsed.records.length, 2);
  assert.equal(parsed.records[0].type, "A");
  assert.equal(parsed.records[0].data, "192.0.2.10");
  assert.equal(Object.isFrozen(parsed), true);
  assert.equal(Object.isFrozen(parsed.records), true);
  assert.equal(Object.isFrozen(parsed.records[0]), true);

  assert.throws(
    () => service.parseResponse({ Status: 65536, Question: [{ name: "example.com.", type: 1 }] }, "A", "example.com"),
    error => error.message === "DNS_RESPONSE_STATUS_INVALID"
  );
  assert.throws(
    () => service.parseResponse({ Status: 0, Answer: [] }, "A", "example.com"),
    error => error.message === "DNS_QUESTION_SECTION_INVALID"
  );
  const extendedRcode = service.parseResponse({
    Status: 23,
    Question: [{ name: "example.com.", type: 1 }],
    Answer: []
  }, "A", "example.com");
  assert.equal(extendedRcode.statusName, "BADCOOKIE");
  const unassignedRcode = service.parseResponse({
    Status: 11,
    Question: [{ name: "example.com.", type: 1 }],
    Answer: []
  }, "A", "example.com");
  assert.equal(unassignedRcode.statusName, "DSOTYPENI");
  assert.throws(
    () => service.parseResponse({
      Status: 0,
      Question: [{ name: "example.com.", type: 1 }],
      Answer: "bad"
    }, "A", "example.com"),
    error => error.message === "DNS_ANSWER_SECTION_INVALID"
  );
  assert.throws(
    () => service.parseResponse({
      Status: 0,
      Question: [{ name: "example.com.", type: 1 }],
      Answer: [{ name: "example.com.", type: 1, TTL: -1, data: "192.0.2.1" }]
    }, "A", "example.com"),
    error => error.message === "DNS_RECORD_INVALID"
  );
  assert.throws(
    () => service.parseResponse({
      Status: 0,
      Question: [{ name: "example.com.", type: 1 }],
      Answer: [{ name: "example.com.", type: 65000, TTL: 10, data: "opaque" }]
    }, "A", "example.com"),
    error => error.message === "DNS_RECORD_TYPE_UNKNOWN"
  );
  assert.throws(
    () => service.parseResponse({
      Status: 0,
      Question: [{ name: "example.com.", type: 1 }],
      Answer: Array.from({ length: 129 }, () => ({
        name: "example.com.", type: 1, TTL: 10, data: "192.0.2.1"
      }))
    }, "A", "example.com"),
    error => error.message === "DNS_ANSWER_SECTION_INVALID"
  );

  for (const invalidTTL of [1.5, -1, 4294967296, NaN, Infinity]) {
    assert.throws(
      () => service.parseResponse({
        Status: 0,
        Question: [{ name: "example.com.", type: 1 }],
        Answer: [{ name: "example.com.", type: 1, TTL: invalidTTL, data: "192.0.2.1" }]
      }, "A", "example.com"),
      error => error.message === "DNS_RECORD_INVALID"
    );
  }
  assert.throws(
    () => service.parseResponse({
      Status: 0,
      Question: [{ name: "example.com.", type: 1 }],
      Answer: [{ name: "example.com.", type: 1, TTL: 1, data: "line1\nline2" }]
    }, "A", "example.com"),
    error => error.message === "DNS_RECORD_DATA_INVALID"
  );
  assert.throws(
    () => service.parseResponse({
      Status: 0,
      Question: [{ name: "example.com.", type: 1 }],
      Answer: [{ name: "example.com.", type: 1, TTL: 1, data: "x".repeat(2049) }]
    }, "A", "example.com"),
    error => error.message === "DNS_RECORD_DATA_INVALID"
  );

  let calls = [];
  const successful = await service.lookup("https://example.com/path?secret=do-not-send", {
    types: ["A", "MX"],
    fetchImpl: async (url, options) => {
      calls.push({ url: new URL(url), options });
      const type = calls.at(-1).url.searchParams.get("type");
      return response({
        Status: 0,
        Question: [{ name: "example.com.", type: type === "A" ? 1 : 15 }],
        AD: true,
        Answer: type === "A"
          ? [{ name: "example.com.", type: 1, TTL: 60, data: "192.0.2.10" }]
          : [{ name: "example.com.", type: 15, TTL: 120, data: "10 mail.example.com." }]
      });
    }
  });

  assert.equal(successful.hostname, "example.com");
  assert.equal(successful.provider, "Google Public DNS");
  assert.equal(successful.complete, true);
  assert.equal(successful.records.length, 2);
  assert.equal(calls.length, 2);

  for (const call of calls) {
    assert.equal(call.url.hostname, "dns.google");
    assert.equal(call.url.searchParams.get("name"), "example.com");
    assert.equal(call.options.credentials, "omit");
    assert.equal(call.options.referrerPolicy, "no-referrer");
    assert.equal(call.options.headers.Accept, "application/x-javascript, application/json");
    assert.equal(call.url.searchParams.get("ct"), "application/x-javascript");
    assert.equal(call.url.searchParams.get("do"), "false");
    assert.equal(call.url.searchParams.get("edns_client_subnet"), "0.0.0.0/0");
    assert.equal(call.options.mode, "cors");
    assert.equal(call.options.method, "GET");
  }

  const report = service.format(successful);
  assert.match(report, /DNS Intelligence — Google Public DNS/);
  assert.match(report, /192\.0\.2\.10/);
  assert.match(report, /AD is a resolver-provided flag/);

  const xJavascriptContentType = await service.lookup("example.com", {
    types: ["A"],
    fetchImpl: async () => response({
      Status: 0,
      Question: [{ name: "example.com.", type: 1 }],
      Answer: [{ name: "example.com.", type: 1, TTL: 30, data: "192.0.2.20" }]
    }, { contentType: "application/x-javascript; charset=UTF-8" })
  });
  assert.equal(
    xJavascriptContentType.complete,
    true,
    "The documented Google JSON response media type must be accepted."
  );

  const nxdomain = await service.lookup("example.com", {
    types: ["A"],
    fetchImpl: async () => response({
      Status: 3,
      Question: [{ name: "example.com.", type: 1 }]
    })
  });
  assert.equal(nxdomain.results[0].statusName, "NXDOMAIN");
  assert.equal(nxdomain.records.length, 0);
  assert.equal(nxdomain.complete, true);

  const badContentType = await service.lookup("example.com", {
    types: ["A"],
    fetchImpl: async () => response({
      Status: 0,
      Question: [{ name: "example.com.", type: 1 }]
    }, {
      contentType: "text/html"
    })
  });
  assert.equal(badContentType.complete, false);
  assert.equal(badContentType.failures[0].error, "DNS_CONTENT_TYPE_INVALID");

  const httpFailure = await service.lookup("example.com", {
    types: ["A"],
    fetchImpl: async () => response({
      Status: 0,
      Question: [{ name: "example.com.", type: 1 }]
    }, { ok: false })
  });
  assert.equal(httpFailure.failures[0].error, "DNS_HTTP_ERROR");

  const tooLarge = await service.lookup("example.com", {
    types: ["A"],
    fetchImpl: async () => response({
      Status: 0,
      Question: [{ name: "example.com.", type: 1 }]
    }, {
      contentLength: "300000"
    })
  });
  assert.equal(tooLarge.failures[0].error, "DNS_RESPONSE_TOO_LARGE");

  await assert.rejects(
    service.lookup("example.com", { types: ["ANY"], fetchImpl: async () => response({
      Status: 0,
      Question: [{ name: "example.com.", type: 1 }]
    }) }),
    error => error.message === "DNS_RECORD_TYPE_UNSUPPORTED"
  );
  await assert.rejects(
    service.lookup("example.com", { types: ["A", "A"], fetchImpl: async () => response({ Status: 0 }) }),
    error => error.message === "DNS_RECORD_TYPE_UNSUPPORTED"
  );
  await assert.rejects(
    service.lookup("example.com", { types: [], fetchImpl: async () => response({ Status: 0 }) }),
    error => error.message === "DNS_RECORD_TYPES_INVALID"
  );
  await assert.rejects(
    service.lookup("example.com", {
      types: ["A"],
      timeoutMs: 200,
      fetchImpl: async () => response({
        Status: 0,
        Question: [{ name: "example.com.", type: 1 }]
      })
    }),
    error => error.message === "DNS_TIMEOUT_INVALID"
  );

  const alreadyAborted = new AbortController();
  alreadyAborted.abort();
  await assert.rejects(
    service.lookup("example.com", {
      types: ["A"],
      signal: alreadyAborted.signal,
      fetchImpl: async () => response({ Status: 0 })
    }),
    error => error.message === "DNS_LOOKUP_CANCELLED"
  );

  const timeoutResult = await service.lookup("example.com", {
    types: ["A"],
    timeoutMs: 500,
    fetchImpl: async (url, options) => new Promise((resolve, reject) => {
      options.signal.addEventListener("abort", () => {
        const error = new Error("aborted");
        error.name = "AbortError";
        reject(error);
      }, { once: true });
    })
  });
  assert.equal(timeoutResult.failures[0].error, "DNS_TIMEOUT");

  console.log("DNS Intelligence regression test: PASS");
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
