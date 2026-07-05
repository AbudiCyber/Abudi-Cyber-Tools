// Abudi Cyber Tools - IP Analyzer Pro v1.8
(function () {
  const ipInput = document.getElementById("ipInput");
  const analyzeIpBtn = document.getElementById("analyzeIpBtn");
  const ipAnalyzerResult = document.getElementById("ipAnalyzerResult");
  const copyIpAnalysisBtn = document.getElementById("copyIpAnalysisBtn");
  const clearIpAnalysisBtn = document.getElementById("clearIpAnalysisBtn");

  if (!ipInput || !analyzeIpBtn || !ipAnalyzerResult || !copyIpAnalysisBtn || !clearIpAnalysisBtn) return;

  let lastIpAnalysisResult = "";

  function sanitize(input) {
    return String(input).replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function copyTextWithFallback(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    ta.style.top = "-9999px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch {
      copied = false;
    }
    ta.remove();
    return copied;
  }

  async function copyLogicalValue(value, resultBox, successMessage) {
    if (!value) {
      resultBox.innerHTML += "<br><br>⚠ Nothing to copy.";
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      resultBox.innerHTML += `<br><br>✅ ${successMessage}`;
    } catch {
      if (copyTextWithFallback(value)) {
        resultBox.innerHTML += `<br><br>✅ ${successMessage}`;
      } else {
        resultBox.innerHTML += "<br><br>❌ Copy failed.";
      }
    }
  }

  function isValidIPv4(ip) {
    const parts = ip.split(".");
    if (parts.length !== 4) return false;
    return parts.every(part => {
      if (!/^\d+$/.test(part)) return false;
      if (part.length > 1 && part.startsWith("0")) return false;
      const value = Number(part);
      return value >= 0 && value <= 255;
    });
  }

  function isValidIPv6(ip) {
    if (!ip || ip.includes(":::")) return false;
    const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(([0-9a-fA-F]{1,4}:){1,7}:)|(([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4})|(([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2})|(([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3})|(([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4})|(([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5})|([0-9a-fA-F]{1,4}:)((:[0-9a-fA-F]{1,4}){1,6})|:(:[0-9a-fA-F]{1,4}){1,7}|::)$/;
    return ipv6Regex.test(ip);
  }

  function classifyIPv4(ip) {
    const parts = ip.split(".").map(Number);
    const [a, b, c] = parts;

    if (a === 10) return { scope: "Private", routable: "No", icon: "✅", note: "Used inside local networks." };
    if (a === 172 && b >= 16 && b <= 31) return { scope: "Private", routable: "No", icon: "✅", note: "Used inside local networks." };
    if (a === 192 && b === 168) return { scope: "Private", routable: "No", icon: "✅", note: "Common home/router network range." };
    if (a === 127) return { scope: "Loopback", routable: "No", icon: "⚠", note: "Points back to the same device." };
    if (a === 169 && b === 254) return { scope: "Link-local", routable: "No", icon: "⚠", note: "Automatic local address when DHCP fails." };
    if (a === 0) return { scope: "Reserved", routable: "No", icon: "⚠", note: "Reserved special-use IPv4 range." };
    if (a >= 224 && a <= 239) return { scope: "Multicast", routable: "Special", icon: "⚠", note: "Used for multicast traffic." };
    if (a >= 240) return { scope: "Reserved", routable: "No", icon: "⚠", note: "Reserved for future/special use." };
    if (a === 100 && b >= 64 && b <= 127) return { scope: "Carrier-grade NAT", routable: "Limited", icon: "⚠", note: "Often used by ISPs for CGNAT." };
    if (a === 192 && b === 0 && c === 2) return { scope: "Documentation", routable: "No", icon: "⚠", note: "Reserved for examples and documentation." };
    if (a === 198 && (b === 18 || b === 19)) return { scope: "Benchmarking", routable: "No", icon: "⚠", note: "Reserved for network benchmark tests." };
    if (a === 198 && b === 51 && c === 100) return { scope: "Documentation", routable: "No", icon: "⚠", note: "Reserved for examples and documentation." };
    if (a === 203 && b === 0 && c === 113) return { scope: "Documentation", routable: "No", icon: "⚠", note: "Reserved for examples and documentation." };

    return { scope: "Public", routable: "Yes", icon: "✅", note: "Public IP. Location lookup/maps can be added later in v2." };
  }

  function classifyIPv6(ip) {
    const lower = ip.toLowerCase();

    if (lower === "::1") return { scope: "Loopback", routable: "No", icon: "⚠", note: "Points back to the same device." };
    if (lower === "::") return { scope: "Unspecified", routable: "No", icon: "⚠", note: "Represents no specific address." };
    if (lower.startsWith("fe80:")) return { scope: "Link-local", routable: "No", icon: "⚠", note: "Used on the local network segment." };
    if (/^f[cd][0-9a-f]{2}:/i.test(lower)) return { scope: "Unique local", routable: "No", icon: "✅", note: "Private-style IPv6 address for local networks." };
    if (lower.startsWith("ff")) return { scope: "Multicast", routable: "Special", icon: "⚠", note: "Used for multicast traffic." };
    if (lower.startsWith("2001:db8:")) return { scope: "Documentation", routable: "No", icon: "⚠", note: "Reserved for examples and documentation." };

    return { scope: "Global/Public", routable: "Yes", icon: "✅", note: "Global IPv6 address. GeoIP/maps can be added later in v2." };
  }

  function analyzeIp() {
    const ip = ipInput.value.trim();

    if (!ip) {
      ipAnalyzerResult.innerHTML = "⚠ Enter an IPv4 or IPv6 address.";
      lastIpAnalysisResult = "";
      return;
    }

    const isIPv4 = isValidIPv4(ip);
    const isIPv6 = isValidIPv6(ip);

    if (!isIPv4 && !isIPv6) {
      ipAnalyzerResult.innerHTML = "❌ Invalid IP address.";
      lastIpAnalysisResult = "";
      return;
    }

    const version = isIPv4 ? "IPv4" : "IPv6";
    const classification = isIPv4 ? classifyIPv4(ip) : classifyIPv6(ip);
    const mapReady = classification.routable === "Yes" ? "Future v2 candidate" : "No";

    lastIpAnalysisResult =
`IP Analysis
Input: ${ip}
Version: ${version}
Scope: ${classification.scope}
Internet Routable: ${classification.routable}
Map Support: ${mapReady}
Note: ${classification.note}`;

    ipAnalyzerResult.innerHTML = `
      🌐 IP Analysis
      <br><br>
      <b>Input:</b> ${sanitize(ip)}
      <br>
      <b>Version:</b> ${version}
      <br>
      <b>Scope:</b> ${classification.icon} ${sanitize(classification.scope)}
      <br>
      <b>Internet Routable:</b> ${sanitize(classification.routable)}
      <br>
      <b>Map Support:</b> ${sanitize(mapReady)}
      <br><br>
      <b>Checks:</b>
      <br>
      ✅ Valid ${version}
      <br>
      ${classification.routable === "Yes" ? "✅" : "⚠"} Public internet routing
      <br>
      ${classification.scope === "Private" || classification.scope === "Unique local" ? "✅" : "⚠"} Local/private detection
      <br><br>
      <b>Advice:</b> ${sanitize(classification.note)}
      <br><br>
      <small>🗺️ GeoIP maps are planned for a future version and should be treated as approximate.</small>
    `;
  }

  async function copyIpAnalysisResult() {
    await copyLogicalValue(lastIpAnalysisResult, ipAnalyzerResult, "IP analysis copied.");
  }

  function clearIpAnalysisResult() {
    ipInput.value = "";
    ipAnalyzerResult.innerHTML = "Waiting for IP analysis...";
    lastIpAnalysisResult = "";
  }

  analyzeIpBtn.addEventListener("click", analyzeIp);
  copyIpAnalysisBtn.addEventListener("click", copyIpAnalysisResult);
  clearIpAnalysisBtn.addEventListener("click", clearIpAnalysisResult);
})();
