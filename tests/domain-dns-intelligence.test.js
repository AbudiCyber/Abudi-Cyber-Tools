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
    RegExp,
    Uint8Array,
    TextDecoder
  }, { filename: "domain-dns-intelligence-v1-9.js" });

  return window.AbudiDNSIntelligence;
}

function streamBody(chunks, options = {}) {
  let index = 0;

  return {
    getReader() {
      return {
        async read() {
          if (index >= chunks.length) return { done: true };
          return { done: false, value: chunks[index++] };
        },
        async cancel() {
          if (options.cancelError) throw new Error("STREAM_CANCEL_FAILED");
          if (options.cancelNeverResolves) return new Promise(() => {});
        },
        releaseLock() {}
      };
    }
  };
}

function responseFromChunks(chunks, options = {}) {
  return {
    ok: options.ok !== false,
    headers: {
      get(name) {
        if (name.toLowerCase() === "content-type") {
          return options.contentType || "application/dns-json; charset=UTF-8";
        }
        if (name.toLowerCase() === "content-length") {
          if (Object.prototype.hasOwnProperty.call(options, "contentLength")) {
            return options.contentLength;
          }
          return String(chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0));
        }
        return null;
      }
    },
    body: streamBody(chunks, options)
  };
}

function response(payload, options = {}) {
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  return responseFromChunks([bytes], options);
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

  const dnssecResponse = service.parseResponse({
    Status: 0,
    Question: [{ name: "example.com.", type: 1 }],
    Answer: [
      { name: "example.com.", type: 46, TTL: 300, data: "A 8 2 300 20300101000000 20260101000000 12345 example.com. signature" },
      { name: "example.com.", type: 48, TTL: 300, data: "257 3 8 AwEAAQ==" }
    ]
  }, "A", "example.com");
  assert.deepEqual(
    dnssecResponse.records.map(record => record.type),
    ["RRSIG", "DNSKEY"],
    "DNSSEC records returned by the resolver must not invalidate an otherwise valid JSON response."
  );

  assert.throws(
    () => service.parseResponse({ Status: 65535, Question: [{ name: "example.com.", type: 1 }] }, "A", "example.com"),
    error => error.message === "DNS_RESPONSE_STATUS_INVALID"
  );
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
  const privateUseRcode = service.parseResponse({
    Status: 4095,
    Question: [{ name: "example.com.", type: 1 }],
    Answer: []
  }, "A", "example.com");
  assert.equal(privateUseRcode.statusName, "RCODE_4095");
  const unassignedExtendedRcode = service.parseResponse({
    Status: 4096,
    Question: [{ name: "example.com.", type: 1 }],
    Answer: []
  }, "A", "example.com");
  assert.equal(unassignedExtendedRcode.statusName, "RCODE_4096");
  const highestAssignableRcode = service.parseResponse({
    Status: 65534,
    Question: [{ name: "example.com.", type: 1 }],
    Answer: []
  }, "A", "example.com");
  assert.equal(highestAssignableRcode.statusName, "RCODE_65534");
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
  const unknownRecordType = service.parseResponse({
    Status: 0,
    Question: [{ name: "example.com.", type: 1 }],
    Answer: [{ name: "example.com.", type: 65000, TTL: 10, data: "opaque" }]
  }, "A", "example.com");
  assert.equal(unknownRecordType.records[0].type, "TYPE65000");
  assert.equal(unknownRecordType.records[0].data, "opaque");
  assert.throws(
    () => service.parseResponse({
      Status: 0,
      Question: [{ name: "example.com.", type: 1 }],
      Answer: [{ name: "example.com.", type: 65536, TTL: 10, data: "invalid" }]
    }, "A", "example.com"),
    error => error.message === "DNS_RECORD_INVALID"
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

  for (const invalidTTL of [1.5, -1, 2147483648, 4294967296, NaN, Infinity]) {
    assert.throws(
      () => service.parseResponse({
        Status: 0,
        Question: [{ name: "example.com.", type: 1 }],
        Answer: [{ name: "example.com.", type: 1, TTL: invalidTTL, data: "192.0.2.1" }]
      }, "A", "example.com"),
      error => error.message === "DNS_RECORD_INVALID"
    );
  }
  const maximumTTL = service.parseResponse({
    Status: 0,
    Question: [{ name: "example.com.", type: 1 }],
    Answer: [{ name: "example.com.", type: 1, TTL: 2147483647, data: "192.0.2.1" }]
  }, "A", "example.com");
  assert.equal(maximumTTL.records[0].ttl, 2147483647);
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
  const oversizedStream = await service.lookup("example.com", {
    types: ["A"],
    fetchImpl: async () => responseFromChunks(
      [new Uint8Array(262145)],
      { contentLength: null, cancelError: true }
    )
  });
  assert.equal(
    oversizedStream.failures[0].error,
    "DNS_RESPONSE_TOO_LARGE",
    "An oversized streamed body must remain classified as oversized even if stream cancellation fails."
  );
  const oversizedCancellationOutcome = await Promise.race([
    service.lookup("example.com", {
      types: ["A"],
      timeoutMs: 500,
      fetchImpl: async () => responseFromChunks(
        [new Uint8Array(262145)],
        { contentLength: null, cancelNeverResolves: true }
      )
    }).then(
      result => result.failures[0]?.error || "UNEXPECTED_SUCCESS",
      error => error.message
    ),
    new Promise(resolve => setTimeout(() => resolve("CLEANUP_BLOCKED_RESULT"), 150))
  ]);
  assert.equal(
    oversizedCancellationOutcome,
    "DNS_RESPONSE_TOO_LARGE",
    "The primary oversized-response error must not wait indefinitely for stream cancellation."
  );


  let unboundedJSONFallbackCalled = false;
  const missingStream = await service.lookup("example.com", {
    types: ["A"],
    fetchImpl: async () => ({
      ok: true,
      headers: {
        get(name) {
          if (name.toLowerCase() === "content-type") return "application/dns-json";
          return null;
        }
      },
      json: async () => {
        unboundedJSONFallbackCalled = true;
        return {
          Status: 0,
          Question: [{ name: "example.com.", type: 1 }],
          Answer: []
        };
      }
    })
  });
  assert.equal(missingStream.complete, false);
  assert.equal(missingStream.failures[0].error, "DNS_RESPONSE_STREAM_UNAVAILABLE");
  assert.equal(
    unboundedJSONFallbackCalled,
    false,
    "The JSON convenience method must not bypass streamed response size limits."
  );

  const partialResult = await service.lookup("example.com", {
    types: ["A", "MX"],
    fetchImpl: async requestUrl => {
      const requestedType = new URL(requestUrl).searchParams.get("type");
      if (requestedType === "MX") {
        return response({
          Status: 0,
          Question: [{ name: "example.com.", type: 15 }]
        }, { contentType: "text/html" });
      }
      return response({
        Status: 0,
        Question: [{ name: "example.com.", type: 1 }],
        Answer: [{ name: "example.com.", type: 1, TTL: 60, data: "192.0.2.33" }]
      });
    }
  });
  assert.equal(partialResult.complete, false);
  assert.equal(partialResult.results.length, 2);
  assert.equal(partialResult.records.length, 1);
  assert.equal(partialResult.records[0].data, "192.0.2.33");
  assert.equal(partialResult.failures.length, 1);
  assert.equal(partialResult.failures[0].requestedType, "MX");
  assert.equal(partialResult.failures[0].error, "DNS_CONTENT_TYPE_INVALID");

  let notifyBodyRead;
  const bodyReadStarted = new Promise(resolve => {
    notifyBodyRead = resolve;
  });
  const bodyAbortController = new AbortController();
  const pendingBodyLookup = service.lookup("example.com", {
    types: ["A"],
    signal: bodyAbortController.signal,
    fetchImpl: async (requestUrl, options) => ({
      ok: true,
      headers: {
        get(name) {
          if (name.toLowerCase() === "content-type") return "application/dns-json";
          if (name.toLowerCase() === "content-length") return "128";
          return null;
        }
      },
      body: {
        getReader() {
          return {
            read() {
              notifyBodyRead();
              return new Promise((resolve, reject) => {
                options.signal.addEventListener("abort", () => {
                  const error = new Error("stream read aborted");
                  error.name = "AbortError";
                  reject(error);
                }, { once: true });
              });
            },
            async cancel() {},
            releaseLock() {}
          };
        }
      }
    })
  });
  await bodyReadStarted;
  bodyAbortController.abort();
  await assert.rejects(
    pendingBodyLookup,
    error => error.message === "DNS_LOOKUP_CANCELLED",
    "Caller cancellation must remain observable while the response body is being consumed."
  );


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
