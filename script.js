// Abudi Cyber Tools v1.8.3 - Browser-only tool logic

// ===== DOM Helpers =====
const $ = id => document.getElementById(id);

const textInput = $("textInput");
const textAnalyzerResult = $("textAnalyzerResult");
const passwordInput = $("passwordInput");
const passwordCheckerResult = $("passwordCheckerResult");
const passwordLength = $("passwordLength");
const passwordGeneratorResult = $("passwordGeneratorResult");
const linkInput = $("linkInput");
const linkAnalyzerResult = $("linkAnalyzerResult");
const hashInput = $("hashInput");
const hashType = $("hashType");
const hashResult = $("hashResult");
const base64Input = $("base64Input");
const base64Result = $("base64Result");
const emailInput = $("emailInput");
const emailResult = $("emailResult");
const urlParserInput = $("urlParserInput");
const urlParserResult = $("urlParserResult");
const urlCodecInput = $("urlCodecInput");
const urlCodecResult = $("urlCodecResult");
const ipInput = $("ipInput");
const ipAnalyzerResult = $("ipAnalyzerResult");
const fileHashInput = $("fileHashInput");
const fileHashResult = $("fileHashResult");

let lastTextAnalysisResult = "";
let generatedPassword = "";
let lastPasswordCheckResult = "";
let lastLinkAnalysisResult = "";
let lastHashResult = "";
let lastBase64Result = "";
let lastEmailResult = "";
let lastUrlParserResult = "";
let lastUrlCodecResult = "";
let lastIpAnalysisResult = "";
let lastFileHash = "";
let lastFileName = "";
let lastFileReport = "";

function sanitize(input) {
  return String(input).replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function codeBlock(value) {
  return `<code>${sanitize(value)}</code>`;
}

function bindClick(id, handler) {
  const element = $(id);
  if (element) element.addEventListener("click", handler);
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleString();
}

function encodeUnicodeBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach(byte => binary += String.fromCharCode(byte));
  return btoa(binary);
}

function decodeUnicodeBase64(base64Text) {
  const binary = atob(base64Text);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
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
  try { copied = document.execCommand("copy"); } catch { copied = false; }
  ta.remove();
  return copied;
}

async function copyLogicalValue(value, resultBox, successMessage) {
  if (!resultBox) return;
  if (!value) {
    resultBox.innerHTML += "<br><br>⚠ Nothing to copy yet. Generate a result first.";
    return;
  }
  try {
    await navigator.clipboard.writeText(value);
    resultBox.innerHTML += `<br><br>✅ ${successMessage}`;
  } catch {
    if (copyTextWithFallback(value)) {
      resultBox.innerHTML += `<br><br>✅ ${successMessage}`;
    } else {
      resultBox.innerHTML += "<br><br>❌ Copy failed. Please copy manually.";
    }
  }
}

// ===== Text Analyzer Pro =====
function analyzeText() {
  const rawText = textInput.value.trim();
  if (!rawText) {
    textAnalyzerResult.innerHTML = "⚠ Please enter text first.";
    lastTextAnalysisResult = "";
    return;
  }
  if (rawText.length > 5000) {
    textAnalyzerResult.innerHTML = "⚠ Text is too long. Maximum supported length is 5000 characters.";
    lastTextAnalysisResult = "";
    return;
  }
  const characters = rawText.length;
  const words = rawText ? rawText.split(/\s+/).length : 0;
  const numbers = (rawText.match(/\d/g) || []).length;
  const symbols = (rawText.match(/[^\p{L}\p{N}\s]/gu) || []).length;
  const lines = rawText.split(/\r\n|\r|\n/).length;
  const spaces = (rawText.match(/\s/g) || []).length;
  lastTextAnalysisResult = `Text Analysis\nCharacters: ${characters}\nWords: ${words}\nNumbers: ${numbers}\nSymbols: ${symbols}\nLines: ${lines}\nSpaces: ${spaces}`;
  textAnalyzerResult.innerHTML = `📝 Text Analysis<br><br><b>Characters:</b> ${characters}<br><b>Words:</b> ${words}<br><b>Numbers:</b> ${numbers}<br><b>Symbols:</b> ${symbols}<br><b>Lines:</b> ${lines}<br><b>Spaces:</b> ${spaces}`;
}
function clearTextAnalysisResult() {
  textInput.value = "";
  textAnalyzerResult.innerHTML = "Waiting for text input...";
  lastTextAnalysisResult = "";
}

