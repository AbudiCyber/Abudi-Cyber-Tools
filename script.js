// Abudi Cyber Tools - Browser-only tool logic

// ===== Inputs =====
const textInput = document.getElementById("textInput");
const textAnalyzerResult = document.getElementById("textAnalyzerResult");
const passwordInput = document.getElementById("passwordInput");
const passwordCheckerResult = document.getElementById("passwordCheckerResult");
const passwordLength = document.getElementById("passwordLength");
const passwordGeneratorResult = document.getElementById("passwordGeneratorResult");
const linkInput = document.getElementById("linkInput");
const linkAnalyzerResult = document.getElementById("linkAnalyzerResult");
const hashInput = document.getElementById("hashInput");
const hashType = document.getElementById("hashType");
const hashResult = document.getElementById("hashResult");
const base64Input = document.getElementById("base64Input");
const base64Result = document.getElementById("base64Result");
const emailInput = document.getElementById("emailInput");
const emailResult = document.getElementById("emailResult");
const urlParserInput = document.getElementById("urlParserInput");
const urlParserResult = document.getElementById("urlParserResult");
const fileHashInput = document.getElementById("fileHashInput");
const fileHashResult = document.getElementById("fileHashResult");

// ===== Buttons =====
const analyzeTextBtn = document.getElementById("analyzeTextBtn");
const copyTextAnalysisBtn = document.getElementById("copyTextAnalysisBtn");
const clearTextAnalysisBtn = document.getElementById("clearTextAnalysisBtn");
const checkPasswordBtn = document.getElementById("checkPasswordBtn");
const copyPasswordCheckBtn = document.getElementById("copyPasswordCheckBtn");
const clearPasswordCheckBtn = document.getElementById("clearPasswordCheckBtn");
const generatePasswordBtn = document.getElementById("generatePasswordBtn");
const copyPasswordBtn = document.getElementById("copyPasswordBtn");
const clearPasswordBtn = document.getElementById("clearPasswordBtn");
const analyzeLinkBtn = document.getElementById("analyzeLinkBtn");
const copyLinkAnalysisBtn = document.getElementById("copyLinkAnalysisBtn");
const clearLinkAnalysisBtn = document.getElementById("clearLinkAnalysisBtn");
const generateHashBtn = document.getElementById("generateHashBtn");
const copyHashBtn = document.getElementById("copyHashBtn");
const clearHashBtn = document.getElementById("clearHashBtn");
const encodeBtn = document.getElementById("encodeBtn");
const decodeBtn = document.getElementById("decodeBtn");
const copyBase64Btn = document.getElementById("copyBase64Btn");
const clearBase64Btn = document.getElementById("clearBase64Btn");
const validateEmailBtn = document.getElementById("validateEmailBtn");
const copyEmailBtn = document.getElementById("copyEmailBtn");
const clearEmailBtn = document.getElementById("clearEmailBtn");
const parseUrlBtn = document.getElementById("parseUrlBtn");
const copyUrlParserBtn = document.getElementById("copyUrlParserBtn");
const clearUrlParserBtn = document.getElementById("clearUrlParserBtn");
const generateFileHashBtn = document.getElementById("generateFileHashBtn");
const copyFileHashBtn = document.getElementById("copyFileHashBtn");
const downloadReportBtn = document.getElementById("downloadReportBtn");
const clearFileHashBtn = document.getElementById("clearFileHashBtn");

// ===== Stored logical copy values =====
let lastTextAnalysisResult = "";
let generatedPassword = "";
let lastPasswordCheckResult = "";
let lastLinkAnalysisResult = "";
let lastHashResult = "";
let lastFileHash = "";
let lastFileName = "";
let lastBase64Result = "";
let lastUrlParserResult = "";
let lastEmailResult = "";
let lastFileReport = "";

