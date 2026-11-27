const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const script = fs.readFileSync(path.join(root, "script.js"), "utf8");
const dom = new JSDOM(html, { runScripts: "outside-only", url: "https://example.test/" });

try {
  const { window } = dom;
  window.eval(script);

  const validIPv4 = [
    "0.0.0.0",
    "8.8.8.8",
    "10.0.0.1",
    "172.31.255.255",
    "192.168.1.1",
    "255.255.255.255"
  ];
  const invalidIPv4 = [
    "",
    "256.1.1.1",
    "1.2.3",
    "1.2.3.4.5",
    "01.2.3.4",
    "1.2.3.-1",
    "1.2.3.4 ",
    "1.2.3.4/24"
  ];

  for (const ip of validIPv4) {
    assert.equal(window.isValidIPv4(ip), true, "Expected valid IPv4: " + ip);
  }
  for (const ip of invalidIPv4) {
    assert.equal(window.isValidIPv4(ip), false, "Expected invalid IPv4: " + ip);
  }

  const ipv4Scopes = [
    ["10.0.0.1", "Private"],
    ["172.31.255.255", "Private"],
    ["192.168.1.1", "Private"],
    ["127.0.0.1", "Loopback"],
    ["169.254.1.1", "Link-local"],
    ["100.64.0.1", "Carrier-grade NAT"],
    ["192.0.2.1", "Documentation"],
    ["198.51.100.1", "Documentation"],
    ["203.0.113.1", "Documentation"],
    ["198.18.0.1", "Benchmarking"],
    ["192.0.0.0", "IPv4 service continuity"],
    ["192.0.0.8", "Dummy address"],
    ["192.0.0.9", "PCP anycast"],
    ["192.0.0.10", "TURN anycast"],
    ["192.0.0.11", "Unassigned protocol block"],
    ["192.0.0.170", "NAT64/DNS64 discovery"],
    ["192.0.0.171", "NAT64/DNS64 discovery"],
    ["192.88.99.1", "Deprecated 6to4 relay"],
    ["192.88.99.2", "6a44 relay anycast"],
    ["224.0.0.1", "Multicast"],
    ["0.1.2.3", "Reserved"],
    ["240.0.0.1", "Reserved"],
    ["255.255.255.255", "Limited broadcast"],
    ["8.8.8.8", "Public"]
  ];

  for (const [ip, expectedScope] of ipv4Scopes) {
    assert.equal(window.classifyIPv4(ip).scope, expectedScope, "Incorrect IPv4 scope: " + ip);
  }

  const validIPv6 = [
    "::",
    "::1",
    "2001:db8::1",
    "2001:4860:4860::8888",
    "fe80::1",
    "fe90::1",
    "fea0::1",
    "febf::1",
    "fc00::1",
    "fd12:3456:789a::1",
    "1:2:3:4:5:6:7:8",
    "::ffff:192.0.2.1",
    "2001:db8:0:0:0:0:192.0.2.1"
  ];
  const invalidIPv6 = [
    "",
    ":::1",
    "1::2::3",
    "1:2:3:4:5:6:7",
    "1:2:3:4:5:6:7:8:9",
    "gggg::1",
    ":1",
    "1:",
    "::ffff:999.0.2.1",
    "fe80::1%eth0"
  ];

  for (const ip of validIPv6) {
    assert.equal(window.isValidIPv6(ip), true, "Expected valid IPv6: " + ip);
  }
  for (const ip of invalidIPv6) {
    assert.equal(window.isValidIPv6(ip), false, "Expected invalid IPv6: " + ip);
  }

  const ipv6Scopes = [
    ["::", "Unspecified"],
    ["::1", "Loopback"],
    ["::ffff:192.0.2.1", "IPv4-mapped"],
    ["64:ff9b::192.0.2.1", "IPv4-translatable"],
    ["64:ff9b:1::192.0.2.1", "IPv4-translatable"],
    ["100::1", "Discard-only"],
    ["100:0:0:1::1", "Dummy prefix"],
    ["fe80::1", "Link-local"],
    ["fe90::1", "Link-local"],
    ["fea0::1", "Link-local"],
    ["febf::1", "Link-local"],
    ["fc00::1", "Unique local"],
    ["fd12:3456:789a::1", "Unique local"],
    ["ff02::1", "Multicast"],
    ["2001::1", "Teredo"],
    ["2001:1::1", "IETF anycast"],
    ["2001:1::2", "IETF anycast"],
    ["2001:1::3", "IETF anycast"],
    ["2001:2::1", "Benchmarking"],
    ["2001:3::1", "AMT"],
    ["2001:4:112::1", "AS112 service"],
    ["2001:10::1", "Deprecated ORCHID"],
    ["2001:20::1", "ORCHIDv2"],
    ["2001:30::1", "Drone Remote ID"],
    ["3fff::1", "Documentation"],
    ["2620:4f:8000::1", "Global/Public"],
    ["5f00::1", "Segment-routing SID"],
    ["2001:db8::1", "Documentation"],
    ["2001:0db8:0:0:0:0:0:1", "Documentation"],
    ["2001:4860:4860::8888", "Global/Public"],
    ["4000::1", "Reserved / Special"]
  ];

  for (const [ip, expectedScope] of ipv6Scopes) {
    assert.equal(window.classifyIPv6(ip).scope, expectedScope, "Incorrect IPv6 scope: " + ip);
  }

  const ipInput = window.document.getElementById("ipInput");
  const analyzeButton = window.document.getElementById("analyzeIpBtn");
  const result = window.document.getElementById("ipAnalyzerResult");

  ipInput.value = "fe90::1";
  analyzeButton.click();
  assert.match(result.textContent, /Link-local/);

  ipInput.value = "2001:db8::1";
  analyzeButton.click();
  assert.match(result.textContent, /Documentation/);

  ipInput.value = "not-an-ip";
  analyzeButton.click();
  assert.match(result.textContent, /Invalid IP address/);

  // Regression guard: Teredo is the full 2001::/32 prefix, not only 2001::/128.
  console.log("IP analyzer regression test: PASS");
} finally {
  dom.window.close();
}
