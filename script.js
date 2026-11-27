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
  const htmlEntities = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  };

  return String(input).replace(/[&<>"']/g, character => htmlEntities[character]);
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
const PASSWORD_CHECKER_MAX_CODE_POINTS = 1024;
const KNOWN_WEAK_PASSWORD_EXAMPLES = new Set([
  "password",
  "password1",
  "password123",
  "123456",
  "12345678",
  "123456789",
  "qwerty",
  "qwerty123",
  "letmein",
  "admin",
  "welcome",
  "iloveyou"
]);

function handlePasswordInputChange() {
  lastPasswordCheckResult = "";
  passwordCheckerResult.textContent = "Password changed. Run the check again.";
}

function checkPassword() {
  const password = passwordInput.value;
  if (!password) {
    passwordCheckerResult.textContent = "⚠ Please enter a password first.";
    lastPasswordCheckResult = "";
    return;
  }

  // Bound local analysis work while allowing passphrases far beyond 64 characters.
  if (password.length > PASSWORD_CHECKER_MAX_CODE_POINTS * 2) {
    passwordCheckerResult.textContent = "⚠ Password is too long for this local check. Maximum supported length is 1,024 Unicode characters.";
    lastPasswordCheckResult = "";
    return;
  }

  const characters = Array.from(password);
  const length = characters.length;
  if (length > PASSWORD_CHECKER_MAX_CODE_POINTS) {
    passwordCheckerResult.textContent = "⚠ Password is too long for this local check. Maximum supported length is 1,024 Unicode characters.";
    lastPasswordCheckResult = "";
    return;
  }
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSymbols = /[^\p{L}\p{N}\s]/u.test(password);
  const normalized = password.toLowerCase();
  const isRepeatedCharacter = characters.length > 1 && characters.every(character => character === characters[0]);
  const isKnownWeakExample = KNOWN_WEAK_PASSWORD_EXAMPLES.has(normalized) || /^(?:password|qwerty|letmein|admin|welcome)[0-9!@#$]*$/i.test(password);
  const isSimpleSequence = /^(?:0123456789|1234567890|abcdefghijklmnopqrstuvwxyz|qwertyuiop)$/i.test(password);
  const hasPredictablePattern = isRepeatedCharacter || isKnownWeakExample || isSimpleSequence;

  let status;
  if (hasPredictablePattern) {
    status = "⚠ Predictable pattern detected";
  } else if (length < 8) {
    status = "❌ Very short";
  } else if (length < 15) {
    status = "⚠ Below 15-character single-factor benchmark";
  } else {
    status = "✅ 15+ characters (length indicator only)";
  }

  const advice = hasPredictablePattern
    ? "Avoid repeated characters, keyboard sequences, and well-known weak examples. Choose a unique passphrase."
    : length < 15
      ? "Consider a longer, unique passphrase. NIST sets a 15-character minimum for passwords used as a single authentication factor; multi-factor contexts have a different minimum."
      : "This length is a useful indicator, not proof of strength. Use a unique password and avoid reuse. This tool does not check breached-password databases.";

  const observations = [
    `Length: ${length} Unicode characters`,
    `15+ characters: ${length >= 15 ? "Yes" : "No"}`,
    `Lowercase letters present: ${hasLower ? "Yes" : "No"}`,
    `Uppercase letters present: ${hasUpper ? "Yes" : "No"}`,
    `Numbers present: ${hasNumbers ? "Yes" : "No"}`,
    `Symbols present: ${hasSymbols ? "Yes" : "No"}`,
    `Predictable pattern detected: ${hasPredictablePattern ? "Yes" : "No"}`
  ];

  lastPasswordCheckResult = `Password Quality Check\nAssessment: ${status}\n${observations.join("\n")}\nAdvice: ${advice}\nLimitations: Local heuristic only; no breach database lookup and no guarantee of account security.`;

  passwordCheckerResult.innerHTML = `🔐 Password Quality Check<br><br><b>Assessment:</b> ${sanitize(status)}<br><b>Length:</b> ${length} Unicode characters<br><br><b>Observations (not a composition score):</b><br>${observations.slice(1, 6).map(item => sanitize(item)).join("<br>")}<br><br><b>Predictable pattern:</b> ${hasPredictablePattern ? "⚠ Detected" : "No listed pattern detected"}<br><br><b>Advice:</b> ${sanitize(advice)}<br><br><small>Local heuristic only. No breached-password database lookup; a positive result does not prove a password is safe.</small>`;
}

function clearPasswordCheckResult() {
  passwordInput.value = "";
  passwordCheckerResult.textContent = "Waiting for password input...";
  lastPasswordCheckResult = "";
}
// ===== Password Generator Pro =====
function secureRandomIndex(max) {
  if (!Number.isSafeInteger(max) || max < 1 || max > 256) {
    throw new Error("INVALID_RANDOM_BOUND");
  }

  const cryptoProvider = globalThis.crypto;
  if (!cryptoProvider || typeof cryptoProvider.getRandomValues !== "function") {
    throw new Error("SECURE_RANDOM_UNAVAILABLE");
  }

  // Rejection sampling avoids modulo bias.
  const limit = Math.floor(256 / max) * max;
  const sample = new Uint8Array(1);
  for (let attempts = 0; attempts < 128; attempts++) {
    cryptoProvider.getRandomValues(sample);
    if (sample[0] < limit) return sample[0] % max;
  }
  throw new Error("SECURE_RANDOM_FAILED");
}

function secureShuffle(value) {
  const chars = value.split("");
  for (let i = chars.length - 1; i > 0; i--) {
    const j = secureRandomIndex(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

function generatePassword() {
  const requestedLength = Number.parseInt(passwordLength.value, 10);
  const len = Number.isInteger(requestedLength) && requestedLength >= 8 && requestedLength <= 64
    ? requestedLength
    : 12;
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>/?";
  const all = lower + upper + numbers + symbols;

  try {
    const required = [
      lower[secureRandomIndex(lower.length)],
      upper[secureRandomIndex(upper.length)],
      numbers[secureRandomIndex(numbers.length)],
      symbols[secureRandomIndex(symbols.length)]
    ];
    let pass = required.join("");
    for (let i = pass.length; i < len; i++) {
      pass += all[secureRandomIndex(all.length)];
    }

    generatedPassword = secureShuffle(pass);
    passwordGeneratorResult.replaceChildren();
    passwordGeneratorResult.style.whiteSpace = "pre-wrap";
    passwordGeneratorResult.append(
      document.createTextNode(
        `🎲 Generated Password\n\nLength: ${len} characters\nContains: Uppercase, lowercase, numbers, symbols\n\nPassword:\n`
      )
    );
    const passwordOutput = document.createElement("code");
    passwordOutput.className = "generated-password";
    passwordOutput.textContent = generatedPassword;
    passwordGeneratorResult.append(passwordOutput);
  } catch {
    generatedPassword = "";
    passwordGeneratorResult.textContent =
      "❌ Secure password generation is unavailable in this browser. No password was generated.";
  }
}
function clearPasswordResult() {
  generatedPassword = "";
  passwordGeneratorResult.innerHTML = "Waiting for password generation...";
}

// ===== Link Analyzer Pro =====
function analyzeLink() {
  const input = linkInput.value.trim();
  if (!input) {
    linkAnalyzerResult.textContent = "⚠ Please enter a URL or domain first.";
    lastLinkAnalysisResult = "";
    return;
  }

  try {
    const isHttpUrl = /^https?:\/\//i.test(input);
    const isBareHostWithPort = /^[^/:?#\\s]+:\\d+(?:[/?#]|$)/.test(input);
    const hasExplicitScheme = /^[a-z][a-z0-9+.-]*:/i.test(input) && !isBareHostWithPort;
    if (hasExplicitScheme && !isHttpUrl) {
      throw new Error("UNSUPPORTED_URL_SCHEME");
    }

    const normalizedInput = isHttpUrl ? input : "https://" + input;
    const parsed = new URL(normalizedInput);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error("UNSUPPORTED_URL_SCHEME");
    }
    if (!parsed.hostname) {
      throw new Error("MISSING_HOSTNAME");
    }

    const hostname = parsed.hostname;
    const protocol = parsed.protocol;
    const path = parsed.pathname || "/";
    const query = parsed.search || "None";
    const isHttps = protocol === "https:";
    const suspiciousKeywords = ["login", "verify", "update", "account", "bank", "free", "gift", "password", "wallet"];
    const hasSuspiciousKeyword = suspiciousKeywords.some(keyword => normalizedInput.toLowerCase().includes(keyword));
    const hasCredentials = Boolean(parsed.username || parsed.password);
    const hasLongHost = hostname.length > 40;
    const hasManySubdomains = hostname.split(".").length > 4;
    const hasSingleLabelHost = !hostname.includes(".");
    const hasNonStandardPort = Boolean(parsed.port);
    const flags = [
      !isHttps,
      hasCredentials,
      hasSuspiciousKeyword,
      hasLongHost,
      hasManySubdomains,
      hasSingleLabelHost,
      hasNonStandardPort
    ];
    const hasIndicators = flags.some(Boolean);
    const riskLevel = hasIndicators
      ? "⚠ Potentially suspicious indicators"
      : "ℹ No obvious heuristic indicators";
    const advice = hasIndicators
      ? "Review the address carefully. These are structural heuristics, not a malware or reputation verdict."
      : "No listed structural indicators were detected. This does not establish that the destination is trustworthy or safe.";

    lastLinkAnalysisResult = `Link Analysis
Assessment: ${riskLevel}
Original Input: ${input}
Normalized URL: ${parsed.href}
Protocol: ${protocol}
Hostname: ${hostname}
Path: ${path}
Query: ${query}
HTTPS: ${isHttps ? "Yes" : "No"}
Embedded Credentials: ${hasCredentials ? "Yes" : "No"}
Suspicious Keywords: ${hasSuspiciousKeyword ? "Yes" : "No"}
Long Hostname: ${hasLongHost ? "Yes" : "No"}
Many Subdomains: ${hasManySubdomains ? "Yes" : "No"}
Single-label Host: ${hasSingleLabelHost ? "Yes" : "No"}
Non-standard Port: ${hasNonStandardPort ? "Yes" : "No"}
Advice: ${advice}
Limitations: No DNS, redirect, content, malware, or domain-reputation lookup.`;

    linkAnalyzerResult.innerHTML = `🔗 Link Analysis<br><br><b>Assessment:</b> ${sanitize(riskLevel)}<br><b>Original Input:</b> ${sanitize(input)}<br><b>Normalized URL:</b> ${sanitize(parsed.href)}<br><b>Protocol:</b> ${sanitize(protocol)}<br><b>Hostname:</b> ${sanitize(hostname)}<br><b>Path:</b> ${sanitize(path)}<br><b>Query:</b> ${sanitize(query)}<br><br><b>Structural checks:</b><br>${isHttps ? "✅" : "⚠"} HTTPS<br>${hasCredentials ? "⚠" : "✅"} Embedded credentials<br>${hasSuspiciousKeyword ? "⚠" : "✅"} Suspicious keywords<br>${hasLongHost ? "⚠" : "✅"} Hostname length<br>${hasManySubdomains ? "⚠" : "✅"} Subdomain count<br>${hasSingleLabelHost ? "⚠" : "✅"} Single-label hostname<br>${hasNonStandardPort ? "⚠" : "✅"} Non-standard port<br><br><b>Advice:</b> ${sanitize(advice)}<br><br><small>Heuristic only. No DNS, redirect, page-content, malware, or domain-reputation lookup. No result proves a URL is safe.</small>`;
  } catch {
    linkAnalyzerResult.textContent = "❌ Invalid URL or unsupported URL scheme. Only HTTP and HTTPS links are supported.";
    lastLinkAnalysisResult = "";
  }
}

function clearLinkAnalysisResult() {
  linkInput.value = "";
  linkAnalyzerResult.textContent = "Waiting for link input...";
  lastLinkAnalysisResult = "";
}
// ===== Hash Generator Pro =====
const HASH_GENERATOR_MAX_BYTES = 1024 * 1024;
const HASH_GENERATOR_ALGORITHMS = new Set(["SHA-1", "SHA-256"]);
let hashRequestId = 0;

function invalidateHashRequest(message) {
  hashRequestId += 1;
  lastHashResult = "";
  if (message) hashResult.textContent = message;
}

function handleHashInputChange() {
  invalidateHashRequest(hashInput.value ? "Input changed. Generate a new hash to continue." : "Waiting for hash input...");
}

function handleHashAlgorithmChange() {
  invalidateHashRequest("Hash algorithm changed. Generate a new hash to continue.");
}

async function generateHash() {
  const requestId = ++hashRequestId;
  const input = hashInput.value;
  if (input.length === 0) {
    lastHashResult = "";
    hashResult.textContent = "⚠ Please enter text to hash first.";
    return;
  }

  lastHashResult = "";
  const algorithm = hashType.value;
  if (!HASH_GENERATOR_ALGORITHMS.has(algorithm)) {
    hashResult.textContent = "❌ Unsupported hash algorithm.";
    return;
  }

  try {
    const data = new TextEncoder().encode(input);
    if (data.byteLength > HASH_GENERATOR_MAX_BYTES) {
      hashResult.textContent = "⚠ Input is too large. Maximum supported size is 1 MiB of UTF-8 data.";
      return;
    }

    const cryptoApi = globalThis.crypto;
    if (!cryptoApi || !cryptoApi.subtle || typeof cryptoApi.subtle.digest !== "function") {
      hashResult.textContent = "❌ Hash generation is unavailable in this browser context. Open Abudi over HTTPS or use a browser that supports Web Crypto.";
      return;
    }

    hashResult.textContent = "⏳ Generating hash locally...";
    const hashBuffer = await cryptoApi.subtle.digest(algorithm, data);
    if (requestId !== hashRequestId) return;

    const hashBytes = new Uint8Array(hashBuffer);
    const expectedDigestBytes = algorithm === "SHA-1" ? 20 : 32;
    if (hashBytes.byteLength !== expectedDigestBytes) {
      throw new Error("Unexpected digest length");
    }
    const hashHex = Array.from(hashBytes)
      .map(byte => byte.toString(16).padStart(2, "0"))
      .join("");

    lastHashResult = hashHex;
    hashResult.innerHTML = `🔐 Hash Generated<br><br><b>Algorithm:</b> ${sanitize(algorithm)}<br><b>Input Length:</b> ${Array.from(input).length} characters<br><b>Input Size:</b> ${data.byteLength} UTF-8 bytes<br><br><b>Hash:</b><br><br>${codeBlock(hashHex)}`;
  } catch {
    if (requestId !== hashRequestId) return;
    lastHashResult = "";
    hashResult.textContent = "❌ Hash generation failed. The browser cryptographic operation could not be completed.";
  }
}

function clearHashResult() {
  invalidateHashRequest("Waiting for hash input...");
  hashInput.value = "";
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

// ===== Email Format Checker =====
function inspectEmailAddress(email) {
  if (email.length > 254) return { valid: false, reason: "The address exceeds the 254-character email limit." };

  const atIndex = email.indexOf("@");
  if (atIndex <= 0 || atIndex !== email.lastIndexOf("@") || atIndex === email.length - 1) {
    return { valid: false, reason: "Use one @ symbol with a local part and a domain." };
  }

  const localPart = email.slice(0, atIndex);
  const domain = email.slice(atIndex + 1);

  if (localPart.length > 64) return { valid: false, reason: "The local part exceeds 64 characters." };
  if (
    localPart.startsWith(".") ||
    localPart.endsWith(".") ||
    localPart.includes("..") ||
    !/^[A-Za-z0-9!#$%&'*+/=?^_\x60{|}~.-]+$/.test(localPart)
  ) {
    return { valid: false, reason: "The local part contains unsupported characters or dot placement." };
  }

  if (!/^[\p{L}\p{N}.-]+$/u.test(domain) || domain.startsWith(".") || domain.endsWith(".") || domain.includes("..")) {
    return { valid: false, reason: "The domain contains invalid characters or dot placement." };
  }

  let asciiDomain;
  try {
    const parsedDomain = new URL(`http://${domain}/`);
    if (parsedDomain.username || parsedDomain.password || parsedDomain.port || parsedDomain.pathname !== "/") {
      return { valid: false, reason: "The domain contains unsupported URL components." };
    }
    asciiDomain = parsedDomain.hostname.toLowerCase();
  } catch {
    return { valid: false, reason: "The domain is not a valid hostname." };
  }

  if (!asciiDomain || asciiDomain.length > 253) {
    return { valid: false, reason: "The domain length is invalid." };
  }

  const labels = asciiDomain.split(".");
  if (
    /^(?:\d{1,3}\.){3}\d{1,3}$/.test(asciiDomain) ||
    labels.length < 2 ||
    labels.some(label =>
      label.length < 1 ||
      label.length > 63 ||
      !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(label)
    )
  ) {
    return { valid: false, reason: "The domain must contain valid DNS labels, not an IP address literal." };
  }

  if (labels[labels.length - 1].length < 2 || !/[a-z]/i.test(labels[labels.length - 1])) {
    return { valid: false, reason: "The top-level domain must contain at least two characters." };
  }

  if (localPart.length + 1 + asciiDomain.length > 254) {
    return { valid: false, reason: "The normalized address exceeds the 254-character email limit." };
  }

  return { valid: true, reason: "The address matches the supported email syntax." };
}

function validateEmail() {
  const email = emailInput.value.trim();
  if (!email) {
    emailResult.textContent = "⚠ Please enter an email address first.";
    lastEmailResult = "";
    return;
  }

  const result = inspectEmailAddress(email);
  const status = result.valid ? "Format appears valid" : "Invalid email format";
  const icon = result.valid ? "✅" : "❌";
  lastEmailResult = `${email} - ${status}\n${result.reason}\nThis check does not verify mailbox existence or deliverability.`;
  emailResult.innerHTML = `📧 Email Format Check<br><br><b>Email:</b> ${sanitize(email)}<br><br>${icon} <b>${status}</b><br>${sanitize(result.reason)}<br><br><small>This is a syntax check only. It does not verify that the mailbox exists, accepts mail, or is reachable.</small>`;
}

function clearEmailResult() {
  emailInput.value = "";
  emailResult.textContent = "Waiting for email input...";
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
  if (typeof ip !== "string") return false;
  const parts = ip.split(".");
  return parts.length === 4 && parts.every(part =>
    /^\d+$/.test(part) &&
    !(part.length > 1 && part.startsWith("0")) &&
    Number(part) >= 0 &&
    Number(part) <= 255
  );
}

function parseIPv6(ip) {
  if (typeof ip !== "string" || !ip || ip.includes("%") || ip.includes(":::")) {
    return null;
  }

  let value = ip;

  // IPv4-embedded IPv6 forms use the final 32 bits for a dotted-decimal address.
  if (value.includes(".")) {
    const lastColon = value.lastIndexOf(":");
    if (lastColon < 0) return null;

    const ipv4 = value.slice(lastColon + 1);
    if (!isValidIPv4(ipv4)) return null;

    const octets = ipv4.split(".").map(Number);
    const high = ((octets[0] << 8) | octets[1]).toString(16);
    const low = ((octets[2] << 8) | octets[3]).toString(16);
    value = value.slice(0, lastColon) + ":" + high + ":" + low;
  }

  const compressionIndex = value.indexOf("::");
  if (compressionIndex !== -1 && value.indexOf("::", compressionIndex + 2) !== -1) {
    return null;
  }

  let groups;
  if (compressionIndex === -1) {
    groups = value.split(":");
    if (groups.length !== 8) return null;
  } else {
    const leftText = value.slice(0, compressionIndex);
    const rightText = value.slice(compressionIndex + 2);
    const left = leftText ? leftText.split(":") : [];
    const right = rightText ? rightText.split(":") : [];

    if (left.some(group => !group) || right.some(group => !group)) return null;
    const missingGroups = 8 - left.length - right.length;
    if (missingGroups < 1) return null;
    groups = [...left, ...Array(missingGroups).fill("0"), ...right];
  }

  if (
    groups.length !== 8 ||
    groups.some(group => !/^[0-9a-fA-F]{1,4}$/.test(group))
  ) {
    return null;
  }

  return groups.map(group => Number.parseInt(group, 16));
}

function isValidIPv6(ip) {
  return parseIPv6(ip) !== null;
}

function classifyIPv4(ip) {
  const [a, b, c, d] = ip.split(".").map(Number);

  if (a === 255 && b === 255 && c === 255 && d === 255) {
    return { scope: "Limited broadcast", routable: "No", icon: "⚠", note: "Limited broadcast address; not a unicast destination." };
  }
  if (a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168)) {
    return { scope: "Private", routable: "No", icon: "✅", note: "Private-use address for internal networks." };
  }
  if (a === 127) {
    return { scope: "Loopback", routable: "No", icon: "⚠", note: "Points back to the same device." };
  }
  if (a === 169 && b === 254) {
    return { scope: "Link-local", routable: "No", icon: "⚠", note: "Link-local address used on the local network segment." };
  }
  if (a === 100 && b >= 64 && b <= 127) {
    return { scope: "Carrier-grade NAT", routable: "Limited", icon: "⚠", note: "Shared address space commonly used by service providers." };
  }
  if (
    (a === 192 && b === 0 && c === 2) ||
    (a === 198 && b === 51 && c === 100) ||
    (a === 203 && b === 0 && c === 113)
  ) {
    return { scope: "Documentation", routable: "No", icon: "⚠", note: "Reserved for examples and documentation." };
  }
  if (a === 198 && (b === 18 || b === 19)) {
    return { scope: "Benchmarking", routable: "No", icon: "⚠", note: "Reserved for network benchmarking tests." };
  }

  // More-specific IANA assignments take precedence over the 192.0.0.0/24 parent block.
  if (a === 192 && b === 0 && c === 0) {
    if (d === 9) {
      return { scope: "PCP anycast", routable: "Yes", icon: "⚠", note: "IANA-assigned Port Control Protocol anycast address." };
    }
    if (d === 10) {
      return { scope: "TURN anycast", routable: "Yes", icon: "⚠", note: "IANA-assigned Traversal Using Relays around NAT anycast address." };
    }
    if (d <= 7) {
      return { scope: "IPv4 service continuity", routable: "Limited", icon: "⚠", note: "Special-purpose service-continuity prefix; not globally reachable." };
    }
    if (d === 8) {
      return { scope: "Dummy address", routable: "No", icon: "⚠", note: "Special-purpose dummy address; not a general destination." };
    }
    if (d === 170 || d === 171) {
      return { scope: "NAT64/DNS64 discovery", routable: "No", icon: "⚠", note: "Reserved for NAT64/DNS64 discovery mechanisms." };
    }
    return { scope: "Unassigned protocol block", routable: "No", icon: "⚠", note: "Part of the IETF protocol-assignment block; usable only where a more-specific assignment exists." };
  }

  // 192.88.99.2/32 is a more-specific assignment within the deprecated 6to4 block.
  if (a === 192 && b === 88 && c === 99) {
    if (d === 2) {
      return { scope: "6a44 relay anycast", routable: "Limited", icon: "⚠", note: "IANA-assigned 6a44 relay anycast address; not globally reachable." };
    }
    return { scope: "Deprecated 6to4 relay", routable: "No", icon: "⚠", note: "Deprecated 6to4 relay anycast block." };
  }

  if (a >= 224 && a <= 239) {
    return { scope: "Multicast", routable: "Special", icon: "⚠", note: "Used for multicast traffic, not ordinary unicast hosts." };
  }
  if (a === 0 || a >= 240) {
    return { scope: "Reserved", routable: "No", icon: "⚠", note: "Reserved or special-use IPv4 address space." };
  }
  return { scope: "Public", routable: "Yes", icon: "✅", note: "Globally reachable unicast range; this classification is not a reputation or safety check." };
}

function classifyIPv6(ip) {
  const groups = parseIPv6(ip);
  if (!groups) {
    return { scope: "Invalid", routable: "No", icon: "⚠", note: "The IPv6 address is invalid." };
  }

  const allZeroPrefix = groups.slice(0, 7).every(group => group === 0);
  const first = groups[0];
  const second = groups[1];
  if (allZeroPrefix && groups[7] === 1) {
    return { scope: "Loopback", routable: "No", icon: "⚠", note: "Points back to the same device." };
  }
  if (groups.every(group => group === 0)) {
    return { scope: "Unspecified", routable: "No", icon: "⚠", note: "Represents no specific address." };
  }
  if (groups.slice(0, 5).every(group => group === 0) && groups[5] === 0xffff) {
    return { scope: "IPv4-mapped", routable: "Special", icon: "⚠", note: "Embeds an IPv4 address; assess the embedded IPv4 address separately." };
  }

  // IANA IPv6 special-purpose assignments; specific allocations precede parent blocks.
  if (first === 0x0064 && second === 0xff9b && groups.slice(2, 6).every(group => group === 0)) {
    return { scope: "IPv4-translatable", routable: "Yes", icon: "⚠", note: "IANA IPv4/IPv6 translation prefix; global reachability is permitted by its registry entry." };
  }
  if (first === 0x0064 && second === 0xff9b && groups[2] === 1) {
    return { scope: "IPv4-translatable", routable: "Limited", icon: "⚠", note: "Local-use IPv4/IPv6 translation prefix; not globally reachable." };
  }
  if (first === 0x0100 && second === 0 && groups[2] === 0 && groups[3] === 0) {
    return { scope: "Discard-only", routable: "No", icon: "⚠", note: "Reserved discard-only IPv6 address block." };
  }
  if (first === 0x0100 && second === 0 && groups[2] === 0 && groups[3] === 1) {
    return { scope: "Dummy prefix", routable: "No", icon: "⚠", note: "Special-purpose dummy IPv6 prefix." };
  }
  // TEREDO is registered for the entire 2001::/32 prefix.
  if (first === 0x2001 && second === 0) {
    return { scope: "Teredo", routable: "Special", icon: "⚠", note: "Teredo transition mechanism prefix; routing depends on the mechanism and network." };
  }
  if (first === 0x2001 && second === 1 && groups.slice(2, 7).every(group => group === 0) && [1, 2, 3].includes(groups[7])) {
    return { scope: "IETF anycast", routable: "Yes", icon: "⚠", note: "Specific IANA-registered protocol anycast address." };
  }
  if (first === 0x2001 && second === 2 && groups[2] === 0) {
    return { scope: "Benchmarking", routable: "Limited", icon: "⚠", note: "Reserved for IPv6 network benchmarking; not globally reachable." };
  }
  if (first === 0x2001 && second === 3) {
    return { scope: "AMT", routable: "Yes", icon: "⚠", note: "IANA-registered Automatic Multicast Tunneling prefix." };
  }
  if (first === 0x2001 && second === 4 && groups[2] === 0x0112) {
    return { scope: "AS112 service", routable: "Yes", icon: "⚠", note: "IANA-registered AS112 service prefix." };
  }
  if (first === 0x2001 && (second & 0xfff0) === 0x0010) {
    return { scope: "Deprecated ORCHID", routable: "No", icon: "⚠", note: "Deprecated ORCHID prefix." };
  }
  if (first === 0x2001 && (second & 0xfff0) === 0x0020) {
    return { scope: "ORCHIDv2", routable: "Yes", icon: "⚠", note: "IANA-registered ORCHIDv2 special-purpose prefix." };
  }
  if (first === 0x2001 && (second & 0xfff0) === 0x0030) {
    return { scope: "Drone Remote ID", routable: "Yes", icon: "⚠", note: "IANA-registered Drone Remote ID protocol prefix." };
  }
  if (first === 0x2001 && second <= 0x01ff) {
    return { scope: "Unassigned IETF protocol block", routable: "No", icon: "⚠", note: "Within the IETF protocol-assignment block; use only where a more-specific IANA allocation exists." };
  }
  if (first === 0x2001 && second === 0x0db8) {
    return { scope: "Documentation", routable: "No", icon: "⚠", note: "Reserved for examples and documentation." };
  }
  if (first === 0x3fff && (second & 0xf000) === 0) {
    return { scope: "Documentation", routable: "No", icon: "⚠", note: "Reserved for documentation and examples." };
  }
  if (first === 0x2002) {
    return { scope: "6to4", routable: "Special", icon: "⚠", note: "Deprecated transition mechanism; do not interpret as a normal public endpoint." };
  }
  if (first === 0x5f00) {
    return { scope: "Segment-routing SID", routable: "Limited", icon: "⚠", note: "Reserved for Segment Routing over IPv6 identifiers; not globally reachable." };
  }
  if ((first & 0xffc0) === 0xfe80) {
    return { scope: "Link-local", routable: "No", icon: "⚠", note: "Link-local address used on the local network segment." };
  }
  if ((first & 0xfe00) === 0xfc00) {
    return { scope: "Unique local", routable: "No", icon: "✅", note: "Private-style IPv6 address for local networks." };
  }
  if ((first & 0xff00) === 0xff00) {
    return { scope: "Multicast", routable: "Special", icon: "⚠", note: "Used for multicast traffic, not ordinary unicast hosts." };
  }
  if ((first & 0xe000) === 0x2000) {
    return { scope: "Global/Public", routable: "Yes", icon: "✅", note: "IPv6 global unicast range; this classification is not a reputation or safety check." };
  }
  return { scope: "Reserved / Special", routable: "No", icon: "⚠", note: "This address is outside the global unicast range." };
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
let fileHashRequestId = 0;

function getFileExtension(fileName) {
  const name = String(fileName || "").toLowerCase();
  const dotIndex = name.lastIndexOf(".");
  if (dotIndex <= 0 || dotIndex === name.length - 1) return "";
  return name.slice(dotIndex + 1);
}

function getFileSecurityNote(file) {
  const extension = getFileExtension(file.name);
  if (RISKY_FILE_EXTENSIONS.has(extension)) {
    return {
      icon: "⚠️",
      title: "Potentially risky file type",
      message: "This file type can be dangerous if opened. Abudi only generates its hash and does not execute it."
    };
  }
  return {
    icon: "🛡️",
    title: "Local-only hash analysis",
    message: "This file is processed inside your browser. It is not uploaded and not executed."
  };
}

function sanitizeReportField(value) {
  return String(value == null ? "" : value)
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 255);
}

function sanitizeDownloadFileName(fileName) {
  const safeName = String(fileName || "")
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "_")
    .replace(/^[. ]+/, "")
    .replace(/[. ]+$/g, "")
    .trim()
    .slice(0, 120);
  return safeName || "file";
}

function invalidateFileHashRequest() {
  fileHashRequestId += 1;
  lastFileHash = "";
  lastFileName = "";
  lastFileReport = "";
}

function handleFileHashSelectionChange() {
  invalidateFileHashRequest();
  fileHashResult.innerHTML = fileHashInput.files && fileHashInput.files.length
    ? "File selection changed. Generate a new hash to continue."
    : "Waiting for file input...";
}

async function generateFileHash() {
  const requestId = ++fileHashRequestId;
  const file = fileHashInput.files && fileHashInput.files[0];

  // Never leave a previous file's hash available while a new request is running.
  lastFileHash = "";
  lastFileName = "";
  lastFileReport = "";

  if (!file) {
    fileHashResult.innerHTML = "⚠ Please choose a file first.";
    return;
  }

  if (!Number.isFinite(file.size) || file.size < 0 || file.size > FILE_HASH_MAX_BYTES) {
    fileHashResult.innerHTML = `⚠ File is too large or has an invalid size.<br><br><b>Maximum supported size:</b> ${formatFileSize(FILE_HASH_MAX_BYTES)}<br><b>Your file size:</b> ${formatFileSize(file.size)}<br><br>🛡️ The limit helps reduce memory pressure and browser instability, especially on mobile devices.`;
    return;
  }

  const cryptoApi = globalThis.crypto;
  if (!cryptoApi || !cryptoApi.subtle || typeof cryptoApi.subtle.digest !== "function") {
    fileHashResult.innerHTML = "❌ SHA-256 is unavailable in this browser context. Open Abudi over HTTPS or use a browser that supports Web Crypto.";
    return;
  }
  if (typeof file.arrayBuffer !== "function") {
    fileHashResult.innerHTML = "❌ This browser cannot read the selected file. Try a current browser.";
    return;
  }

  try {
    fileHashResult.innerHTML = "⏳ Generating SHA-256 locally...";
    const buffer = await file.arrayBuffer();
    if (requestId !== fileHashRequestId) return;

    const hashBuffer = await cryptoApi.subtle.digest("SHA-256", buffer);
    if (requestId !== fileHashRequestId) return;

    const hashBytes = new Uint8Array(hashBuffer);
    if (hashBytes.length !== 32) {
      throw new Error("Unexpected SHA-256 digest length");
    }
    const hashHex = Array.from(hashBytes).map(byte => byte.toString(16).padStart(2, "0")).join("");
    const securityNote = getFileSecurityNote(file);
    const fileType = file.type || "Unknown";
    const fileSizeFormatted = formatFileSize(file.size);
    const lastModified = formatDate(file.lastModified);

    lastFileHash = hashHex;
    lastFileName = file.name;
    lastFileReport = `File Hash Report
Generated: ${new Date().toLocaleString()}
File Name: ${sanitizeReportField(file.name)}
File Type: ${sanitizeReportField(fileType)}
File Size: ${fileSizeFormatted} (${file.size} bytes)
Last Modified: ${lastModified}
SHA-256: ${hashHex}

Security Notes:
- The file was processed locally in the browser.
- The file was not uploaded.
- The file was not executed.
- This tool generates a hash only; it does not claim the file is virus-free.
- Security warning: ${securityNote.title} - ${securityNote.message}`;

    fileHashResult.innerHTML = `📂 File Hash<br><br><b>File Name:</b> ${sanitize(file.name)}<br><b>File Type:</b> ${sanitize(fileType)}<br><b>File Size:</b> ${sanitize(fileSizeFormatted)} (${file.size} bytes)<br><b>Last Modified:</b> ${sanitize(lastModified)}<br><br>${securityNote.icon} <b>${sanitize(securityNote.title)}:</b> ${sanitize(securityNote.message)}<br><br>🛡️ <b>Privacy:</b> Local-only. The file is not uploaded and not executed.<br>⚠️ <b>Important:</b> Hash generated successfully, but this is not an antivirus scan and does not prove the file is safe.<br><br><b>SHA-256:</b><br><br>${codeBlock(hashHex)}`;
  } catch {
    if (requestId !== fileHashRequestId) return;
    fileHashResult.innerHTML = "❌ Failed to generate file hash. The file could not be read or the browser's cryptographic operation failed.";
    lastFileHash = "";
    lastFileName = "";
    lastFileReport = "";
  }
}

function downloadReport() {
  if (!lastFileReport || !lastFileName) {
    fileHashResult.innerHTML += "<br><br>⚠ No report to download. Generate a file hash first.";
    return;
  }

  let objectUrl = "";
  try {
    const blob = new Blob([lastFileReport], { type: "text/plain;charset=utf-8" });
    objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = `${sanitizeDownloadFileName(lastFileName)}_hash_report.txt`;
    anchor.hidden = true;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    // Delay revocation so browsers have time to begin the download.
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    fileHashResult.innerHTML += "<br><br>✅ Report download started.";
  } catch {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    fileHashResult.innerHTML += "<br><br>❌ Report download failed in this browser.";
  }
}

function clearFileHashResult() {
  invalidateFileHashRequest();
  fileHashResult.innerHTML = "Waiting for file input...";
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
passwordInput.addEventListener("input", handlePasswordInputChange);
bindClick("generatePasswordBtn", generatePassword);
bindClick("copyPasswordBtn", () => copyLogicalValue(generatedPassword, passwordGeneratorResult, "Password copied."));
bindClick("clearPasswordBtn", clearPasswordResult);
bindClick("analyzeLinkBtn", analyzeLink);
bindClick("copyLinkAnalysisBtn", () => copyLogicalValue(lastLinkAnalysisResult, linkAnalyzerResult, "Link analysis copied."));
bindClick("clearLinkAnalysisBtn", clearLinkAnalysisResult);
bindClick("generateHashBtn", generateHash);
bindClick("copyHashBtn", () => copyLogicalValue(lastHashResult, hashResult, "Hash copied."));
bindClick("clearHashBtn", clearHashResult);
hashInput.addEventListener("input", handleHashInputChange);
hashType.addEventListener("change", handleHashAlgorithmChange);
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
fileHashInput.addEventListener("change", handleFileHashSelectionChange);

initToolNavigation();