// ===== Helpers =====
function sanitize(input) {
  return String(input).replace(/</g, "&lt;").replace(/>/g, "&gt;");
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
  bytes.forEach(byte => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function decodeUnicodeBase64(base64Text) {
  const binary = atob(base64Text);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
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
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }
  ta.remove();
  return copied;
}

async function copyLogicalValue(value, resultBox, successMessage) {
  if (!resultBox) return;
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

function bindClick(element, handler) {
  if (element) element.addEventListener("click", handler);
}

// ===== Text Analyzer Pro =====
function analyzeText() {
  const rawText = textInput.value.trim();

  if (!rawText) {
    textAnalyzerResult.innerHTML = "⚠ Enter text to analyze.";
    lastTextAnalysisResult = "";
    return;
  }

  if (rawText.length > 5000) {
    textAnalyzerResult.innerHTML = "⚠ Max 5000 characters.";
    lastTextAnalysisResult = "";
    return;
  }

  const characters = rawText.length;
  const words = rawText === "" ? 0 : rawText.split(/\s+/).length;
  const numbers = (rawText.match(/\d/g) || []).length;
  const symbols = (rawText.match(/[^\p{L}\p{N}\s]/gu) || []).length;
  const lines = rawText.split(/\r\n|\r|\n/).length;
  const spaces = (rawText.match(/\s/g) || []).length;

  lastTextAnalysisResult =
`Text Analysis
Characters: ${characters}
Words: ${words}
Numbers: ${numbers}
Symbols: ${symbols}
Lines: ${lines}
Spaces: ${spaces}`;

  textAnalyzerResult.innerHTML = `
    📝 Text Analysis
    <br><br>
    <b>Characters:</b> ${characters}
    <br>
    <b>Words:</b> ${words}
    <br>
    <b>Numbers:</b> ${numbers}
    <br>
    <b>Symbols:</b> ${symbols}
    <br>
    <b>Lines:</b> ${lines}
    <br>
    <b>Spaces:</b> ${spaces}
  `;
}

async function copyTextAnalysisResult() {
  await copyLogicalValue(lastTextAnalysisResult, textAnalyzerResult, "Text analysis copied.");
}

function clearTextAnalysisResult() {
  textInput.value = "";
  textAnalyzerResult.innerHTML = "Waiting for text analysis...";
  lastTextAnalysisResult = "";
}

// ===== Password Checker Pro =====
function checkPassword() {
  const password = passwordInput.value;

  if (!password) {
    passwordCheckerResult.innerHTML = "⚠ Enter a password to check.";
    lastPasswordCheckResult = "";
    return;
  }

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSymbols = /[!@#$%^&*()_\-+={}\[\]|;:'",.<>/?`~]/.test(password);
  const longEnough = password.length >= 8;

  let score = 0;
  if (longEnough) score++;
  if (hasLower) score++;
  if (hasUpper) score++;
  if (hasNumbers) score++;
  if (hasSymbols) score++;

  let status = "❌ Weak Password";
  let advice = "Use at least 8 characters with uppercase, lowercase, numbers, and symbols.";

  if (score >= 5) {
    status = "✅ Strong Password";
    advice = "Good structure. This password uses all main complexity categories.";
  } else if (score >= 3) {
    status = "⚠ Medium Password";
    advice = "Better than weak, but add more length or more character types.";
  }

  lastPasswordCheckResult =
`Password Strength
Status: ${status}
Length: ${password.length} characters
Lowercase letters: ${hasLower ? "Yes" : "No"}
Uppercase letters: ${hasUpper ? "Yes" : "No"}
Numbers: ${hasNumbers ? "Yes" : "No"}
Symbols: ${hasSymbols ? "Yes" : "No"}
Advice: ${advice}`;

  passwordCheckerResult.innerHTML = `
    🔐 Password Strength
    <br><br>
    <b>Status:</b> ${status}
    <br>
    <b>Length:</b> ${password.length} characters
    <br><br>
    <b>Checks:</b>
    <br>
    ${longEnough ? "✅" : "❌"} 8+ characters
    <br>
    ${hasLower ? "✅" : "❌"} Lowercase letters
    <br>
    ${hasUpper ? "✅" : "❌"} Uppercase letters
    <br>
    ${hasNumbers ? "✅" : "❌"} Numbers
    <br>
    ${hasSymbols ? "✅" : "❌"} Symbols
    <br><br>
    <b>Advice:</b> ${sanitize(advice)}
  `;
}

async function copyPasswordCheckResult() {
  await copyLogicalValue(lastPasswordCheckResult, passwordCheckerResult, "Password check result copied.");
}

function clearPasswordCheckResult() {
  passwordInput.value = "";
  passwordCheckerResult.innerHTML = "Waiting for password check...";
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
  let pass = "";
  pass += lower[Math.floor(Math.random() * lower.length)];
  pass += upper[Math.floor(Math.random() * upper.length)];
  pass += numbers[Math.floor(Math.random() * numbers.length)];
  pass += symbols[Math.floor(Math.random() * symbols.length)];
  for (let i = pass.length; i < len; i++) {
    pass += all[Math.floor(Math.random() * all.length)];
  }
  generatedPassword = pass.split("").sort(() => 0.5 - Math.random()).join("");
  passwordGeneratorResult.innerHTML = `
    🎲 Generated Password
    <br><br>
    <b>Length:</b> ${len} characters
    <br>
    <b>Contains:</b> Uppercase, lowercase, numbers, symbols
    <br><br>
    <b>Password:</b>
    <br><br>
    <code style="user-select:all; word-break:break-all; background:#0b1220; padding:8px 12px; display:inline-block; border-radius:6px; max-width:100%;">
        ${sanitize(generatedPassword)}
    </code>
  `;
}

async function copyPassword() {
  await copyLogicalValue(generatedPassword, passwordGeneratorResult, "Password copied.");
}

function clearPasswordResult() {
  generatedPassword = "";
  passwordGeneratorResult.innerHTML = "Waiting for password generation...";
}

// ===== Link Analyzer Pro =====
function analyzeLink() {
  const input = linkInput.value.trim();

  if (!input) {
    linkAnalyzerResult.innerHTML = "⚠ Enter a URL or domain to analyze.";
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

    lastLinkAnalysisResult =
`Link Analysis
Status: ${riskLevel}
Original Input: ${input}
Normalized URL: ${parsed.href}
Protocol: ${protocol}
Hostname: ${hostname}
Path: ${path}
Query: ${query}
HTTPS: ${isHttps ? "Yes" : "No"}
Suspicious Keyword: ${hasSuspiciousKeyword ? "Yes" : "No"}
@ Symbol: ${hasAtSymbol ? "Yes" : "No"}
Long Hostname: ${hasLongHost ? "Yes" : "No"}
Many Subdomains: ${hasManySubdomains ? "Yes" : "No"}
Advice: ${advice}`;

    linkAnalyzerResult.innerHTML = `
      🔗 Link Analysis
      <br><br>
      <b>Status:</b> ${riskLevel}
      <br>
      <b>Original Input:</b> ${sanitize(input)}
      <br>
      <b>Normalized URL:</b> ${sanitize(parsed.href)}
      <br>
      <b>Protocol:</b> ${sanitize(protocol)}
      <br>
      <b>Hostname:</b> ${sanitize(hostname)}
      <br>
      <b>Path:</b> ${sanitize(path)}
      <br>
      <b>Query:</b> ${sanitize(query)}
      <br><br>
      <b>Checks:</b>
      <br>
      ${isHttps ? "✅" : "❌"} HTTPS
      <br>
      ${hasSuspiciousKeyword ? "⚠" : "✅"} Suspicious keywords
      <br>
      ${hasAtSymbol ? "⚠" : "✅"} @ symbol check
      <br>
      ${hasLongHost ? "⚠" : "✅"} Hostname length
      <br>
      ${hasManySubdomains ? "⚠" : "✅"} Subdomain count
      <br><br>
      <b>Advice:</b> ${sanitize(advice)}
    `;
  } catch {
    linkAnalyzerResult.innerHTML = "❌ Invalid URL or domain.";
    lastLinkAnalysisResult = "";
  }
}

async function copyLinkAnalysisResult() {
  await copyLogicalValue(lastLinkAnalysisResult, linkAnalyzerResult, "Link analysis copied.");
}

function clearLinkAnalysisResult() {
  linkInput.value = "";
  linkAnalyzerResult.innerHTML = "Waiting for link analysis...";
  lastLinkAnalysisResult = "";
}

// ===== Hash Generator Pro =====
async function generateHash() {
  const text = hashInput.value.trim();
  if (!text) {
    hashResult.innerHTML = "⚠ Enter text to hash.";
    lastHashResult = "";
    return;
  }
  const algorithm = hashType.value;
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest(algorithm, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    lastHashResult = hashHex;
    hashResult.innerHTML = `
      🔐 Hash Generated
      <br><br>
      <b>Algorithm:</b> ${sanitize(algorithm)}
      <br>
      <b>Input Length:</b> ${text.length} characters
      <br><br>
      <b>Hash:</b>
      <br><br>
      <code style="user-select:all; word-break:break-all; background:#0b1220; padding:8px 12px; display:inline-block; border-radius:6px; max-width:100%;">
          ${hashHex}
      </code>
    `;
  } catch {
    hashResult.innerHTML = "❌ Hash generation failed.";
    lastHashResult = "";
  }
}

async function copyHashResult() {
  await copyLogicalValue(lastHashResult, hashResult, "Hash copied.");
}

function clearHashResult() {
  hashInput.value = "";
  hashResult.innerHTML = "Waiting for hash generation...";
  lastHashResult = "";
}

// ===== Base64 Encoder / Decoder Pro =====
function encodeBase64() {
  const text = base64Input.value.trim();
  if (!text) {
    base64Result.innerHTML = "⚠ Enter text to encode.";
    lastBase64Result = "";
    return;
  }
  try {
    const encoded = encodeUnicodeBase64(text);
    lastBase64Result = encoded;
    base64Result.innerHTML = `
      🔢 Base64 Encoded
      <br><br>
      <code style="user-select:all; word-break:break-all; background:#0b1220; padding:8px 12px; display:inline-block; border-radius:6px; max-width:100%;">
          ${sanitize(encoded)}
      </code>
    `;
  } catch {
    base64Result.innerHTML = "❌ Failed to encode Base64.";
    lastBase64Result = "";
  }
}

function decodeBase64() {
  const text = base64Input.value.trim();
  if (!text) {
    base64Result.innerHTML = "⚠ Enter Base64 text to decode.";
    lastBase64Result = "";
    return;
  }
  try {
    const decoded = decodeUnicodeBase64(text);
    lastBase64Result = decoded;
    base64Result.innerHTML = `
      🔓 Base64 Decoded
      <br><br>
      <code style="user-select:all; white-space:pre-wrap; word-break:break-word; background:#0b1220; padding:8px 12px; display:inline-block; border-radius:6px; max-width:100%;">
          ${sanitize(decoded)}
      </code>
    `;
  } catch {
    base64Result.innerHTML = "❌ Invalid Base64.";
    lastBase64Result = "";
  }
}

async function copyBase64Result() {
  await copyLogicalValue(lastBase64Result, base64Result, "Base64 result copied.");
}

function clearBase64Result() {
  base64Result.innerHTML = "Waiting for Base64 input...";
  base64Input.value = "";
  lastBase64Result = "";
}

// ===== Email Validator Pro =====
function validateEmail() {
  const email = emailInput.value.trim();
  if (email === "") {
    emailResult.innerHTML = "⚠ Please enter an email address.";
    lastEmailResult = "";
    return;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email);
  const status = isValid ? "Valid Email Address" : "Invalid Email Address";
  const icon = isValid ? "✅" : "❌";
  lastEmailResult = `${email} - ${status}`;
  emailResult.innerHTML = `
    📧 Email Validation
    <br><br>
    <b>Email:</b> ${sanitize(email)}
    <br><br>
    ${icon} <b>${status}</b>
  `;
}

async function copyEmailResult() {
  await copyLogicalValue(lastEmailResult, emailResult, "Email result copied.");
}

function clearEmailResult() {
  emailInput.value = "";
  emailResult.innerHTML = "Waiting for email validation...";
  lastEmailResult = "";
}

// ===== URL Parser Pro =====
function parseURL() {
  const input = urlParserInput.value.trim();
  if (input === "") {
    urlParserResult.innerHTML = "⚠ Please enter a URL.";
    lastUrlParserResult = "";
    return;
  }
  try {
    const normalizedInput = input.startsWith("http://") || input.startsWith("https://") ? input : "https://" + input;
    const url = new URL(normalizedInput);
    const port = url.port || "Default";
    const query = url.search || "None";
    const fragment = url.hash || "None";

    lastUrlParserResult = `URL Analysis
Original Input: ${input}
Normalized URL: ${url.href}
Protocol: ${url.protocol}
Hostname: ${url.hostname}
Port: ${port}
Path: ${url.pathname}
Query: ${query}
Fragment: ${fragment}`;

    urlParserResult.innerHTML = `
      🌍 URL Analysis
      <br><br>
      <b>Original Input:</b> ${sanitize(input)}
      <br>
      <b>Normalized URL:</b> ${sanitize(url.href)}
      <br>
      <b>Protocol:</b> ${sanitize(url.protocol)}
      <br>
      <b>Hostname:</b> ${sanitize(url.hostname)}
      <br>
      <b>Port:</b> ${sanitize(port)}
      <br>
      <b>Path:</b> ${sanitize(url.pathname)}
      <br>
      <b>Query:</b> ${sanitize(query)}
      <br>
      <b>Fragment:</b> ${sanitize(fragment)}
    `;
  } catch {
    urlParserResult.innerHTML = "❌ Invalid URL.";
    lastUrlParserResult = "";
  }
}

async function copyUrlParserResult() {
  await copyLogicalValue(lastUrlParserResult, urlParserResult, "URL analysis copied.");
}

function clearUrlParserResult() {
  urlParserInput.value = "";
  urlParserResult.innerHTML = "Waiting for URL analysis...";
  lastUrlParserResult = "";
}

// ===== File Hash Checker Pro - v1.8.3 Security Polish =====
const FILE_HASH_MAX_BYTES = 100 * 1024 * 1024;
const RISKY_FILE_EXTENSIONS = new Set([
  "exe", "msi", "apk", "bat", "cmd", "sh", "ps1", "vbs", "js", "jar", "scr", "com", "dll", "deb", "rpm", "dmg", "pkg", "app", "run"
]);

function getFileExtension(fileName) {
  const name = String(fileName || "").toLowerCase();
  const dotIndex = name.lastIndexOf(".");
  if (dotIndex === -1 || dotIndex === name.length - 1) return "";
  return name.slice(dotIndex + 1);
}

function getFileSecurityNote(file) {
  const extension = getFileExtension(file.name);
  const isRisky = RISKY_FILE_EXTENSIONS.has(extension);
  if (isRisky) {
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

async function generateFileHash() {
  const file = fileHashInput.files[0];
  if (!file) {
    fileHashResult.innerHTML = "⚠ Please choose a file.";
    lastFileHash = "";
    lastFileName = "";
    lastFileReport = "";
    return;
  }

  if (file.size > FILE_HASH_MAX_BYTES) {
    fileHashResult.innerHTML = `
      ⚠ File is too large.
      <br><br>
      <b>Maximum supported size:</b> ${formatFileSize(FILE_HASH_MAX_BYTES)}
      <br>
      <b>Your file size:</b> ${formatFileSize(file.size)}
      <br><br>
      🛡️ Size limits prevent browser freezing and keep the tool stable on mobile.
    `;
    lastFileHash = "";
    lastFileName = "";
    lastFileReport = "";
    return;
  }

  try {
    fileHashResult.innerHTML = "⏳ Generating SHA-256 locally...";

    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    const securityNote = getFileSecurityNote(file);

    lastFileHash = hashHex;
    lastFileName = file.name;
    const fileType = file.type || "Unknown";
    const fileSizeBytes = file.size;
    const fileSizeFormatted = formatFileSize(fileSizeBytes);
    const lastModified = formatDate(file.lastModified);

    lastFileReport = `File Hash Report
Generated: ${new Date().toLocaleString()}
File Name: ${file.name}
File Type: ${fileType}
File Size: ${fileSizeFormatted} (${fileSizeBytes} bytes)
Last Modified: ${lastModified}
SHA-256: ${hashHex}

Security Notes:
- The file was processed locally in the browser.
- The file was not uploaded.
- The file was not executed.
- This tool generates a hash only; it does not claim the file is virus-free.
- Security warning: ${securityNote.title} - ${securityNote.message}`;

    fileHashResult.innerHTML = `
      📂 File Hash
      <br><br>
      <b>File Name:</b> ${sanitize(file.name)}
      <br>
      <b>File Type:</b> ${sanitize(fileType)}
      <br>
      <b>File Size:</b> ${sanitize(fileSizeFormatted)} (${fileSizeBytes} bytes)
      <br>
      <b>Last Modified:</b> ${sanitize(lastModified)}
      <br><br>
      ${securityNote.icon} <b>${sanitize(securityNote.title)}:</b> ${sanitize(securityNote.message)}
      <br><br>
      🛡️ <b>Privacy:</b> Local-only. The file is not uploaded and not executed.
      <br>
      ⚠️ <b>Important:</b> Hash generated successfully, but this is not an antivirus scan and does not prove the file is safe.
      <br><br>
      <b>SHA-256:</b>
      <br><br>
      <code style="user-select:all; word-break:break-all; background:#0b1220; padding:8px 12px; display:inline-block; border-radius:6px; max-width:100%;">
        ${hashHex}
      </code>
    `;
  } catch {
    fileHashResult.innerHTML = "❌ Failed to generate file hash.";
    lastFileHash = "";
    lastFileName = "";
    lastFileReport = "";
  }
}

async function copyFileHash() {
  await copyLogicalValue(lastFileHash, fileHashResult, "SHA-256 copied.");
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
  fileHashResult.innerHTML += "<br><br>✅ Report downloaded successfully!";
}

function clearFileHashResult() {
  fileHashResult.innerHTML = "Waiting for file input...";
  lastFileHash = "";
  lastFileName = "";
  lastFileReport = "";
  fileHashInput.value = "";
}

// ===== Event Listeners =====
bindClick(analyzeTextBtn, analyzeText);
bindClick(copyTextAnalysisBtn, copyTextAnalysisResult);
bindClick(clearTextAnalysisBtn, clearTextAnalysisResult);
bindClick(checkPasswordBtn, checkPassword);
bindClick(copyPasswordCheckBtn, copyPasswordCheckResult);
bindClick(clearPasswordCheckBtn, clearPasswordCheckResult);
bindClick(generatePasswordBtn, generatePassword);
bindClick(copyPasswordBtn, copyPassword);
bindClick(clearPasswordBtn, clearPasswordResult);
bindClick(analyzeLinkBtn, analyzeLink);
bindClick(copyLinkAnalysisBtn, copyLinkAnalysisResult);
bindClick(clearLinkAnalysisBtn, clearLinkAnalysisResult);
bindClick(generateHashBtn, generateHash);
bindClick(copyHashBtn, copyHashResult);
bindClick(clearHashBtn, clearHashResult);
bindClick(encodeBtn, encodeBase64);
bindClick(decodeBtn, decodeBase64);
bindClick(copyBase64Btn, copyBase64Result);
bindClick(clearBase64Btn, clearBase64Result);
bindClick(validateEmailBtn, validateEmail);
bindClick(copyEmailBtn, copyEmailResult);
bindClick(clearEmailBtn, clearEmailResult);
bindClick(parseUrlBtn, parseURL);
bindClick(copyUrlParserBtn, copyUrlParserResult);
bindClick(clearUrlParserBtn, clearUrlParserResult);
bindClick(generateFileHashBtn, generateFileHash);
bindClick(copyFileHashBtn, copyFileHash);
bindClick(downloadReportBtn, downloadReport);
bindClick(clearFileHashBtn, clearFileHashResult);