// ===== Password Checker Pro =====
function checkPassword() {
  const password = passwordInput.value;
  if (!password) {
    passwordCheckerResult.innerHTML = "⚠ Please enter a password first.";
    lastPasswordCheckResult = "";
    return;
  }
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSymbols = /[!@#$%^&*()_\-+={}\[\]|;:'",.<>/?`~]/.test(password);
  const longEnough = password.length >= 8;
  const score = [longEnough, hasLower, hasUpper, hasNumbers, hasSymbols].filter(Boolean).length;
  let status = "❌ Weak Password";
  let advice = "Use at least 8 characters with uppercase, lowercase, numbers, and symbols.";
  if (score >= 5) {
    status = "✅ Strong Password";
    advice = "Good structure. This password uses all main complexity categories.";
  } else if (score >= 3) {
    status = "⚠ Medium Password";
    advice = "Better than weak, but add more length or more character types.";
  }
  lastPasswordCheckResult = `Password Strength\nStatus: ${status}\nLength: ${password.length} characters\n8+ characters: ${longEnough ? "Yes" : "No"}\nLowercase letters: ${hasLower ? "Yes" : "No"}\nUppercase letters: ${hasUpper ? "Yes" : "No"}\nNumbers: ${hasNumbers ? "Yes" : "No"}\nSymbols: ${hasSymbols ? "Yes" : "No"}\nAdvice: ${advice}`;
  passwordCheckerResult.innerHTML = `🔐 Password Strength<br><br><b>Status:</b> ${status}<br><b>Length:</b> ${password.length} characters<br><br><b>Checks:</b><br>${longEnough ? "✅" : "❌"} 8+ characters<br>${hasLower ? "✅" : "❌"} Lowercase letters<br>${hasUpper ? "✅" : "❌"} Uppercase letters<br>${hasNumbers ? "✅" : "❌"} Numbers<br>${hasSymbols ? "✅" : "❌"} Symbols<br><br><b>Advice:</b> ${sanitize(advice)}`;
}
function clearPasswordCheckResult() {
  passwordInput.value = "";
  passwordCheckerResult.innerHTML = "Waiting for password input...";
  lastPasswordCheckResult = "";
}

// ===== Password Generator Pro =====
function generatePassword() {
  const len = parseInt(passwordLength.value, 10) || 12;
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>/?";
  const all = lower + upper + numbers + symbols;
  let pass = lower[Math.floor(Math.random() * lower.length)] + upper[Math.floor(Math.random() * upper.length)] + numbers[Math.floor(Math.random() * numbers.length)] + symbols[Math.floor(Math.random() * symbols.length)];
  for (let i = pass.length; i < len; i++) pass += all[Math.floor(Math.random() * all.length)];
  generatedPassword = pass.split("").sort(() => 0.5 - Math.random()).join("");
  passwordGeneratorResult.innerHTML = `🎲 Generated Password<br><br><b>Length:</b> ${len} characters<br><b>Contains:</b> Uppercase, lowercase, numbers, symbols<br><br><b>Password:</b><br><br>${codeBlock(generatedPassword)}`;
}
function clearPasswordResult() {
  generatedPassword = "";
  passwordGeneratorResult.innerHTML = "Waiting for password generation...";
}

// ===== Link Analyzer Pro =====
function analyzeLink() {
  const input = linkInput.value.trim();
  if (!input) {
    linkAnalyzerResult.innerHTML = "⚠ Please enter a URL or domain first.";
    lastLinkAnalysisResult = "";
    return;
  }
  try {
    const normalizedInput = input.startsWith("http://") || input.startsWith("https://") ? input : "https://" + input;
    const parsed = new URL(normalizedInput);
    const hostname = parsed.hostname;
    const protocol = parsed.protocol;
    const path = parsed.pathname || "/";
    const query = parsed.search || "None";
    const isHttps = protocol === "https:";
    const suspiciousKeywords = ["login", "verify", "update", "secure", "account", "bank", "free", "gift", "password", "wallet"];
    const hasSuspiciousKeyword = suspiciousKeywords.some(keyword => normalizedInput.toLowerCase().includes(keyword));
    const hasAtSymbol = normalizedInput.includes("@");
    const hasLongHost = hostname.length > 40;
    const hasManySubdomains = hostname.split(".").length > 4;
    let riskLevel = "✅ Safe-looking Link";
    let advice = "The link structure looks normal. Still verify the source before opening sensitive pages.";
    if (!isHttps || hasAtSymbol || hasSuspiciousKeyword || hasLongHost || hasManySubdomains) {
      riskLevel = "⚠ Suspicious Link";
      advice = "Review the URL carefully before opening it, especially if it asks for login, payment, or personal data.";
    }
    lastLinkAnalysisResult = `Link Analysis\nStatus: ${riskLevel}\nOriginal Input: ${input}\nNormalized URL: ${parsed.href}\nProtocol: ${protocol}\nHostname: ${hostname}\nPath: ${path}\nQuery: ${query}\nHTTPS: ${isHttps ? "Yes" : "No"}\nSuspicious Keyword: ${hasSuspiciousKeyword ? "Yes" : "No"}\n@ Symbol: ${hasAtSymbol ? "Yes" : "No"}\nLong Hostname: ${hasLongHost ? "Yes" : "No"}\nMany Subdomains: ${hasManySubdomains ? "Yes" : "No"}\nAdvice: ${advice}`;
    linkAnalyzerResult.innerHTML = `🔗 Link Analysis<br><br><b>Status:</b> ${riskLevel}<br><b>Original Input:</b> ${sanitize(input)}<br><b>Normalized URL:</b> ${sanitize(parsed.href)}<br><b>Protocol:</b> ${sanitize(protocol)}<br><b>Hostname:</b> ${sanitize(hostname)}<br><b>Path:</b> ${sanitize(path)}<br><b>Query:</b> ${sanitize(query)}<br><br><b>Checks:</b><br>${isHttps ? "✅" : "❌"} HTTPS<br>${hasSuspiciousKeyword ? "⚠" : "✅"} Suspicious keywords<br>${hasAtSymbol ? "⚠" : "✅"} @ symbol check<br>${hasLongHost ? "⚠" : "✅"} Hostname length<br>${hasManySubdomains ? "⚠" : "✅"} Subdomain count<br><br><b>Advice:</b> ${sanitize(advice)}`;
  } catch {
    linkAnalyzerResult.innerHTML = "❌ Invalid URL or domain.";
    lastLinkAnalysisResult = "";
  }
}
function clearLinkAnalysisResult() {
  linkInput.value = "";
  linkAnalyzerResult.innerHTML = "Waiting for link input...";
  lastLinkAnalysisResult = "";
}

// ===== Hash Generator Pro =====
async function generateHash() {
  const text = hashInput.value.trim();
  if (!text) {
    hashResult.innerHTML = "⚠ Please enter text to hash first.";
    lastHashResult = "";
    return;
  }
  const algorithm = hashType.value;
  try {
    const data = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest(algorithm, data);
    const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
    lastHashResult = hashHex;
    hashResult.innerHTML = `🔐 Hash Generated<br><br><b>Algorithm:</b> ${sanitize(algorithm)}<br><b>Input Length:</b> ${text.length} characters<br><br><b>Hash:</b><br><br>${codeBlock(hashHex)}`;
  } catch {
    hashResult.innerHTML = "❌ Hash generation failed.";
    lastHashResult = "";
  }
}
function clearHashResult() {
  hashInput.value = "";
  hashResult.innerHTML = "Waiting for hash input...";
  lastHashResult = "";
}

// ===== Base64 Encoder / Decoder Pro =====
function encodeBase64() {
  const text = base64Input.value.trim();
  if (!text) {
    base64Result.innerHTML = "⚠ Please enter text to encode first.";
    lastBase64Result = "";
    return;
  }
  try {
    const encoded = encodeUnicodeBase64(text);
    lastBase64Result = encoded;
    base64Result.innerHTML = `🔢 Base64 Encoded<br><br>${codeBlock(encoded)}`;
  } catch {
    base64Result.innerHTML = "❌ Failed to encode Base64.";
    lastBase64Result = "";
  }
}
function decodeBase64() {
  const text = base64Input.value.trim();
  if (!text) {
    base64Result.innerHTML = "⚠ Please enter Base64 text to decode first.";
    lastBase64Result = "";
    return;
  }
  try {
    const decoded = decodeUnicodeBase64(text);
    lastBase64Result = decoded;
    base64Result.innerHTML = `🔓 Base64 Decoded<br><br>${codeBlock(decoded)}`;
  } catch {
    base64Result.innerHTML = "❌ Invalid Base64 text.";
    lastBase64Result = "";
  }
}
function clearBase64Result() {
  base64Input.value = "";
  base64Result.innerHTML = "Waiting for Base64 input...";
  lastBase64Result = "";
}

// ===== Email Validator Pro =====
function validateEmail() {
  const email = emailInput.value.trim();
  if (!email) {
    emailResult.innerHTML = "⚠ Please enter an email address first.";
    lastEmailResult = "";
    return;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email);
  const status = isValid ? "Valid Email Address" : "Invalid Email Address";
  const icon = isValid ? "✅" : "❌";
  lastEmailResult = `${email} - ${status}`;
  emailResult.innerHTML = `📧 Email Validation<br><br><b>Email:</b> ${sanitize(email)}<br><br>${icon} <b>${status}</b>`;
}
function clearEmailResult() {
  emailInput.value = "";
  emailResult.innerHTML = "Waiting for email input...";
  lastEmailResult = "";
}

// ===== URL Parser Pro =====
function parseURL() {
  const input = urlParserInput.value.trim();
  if (!input) {
    urlParserResult.innerHTML = "⚠ Please enter a URL first.";
    lastUrlParserResult = "";
    return;
  }
  try {
    const normalizedInput = input.startsWith("http://") || input.startsWith("https://") ? input : "https://" + input;
    const url = new URL(normalizedInput);
    const port = url.port || "Default";
    const query = url.search || "None";
    const fragment = url.hash || "None";
    lastUrlParserResult = `URL Analysis\nOriginal Input: ${input}\nNormalized URL: ${url.href}\nProtocol: ${url.protocol}\nHostname: ${url.hostname}\nPort: ${port}\nPath: ${url.pathname}\nQuery: ${query}\nFragment: ${fragment}`;
    urlParserResult.innerHTML = `🌍 URL Analysis<br><br><b>Original Input:</b> ${sanitize(input)}<br><b>Normalized URL:</b> ${sanitize(url.href)}<br><b>Protocol:</b> ${sanitize(url.protocol)}<br><b>Hostname:</b> ${sanitize(url.hostname)}<br><b>Port:</b> ${sanitize(port)}<br><b>Path:</b> ${sanitize(url.pathname)}<br><b>Query:</b> ${sanitize(query)}<br><b>Fragment:</b> ${sanitize(fragment)}`;
  } catch {
    urlParserResult.innerHTML = "❌ Invalid URL.";
    lastUrlParserResult = "";
  }
}
function clearUrlParserResult() {
  urlParserInput.value = "";
  urlParserResult.innerHTML = "Waiting for URL input...";
  lastUrlParserResult = "";
}

// ===== URL Encoder / Decoder Pro =====
function showUrlCodecResult(mode, input, output) {
  lastUrlCodecResult = output;
  urlCodecResult.innerHTML = `🧩 URL ${mode}<br><br><b>Input:</b><br>${codeBlock(input)}<br><br><b>Result:</b><br>${codeBlock(output)}`;
}
function encodeUrlValue() {
  const input = urlCodecInput.value.trim();
  if (!input) {
    urlCodecResult.innerHTML = "⚠ Please enter text or URL to encode first.";
    lastUrlCodecResult = "";
    return;
  }
  try { showUrlCodecResult("Encoded", input, encodeURIComponent(input)); }
  catch { urlCodecResult.innerHTML = "❌ Could not encode this value."; lastUrlCodecResult = ""; }
}
function decodeUrlValue() {
  const input = urlCodecInput.value.trim();
  if (!input) {
    urlCodecResult.innerHTML = "⚠ Please enter encoded URL text to decode first.";
    lastUrlCodecResult = "";
    return;
  }
  try { showUrlCodecResult("Decoded", input, decodeURIComponent(input)); }
  catch { urlCodecResult.innerHTML = "❌ Invalid encoded URL text."; lastUrlCodecResult = ""; }
}
function clearUrlCodecResult() {
  urlCodecInput.value = "";
  urlCodecResult.innerHTML = "Waiting for URL encode/decode input...";
  lastUrlCodecResult = "";
}

// ===== IP Analyzer Pro =====
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
  if ((a === 192 && b === 0 && c === 2) || (a === 198 && b === 51 && c === 100) || (a === 203 && b === 0 && c === 113)) return { scope: "Documentation", routable: "No", icon: "⚠", note: "Reserved for examples and documentation." };
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
    ipAnalyzerResult.innerHTML = "⚠ Please enter an IPv4 or IPv6 address first.";
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
  const info = isIPv4 ? classifyIPv4(ip) : classifyIPv6(ip);
  const mapReady = info.routable === "Yes" ? "Future v2 candidate" : "No";
  lastIpAnalysisResult = `IP Analysis\nInput: ${ip}\nVersion: ${version}\nScope: ${info.scope}\nInternet Routable: ${info.routable}\nMap Support: ${mapReady}\nNote: ${info.note}`;
  ipAnalyzerResult.innerHTML = `🌐 IP Analysis<br><br><b>Input:</b> ${sanitize(ip)}<br><b>Version:</b> ${version}<br><b>Scope:</b> ${info.icon} ${sanitize(info.scope)}<br><b>Internet Routable:</b> ${sanitize(info.routable)}<br><b>Map Support:</b> ${sanitize(mapReady)}<br><br><b>Checks:</b><br>✅ Valid ${version}<br>${info.routable === "Yes" ? "✅" : "⚠"} Public internet routing<br>${info.scope === "Private" || info.scope === "Unique local" ? "✅" : "⚠"} Local/private detection<br><br><b>Advice:</b> ${sanitize(info.note)}<br><br><small>🗺️ GeoIP maps are planned for a future version and should be approximate only.</small>`;
}
function clearIpAnalysisResult() {
  ipInput.value = "";
  ipAnalyzerResult.innerHTML = "Waiting for IP input...";
  lastIpAnalysisResult = "";
}

