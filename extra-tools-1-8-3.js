// Abudi Cyber Tools — URL Codec, IP Analyzer, and tool navigation
(function () {
  const urlCodecInput = document.getElementById("urlCodecInput");
  const urlEncodeBtn = document.getElementById("urlEncodeBtn");
  const urlDecodeBtn = document.getElementById("urlDecodeBtn");
  const urlCodecResult = document.getElementById("urlCodecResult");
  const copyUrlCodecBtn = document.getElementById("copyUrlCodecBtn");
  const clearUrlCodecBtn = document.getElementById("clearUrlCodecBtn");
  if (!urlCodecInput || !urlEncodeBtn || !urlDecodeBtn || !urlCodecResult || !copyUrlCodecBtn || !clearUrlCodecBtn) return;

  let lastUrlCodecResult = "";
  const sanitizeUrlCodec = value => String(value).replace(/</g, "&lt;").replace(/>/g, "&gt;");

  function copyUrlCodecFallback(text) {
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
    try { copied = document.execCommand("copy"); } catch { copied = false; }
    ta.remove();
    return copied;
  }

  async function copyUrlCodecValue() {
    if (!lastUrlCodecResult) {
      urlCodecResult.textContent = "⚠️ Generate a result before copying.";
      return;
    }
    try {
      await navigator.clipboard.writeText(lastUrlCodecResult);
      urlCodecResult.innerHTML += "<br><br>✅ URL result copied.";
    } catch {
      if (copyUrlCodecFallback(lastUrlCodecResult)) {
        urlCodecResult.innerHTML += "<br><br>✅ URL result copied.";
      } else {
        urlCodecResult.innerHTML += "<br><br>❌ Copy failed.";
      }
    }
  }

  function showUrlCodecResult(mode, input, output) {
    lastUrlCodecResult = output;
    urlCodecResult.innerHTML = `
      🧩 URL ${mode}
      <br><br>
      <b>Input:</b>
      <br>
      <code>${sanitizeUrlCodec(input)}</code>
      <br><br>
      <b>Result:</b>
      <br>
      <code>${sanitizeUrlCodec(output)}</code>
    `;
  }

  function encodeUrlValue() {
    const input = urlCodecInput.value.trim();
    if (!input) {
      urlCodecResult.textContent = "⚠️ Please enter URL text to encode first.";
      lastUrlCodecResult = "";
      return;
    }
    try {
      showUrlCodecResult("Encoded", input, encodeURIComponent(input));
    } catch {
      urlCodecResult.textContent = "❌ Could not encode this value.";
      lastUrlCodecResult = "";
    }
  }

  function decodeUrlValue() {
    const input = urlCodecInput.value.trim();
    if (!input) {
      urlCodecResult.textContent = "⚠️ Please enter encoded URL text to decode first.";
      lastUrlCodecResult = "";
      return;
    }
    try {
      showUrlCodecResult("Decoded", input, decodeURIComponent(input));
    } catch {
      urlCodecResult.textContent = "❌ Invalid encoded URL text.";
      lastUrlCodecResult = "";
    }
  }

  function clearUrlCodecResult() {
    urlCodecInput.value = "";
    urlCodecResult.textContent = "Waiting for URL encode/decode input...";
    lastUrlCodecResult = "";
  }

  urlEncodeBtn.addEventListener("click", encodeUrlValue);
  urlDecodeBtn.addEventListener("click", decodeUrlValue);
  copyUrlCodecBtn.addEventListener("click", copyUrlCodecValue);
  clearUrlCodecBtn.addEventListener("click", clearUrlCodecResult);
})();