// ===== File Hash Checker Pro =====
const FILE_HASH_MAX_BYTES = 100 * 1024 * 1024;
const RISKY_FILE_EXTENSIONS = new Set(["exe", "msi", "apk", "bat", "cmd", "sh", "ps1", "vbs", "js", "jar", "scr", "com", "dll", "deb", "rpm", "dmg", "pkg", "app", "run"]);
function getFileExtension(fileName) {
  const name = String(fileName || "").toLowerCase();
  const dotIndex = name.lastIndexOf(".");
  if (dotIndex === -1 || dotIndex === name.length - 1) return "";
  return name.slice(dotIndex + 1);
}
function getFileSecurityNote(file) {
  const extension = getFileExtension(file.name);
  if (RISKY_FILE_EXTENSIONS.has(extension)) return { icon: "⚠️", title: "Potentially risky file type", message: "This file type can be dangerous if opened. Abudi only generates its hash and does not execute it." };
  return { icon: "🛡️", title: "Local-only hash analysis", message: "This file is processed inside your browser. It is not uploaded and not executed." };
}
async function generateFileHash() {
  const file = fileHashInput.files[0];
  if (!file) {
    fileHashResult.innerHTML = "⚠ Please choose a file first.";
    lastFileHash = ""; lastFileName = ""; lastFileReport = "";
    return;
  }
  if (file.size > FILE_HASH_MAX_BYTES) {
    fileHashResult.innerHTML = `⚠ File is too large.<br><br><b>Maximum supported size:</b> ${formatFileSize(FILE_HASH_MAX_BYTES)}<br><b>Your file size:</b> ${formatFileSize(file.size)}<br><br>🛡️ Size limits prevent browser freezing and keep the tool stable on mobile.`;
    lastFileHash = ""; lastFileName = ""; lastFileReport = "";
    return;
  }
  try {
    fileHashResult.innerHTML = "⏳ Generating SHA-256 locally...";
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
    const securityNote = getFileSecurityNote(file);
    const fileType = file.type || "Unknown";
    const fileSizeFormatted = formatFileSize(file.size);
    const lastModified = formatDate(file.lastModified);
    lastFileHash = hashHex;
    lastFileName = file.name;
    lastFileReport = `File Hash Report\nGenerated: ${new Date().toLocaleString()}\nFile Name: ${file.name}\nFile Type: ${fileType}\nFile Size: ${fileSizeFormatted} (${file.size} bytes)\nLast Modified: ${lastModified}\nSHA-256: ${hashHex}\n\nSecurity Notes:\n- The file was processed locally in the browser.\n- The file was not uploaded.\n- The file was not executed.\n- This tool generates a hash only; it does not claim the file is virus-free.\n- Security warning: ${securityNote.title} - ${securityNote.message}`;
    fileHashResult.innerHTML = `📂 File Hash<br><br><b>File Name:</b> ${sanitize(file.name)}<br><b>File Type:</b> ${sanitize(fileType)}<br><b>File Size:</b> ${sanitize(fileSizeFormatted)} (${file.size} bytes)<br><b>Last Modified:</b> ${sanitize(lastModified)}<br><br>${securityNote.icon} <b>${sanitize(securityNote.title)}:</b> ${sanitize(securityNote.message)}<br><br>🛡️ <b>Privacy:</b> Local-only. The file is not uploaded and not executed.<br>⚠️ <b>Important:</b> Hash generated successfully, but this is not an antivirus scan and does not prove the file is safe.<br><br><b>SHA-256:</b><br><br>${codeBlock(hashHex)}`;
  } catch {
    fileHashResult.innerHTML = "❌ Failed to generate file hash.";
    lastFileHash = ""; lastFileName = ""; lastFileReport = "";
  }
}
function downloadReport() {
  if (!lastFileReport || !lastFileName) {
    fileHashResult.innerHTML += "<br><br>⚠ No report to download. Generate a file hash first.";
    return;
  }
  const blob = new Blob([lastFileReport], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${lastFileName}_hash_report.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  fileHashResult.innerHTML += "<br><br>✅ Report downloaded.";
}
function clearFileHashResult() {
  fileHashResult.innerHTML = "Waiting for file input...";
  lastFileHash = ""; lastFileName = ""; lastFileReport = "";
  fileHashInput.value = "";
}

// ===== Search / Categories =====
function initToolNavigation() {
  const searchInput = $("toolSearch");
  const clearSearchBtn = $("clearToolSearch");
  const noToolsFound = $("noToolsFound");
  const cards = Array.from(document.querySelectorAll(".tool-card"));
  const categoryTitles = Array.from(document.querySelectorAll(".category-title"));
  const pills = Array.from(document.querySelectorAll(".category-pill"));
  const status = $("toolSearchStatus");
  if (!searchInput || !clearSearchBtn || !status) return;
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
      const shouldShow = (activeCategory === "all" || category === activeCategory) && (!query || keywords.includes(query));
      card.classList.toggle("tool-hidden", !shouldShow);
      if (shouldShow) visibleCount++;
    });
    categoryTitles.forEach(title => {
      const category = title.dataset.categoryTitle;
      const hasVisibleCard = cards.some(card => card.dataset.category === category && !card.classList.contains("tool-hidden"));
      title.classList.toggle("tool-hidden", !hasVisibleCard);
    });
    clearSearchBtn.hidden = !query && activeCategory === "all";
    if (noToolsFound) noToolsFound.classList.toggle("tool-hidden", visibleCount !== 0);
    status.textContent = visibleCount === cards.length && activeCategory === "all" && !query ? "Showing all tools." : visibleCount === 0 ? "No matching tools." : `Showing ${visibleCount} of ${cards.length} tools.`;
  }
  searchInput.addEventListener("input", updateVisibleTools);
  clearSearchBtn.addEventListener("click", () => { searchInput.value = ""; setActiveCategory("all"); updateVisibleTools(); searchInput.focus(); });
  pills.forEach(pill => pill.addEventListener("click", () => { setActiveCategory(pill.dataset.filter); updateVisibleTools(); }));
  updateVisibleTools();
}

// ===== Event Listeners =====
bindClick("analyzeTextBtn", analyzeText);
bindClick("copyTextAnalysisBtn", () => copyLogicalValue(lastTextAnalysisResult, textAnalyzerResult, "Text analysis copied."));
bindClick("clearTextAnalysisBtn", clearTextAnalysisResult);
bindClick("checkPasswordBtn", checkPassword);
bindClick("copyPasswordCheckBtn", () => copyLogicalValue(lastPasswordCheckResult, passwordCheckerResult, "Password check result copied."));
bindClick("clearPasswordCheckBtn", clearPasswordCheckResult);
bindClick("generatePasswordBtn", generatePassword);
bindClick("copyPasswordBtn", () => copyLogicalValue(generatedPassword, passwordGeneratorResult, "Password copied."));
bindClick("clearPasswordBtn", clearPasswordResult);
bindClick("analyzeLinkBtn", analyzeLink);
bindClick("copyLinkAnalysisBtn", () => copyLogicalValue(lastLinkAnalysisResult, linkAnalyzerResult, "Link analysis copied."));
bindClick("clearLinkAnalysisBtn", clearLinkAnalysisResult);
bindClick("generateHashBtn", generateHash);
bindClick("copyHashBtn", () => copyLogicalValue(lastHashResult, hashResult, "Hash copied."));
bindClick("clearHashBtn", clearHashResult);
bindClick("encodeBtn", encodeBase64);
bindClick("decodeBtn", decodeBase64);
bindClick("copyBase64Btn", () => copyLogicalValue(lastBase64Result, base64Result, "Base64 result copied."));
bindClick("clearBase64Btn", clearBase64Result);
bindClick("validateEmailBtn", validateEmail);
bindClick("copyEmailBtn", () => copyLogicalValue(lastEmailResult, emailResult, "Email result copied."));
bindClick("clearEmailBtn", clearEmailResult);
bindClick("parseUrlBtn", parseURL);
bindClick("copyUrlParserBtn", () => copyLogicalValue(lastUrlParserResult, urlParserResult, "URL analysis copied."));
bindClick("clearUrlParserBtn", clearUrlParserResult);
bindClick("urlEncodeBtn", encodeUrlValue);
bindClick("urlDecodeBtn", decodeUrlValue);
bindClick("copyUrlCodecBtn", () => copyLogicalValue(lastUrlCodecResult, urlCodecResult, "URL result copied."));
bindClick("clearUrlCodecBtn", clearUrlCodecResult);
bindClick("analyzeIpBtn", analyzeIp);
bindClick("copyIpAnalysisBtn", () => copyLogicalValue(lastIpAnalysisResult, ipAnalyzerResult, "IP analysis copied."));
bindClick("clearIpAnalysisBtn", clearIpAnalysisResult);
bindClick("generateFileHashBtn", generateFileHash);
bindClick("copyFileHashBtn", () => copyLogicalValue(lastFileHash, fileHashResult, "SHA-256 copied."));
bindClick("downloadReportBtn", downloadReport);
bindClick("clearFileHashBtn", clearFileHashResult);

initToolNavigation();