(function () {
  const ipInput = document.getElementById("ipInput");
  const analyzeIpBtn = document.getElementById("analyzeIpBtn");
  const ipAnalyzerResult = document.getElementById("ipAnalyzerResult");
  const copyIpAnalysisBtn = document.getElementById("copyIpAnalysisBtn");
  const clearIpAnalysisBtn = document.getElementById("clearIpAnalysisBtn");
  if (!ipInput || !analyzeIpBtn || !ipAnalyzerResult || !copyIpAnalysisBtn || !clearIpAnalysisBtn) return;

  let lastIpAnalysisResult = "";
  const sanitizeIp = value => String(value).replace(/</g, "&lt;").replace(/>/g, "&gt;");

  function copyIpFallback(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    let copied = false;
    try { copied = document.execCommand("copy"); } catch { copied = false; }
    ta.remove();
    return copied;
  }

  async function copyIpValue() {
    if (!lastIpAnalysisResult) {
      ipAnalyzerResult.textContent = "⚠️ Generate a result before copying.";
      return;
    }
    try {
      await navigator.clipboard.writeText(lastIpAnalysisResult);
      ipAnalyzerResult.innerHTML += "<br><br>✅ IP analysis copied.";
    } catch {
      if (copyIpFallback(lastIpAnalysisResult)) {
        ipAnalyzerResult.innerHTML += "<br><br>✅ IP analysis copied.";
      } else {
        ipAnalyzerResult.innerHTML += "<br><br>❌ Copy failed.";
      }
    }
  }

  function isValidIPv4(ip) {
    const parts = ip.split(".");
    return parts.length === 4 && parts.every(part => /^\d+$/.test(part) && !(part.length > 1 && part.startsWith("0")) && Number(part) >= 0 && Number(part) <= 255);
  }

  function isValidIPv6(ip) {
    if (!ip || ip.includes(":::")) return false;
    return /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(([0-9a-fA-F]{1,4}:){1,7}:)|(([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4})|(([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2})|(([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3})|(([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4})|(([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5})|([0-9a-fA-F]{1,4}:)((:[0-9a-fA-F]{1,4}){1,6})|:(:[0-9a-fA-F]{1,4}){1,7}|::)$/.test(ip);
  }

  function classifyIPv4(ip) {
    const [a, b, c] = ip.split(".").map(Number);
    if (a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168)) return { scope: "Private", routable: "No", icon: "✅", note: "Used inside local networks." };
    if (a === 127) return { scope: "Loopback", routable: "No", icon: "⚠", note: "Points back to the same device." };
    if (a === 169 && b === 254) return { scope: "Link-local", routable: "No", icon: "⚠", note: "Automatic local address when DHCP fails." };
    if (a >= 224 && a <= 239) return { scope: "Multicast", routable: "Special", icon: "⚠", note: "Used for multicast traffic." };
    if (a === 100 && b >= 64 && b <= 127) return { scope: "Carrier-grade NAT", routable: "Limited", icon: "⚠", note: "Often used by ISPs for CGNAT." };
    if (a === 192 && b === 0 && c === 2) return { scope: "Documentation", routable: "No", icon: "⚠", note: "Reserved for examples and documentation." };
    if (a === 198 && b === 51 && c === 100) return { scope: "Documentation", routable: "No", icon: "⚠", note: "Reserved for examples and documentation." };
    if (a === 203 && b === 0 && c === 113) return { scope: "Documentation", routable: "No", icon: "⚠", note: "Reserved for examples and documentation." };
    if (a >= 240 || a === 0) return { scope: "Reserved", routable: "No", icon: "⚠", note: "Reserved special-use IPv4 range." };
    return { scope: "Public", routable: "Yes", icon: "✅", note: "Public IP. GeoIP maps can be added later in v2." };
  }

  function classifyIPv6(ip) {
    const value = ip.toLowerCase();
    if (value === "::1") return { scope: "Loopback", routable: "No", icon: "⚠", note: "Points back to the same device." };
    if (value === "::") return { scope: "Unspecified", routable: "No", icon: "⚠", note: "Represents no specific address." };
    if (value.startsWith("fe80:")) return { scope: "Link-local", routable: "No", icon: "⚠", note: "Used on the local network segment." };
    if (/^f[cd][0-9a-f]{2}:/i.test(value)) return { scope: "Unique local", routable: "No", icon: "✅", note: "Private-style IPv6 address for local networks." };
    if (value.startsWith("ff")) return { scope: "Multicast", routable: "Special", icon: "⚠", note: "Used for multicast traffic." };
    if (value.startsWith("2001:db8:")) return { scope: "Documentation", routable: "No", icon: "⚠", note: "Reserved for examples and documentation." };
    return { scope: "Global/Public", routable: "Yes", icon: "✅", note: "Global IPv6 address. GeoIP maps can be added later in v2." };
  }

  function analyzeIp() {
    const ip = ipInput.value.trim();
    if (!ip) {
      ipAnalyzerResult.textContent = "⚠️ Please enter an IPv4 or IPv6 address first.";
      lastIpAnalysisResult = "";
      return;
    }

    const isIPv4 = isValidIPv4(ip);
    const isIPv6 = isValidIPv6(ip);
    if (!isIPv4 && !isIPv6) {
      ipAnalyzerResult.textContent = "❌ Invalid IP address.";
      lastIpAnalysisResult = "";
      return;
    }

    const version = isIPv4 ? "IPv4" : "IPv6";
    const info = isIPv4 ? classifyIPv4(ip) : classifyIPv6(ip);
    const mapReady = info.routable === "Yes" ? "Future v2 candidate" : "No";
    lastIpAnalysisResult = `IP Analysis\nInput: ${ip}\nVersion: ${version}\nScope: ${info.scope}\nInternet Routable: ${info.routable}\nMap Support: ${mapReady}\nNote: ${info.note}`;

    ipAnalyzerResult.innerHTML = `
      🌐 IP Analysis
      <br><br>
      <b>Input:</b> ${sanitizeIp(ip)}
      <br>
      <b>Version:</b> ${version}
      <br>
      <b>Scope:</b> ${info.icon} ${sanitizeIp(info.scope)}
      <br>
      <b>Internet Routable:</b> ${sanitizeIp(info.routable)}
      <br>
      <b>Map Support:</b> ${sanitizeIp(mapReady)}
      <br><br>
      <b>Checks:</b>
      <br>
      ✅ Valid ${version}
      <br>
      ${info.routable === "Yes" ? "✅" : "⚠"} Public internet routing
      <br>
      ${info.scope === "Private" || info.scope === "Unique local" ? "✅" : "⚠"} Local/private detection
      <br><br>
      <b>Advice:</b> ${sanitizeIp(info.note)}
      <br><br>
      <small>🗺️ GeoIP maps are planned for a future version and should be approximate only.</small>
    `;
  }

  function clearIpAnalysisResult() {
    ipInput.value = "";
    ipAnalyzerResult.textContent = "Waiting for IP input...";
    lastIpAnalysisResult = "";
  }

  analyzeIpBtn.addEventListener("click", analyzeIp);
  copyIpAnalysisBtn.addEventListener("click", copyIpValue);
  clearIpAnalysisBtn.addEventListener("click", clearIpAnalysisResult);
})();

(function () {
  const searchInput = document.getElementById("toolSearch");
  const clearSearchBtn = document.getElementById("clearToolSearch");
  const noToolsFound = document.getElementById("noToolsFound");
  const cards = Array.from(document.querySelectorAll(".tool-card"));
  const categoryTitles = Array.from(document.querySelectorAll(".category-title"));
  const pills = Array.from(document.querySelectorAll(".category-pill"));
  const status = document.getElementById("toolSearchStatus");
  if (!searchInput || !clearSearchBtn || !noToolsFound || !status) return;

  let activeCategory = "all";
  const normalize = value => String(value || "").toLowerCase().trim();

  function setActiveCategory(category) {
    activeCategory = category;
    pills.forEach(item => item.classList.toggle("active", item.dataset.filter === category));
  }

  function updateVisibleTools() {
    const query = normalize(searchInput.value);
    let visibleCount = 0;

    cards.forEach(card => {
      const category = card.dataset.category || "";
      const keywords = normalize(card.dataset.tool + " " + card.innerText);
      const matchesCategory = activeCategory === "all" || category === activeCategory;
      const matchesSearch = !query || keywords.includes(query);
      const shouldShow = matchesCategory && matchesSearch;
      card.classList.toggle("tool-hidden", !shouldShow);
      if (shouldShow) visibleCount++;
    });

    categoryTitles.forEach(title => {
      const category = title.dataset.categoryTitle;
      const hasVisibleCard = cards.some(card => card.dataset.category === category && !card.classList.contains("tool-hidden"));
      title.classList.toggle("tool-hidden", !hasVisibleCard);
    });

    clearSearchBtn.hidden = !query && activeCategory === "all";
    noToolsFound.classList.toggle("tool-hidden", visibleCount !== 0);

    if (visibleCount === cards.length && activeCategory === "all" && !query) {
      status.textContent = "Showing all tools.";
    } else if (visibleCount === 0) {
      status.textContent = "No matching tools.";
    } else {
      status.textContent = `Showing ${visibleCount} of ${cards.length} tools.`;
    }
  }

  searchInput.addEventListener("input", updateVisibleTools);
  clearSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    setActiveCategory("all");
    updateVisibleTools();
    searchInput.focus();
  });
  pills.forEach(pill => pill.addEventListener("click", () => {
    setActiveCategory(pill.dataset.filter);
    updateVisibleTools();
  }));
  updateVisibleTools();
})();
