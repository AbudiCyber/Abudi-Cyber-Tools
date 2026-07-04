// Abudi Cyber Tools - كامل السيكربت (مُصحح بالكامل)

// ===== Inputs =====
const textInput = document.getElementById("textInput");
const passwordInput = document.getElementById("passwordInput");
const passwordLength = document.getElementById("passwordLength");
const linkInput = document.getElementById("linkInput");
const hashInput = document.getElementById("hashInput");
const hashType = document.getElementById("hashType");
const generateHashBtn = document.getElementById("generateHashBtn");
const base64Input = document.getElementById("base64Input");
const encodeBtn = document.getElementById("encodeBtn");
const decodeBtn = document.getElementById("decodeBtn");
const base64Result = document.getElementById("base64Result");
const copyBase64Btn = document.getElementById("copyBase64Btn");
const clearBase64Btn = document.getElementById("clearBase64Btn");
const emailInput = document.getElementById("emailInput");
const validateEmailBtn = document.getElementById("validateEmailBtn");
const urlParserInput = document.getElementById("urlParserInput");
const parseUrlBtn = document.getElementById("parseUrlBtn");
const fileHashInput = document.getElementById("fileHashInput");
const generateFileHashBtn = document.getElementById("generateFileHashBtn");
const fileHashResult = document.getElementById("fileHashResult");
const copyFileHashBtn = document.getElementById("copyFileHashBtn");
const downloadReportBtn = document.getElementById("downloadReportBtn");
const clearFileHashBtn = document.getElementById("clearFileHashBtn");

// ===== Buttons =====
const analyzeTextBtn = document.getElementById("analyzeTextBtn");
const checkPasswordBtn = document.getElementById("checkPasswordBtn");
const generatePasswordBtn = document.getElementById("generatePasswordBtn");
const copyPasswordBtn = document.getElementById("copyPasswordBtn");
const analyzeLinkBtn = document.getElementById("analyzeLinkBtn");
const clearResultsBtn = document.getElementById("clearResultsBtn");

// ===== Results =====
const results = document.getElementById("results");
let generatedPassword = "";
let lastFileHash = "";
let lastFileName = "";
let lastBase64Result = "";

// ===== Helpers =====
function sanitize(input) {
  return input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
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

// ===== Text Analyzer =====
function analyzeText() {
  let text = textInput.value.trim();
  if (text.length > 5000) {
    results.innerHTML = "⚠ Max 5000 characters";
    return;
  }
  text = sanitize(text);
  const characters = text.length;
  const words = text === "" ? 0 : text.split(/\s+/).length;
  const numbers = (text.match(/\d/g) || []).length;
  const symbols = (text.match(/[^a-zA-Z0-9\s]/g) || []).length;
  results.innerHTML = `
    📝 Text Analysis
    <br><br>
    Characters: ${characters}
    <br>
    Words: ${words}
    <br>
    Numbers: ${numbers}
    <br>
    Symbols: ${symbols}
  `;
}

// ===== Password Checker =====
function checkPassword() {
  const password = passwordInput.value;
  let strength = "Weak ❌";
  const hasNumbers = /\d/.test(password);
  const hasLetters = /[a-zA-Z]/.test(password);
  const hasSymbols = /[!@#$%^&*()_\-+={}\[\]|;:'",.<>/?`~]/.test(password);
  if (password.length >= 8 && hasNumbers && hasLetters && hasSymbols) {
    strength = "Strong 💪";
  } else if (password.length >= 6 && hasNumbers && hasLetters) {
    strength = "Medium ⚠";
  }
  results.innerHTML = `
    🔐 Password Strength
    <br><br>
    ${strength}
  `;
}

// ===== Password Generator =====
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
  results.innerHTML = `
    🎲 Generated Password
    <br><br>
    <code style="user-select: all; background:#0b1220; padding:6px; display:inline-block; border-radius:6px;">${generatedPassword}</code>
  `;
}

// ===== Copy Password =====
async function copyPassword() {
  if (!generatedPassword) {
    const maybe = passwordInput.value.trim();
    if (maybe) {
      generatedPassword = maybe;
    } else {
      results.innerHTML = "⚠ No password to copy";
      return;
    }
  }
  try {
    await navigator.clipboard.writeText(generatedPassword);
    results.innerHTML = "✅ Password copied to clipboard";
  } catch (e) {
    const ta = document.createElement("textarea");
    ta.value = generatedPassword;
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      results.innerHTML = "✅ Password copied (fallback)";
    } catch (err) {
      results.innerHTML = "❌ Copy failed";
    }
    ta.remove();
  }
}

// ===== Link Analyzer =====
function analyzeLink() {
    const url = linkInput.value.trim();
    if (!url) {
        results.innerHTML = "⚠ Enter a URL";
        return;
    }
    try {
        const parsed = new URL(url.startsWith("http") ? url : "https://" + url);
        results.innerHTML = `
            🔗 Link Analysis
            <br><br>
            Host: ${parsed.host}
            <br>
            Protocol: ${parsed.protocol}
            <br>
            Path: ${parsed.pathname}
        `;
    } catch (e) {
        results.innerHTML = "❌ Invalid URL";
    }
}

// ===== Hash Generator =====
async function generateHash() {
    const text = hashInput.value.trim();
    if (!text) {
        results.innerHTML = "⚠ Enter text to hash";
        return;
    }
    const algorithm = hashType.value;
    try {
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        const hashBuffer = await crypto.subtle.digest(algorithm, data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        results.innerHTML = `
            🔑 Hash Generated (${algorithm})
            <br><br>
            <code style="user-select: all; background:#0b1220; padding:8px 12px; display:inline-block; border-radius:6px; word-break:break-all; max-width:100%;">${hashHex}</code>
        `;
    } catch (e) {
        results.innerHTML = "❌ Hash generation failed";
    }
}

// ===== Base64 Encoder Pro =====
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

// ===== Base64 Decoder Pro =====
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

// ===== Copy Base64 Result =====
async function copyBase64Result() {
    if (!lastBase64Result) {
        base64Result.innerHTML = "⚠ No Base64 result to copy.";
        return;
    }
    try {
        await navigator.clipboard.writeText(lastBase64Result);
        base64Result.innerHTML += "<br><br>✅ Base64 result copied.";
    } catch {
        const ta = document.createElement("textarea");
        ta.value = lastBase64Result;
        document.body.appendChild(ta);
        ta.select();
        try {
            document.execCommand("copy");
            base64Result.innerHTML += "<br><br>✅ Base64 result copied (fallback).";
        } catch {
            base64Result.innerHTML += "<br><br>❌ Copy failed.";
        }
        ta.remove();
    }
}

// ===== Clear Base64 Result =====
function clearBase64Result() {
    base64Result.innerHTML = "Waiting for Base64 input...";
    base64Input.value = "";
    lastBase64Result = "";
}

// ===== Email Validator =====
function validateEmail() {
    const email = emailInput.value.trim();
    if (email === "") {
        results.innerHTML = "⚠ Please enter an email address";
        return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(email)) {
        results.innerHTML = `
            Email Validation
            <br><br>
            Valid Email Address
        `;
    } else {
        results.innerHTML = `
            Email Validation
            <br><br>
            Invalid Email Address
        `;
    }
}

// ===== URL Parser =====
function parseURL() {
    const input = urlParserInput.value.trim();
    if (input === "") {
        results.innerHTML = "⚠ Please enter a URL";
        return;
    }
    try {
        const url = new URL(input);
        results.innerHTML = `
            🌍 URL Analysis
            <br><br>
            <b>Protocol:</b> ${url.protocol}
            <br>
            <b>Hostname:</b> ${url.hostname}
            <br>
            <b>Port:</b> ${url.port || "Default"}
            <br>
            <b>Path:</b> ${url.pathname}
            <br>
            <b>Query:</b> ${url.search || "None"}
            <br>
            <b>Fragment:</b> ${url.hash || "None"}
        `;
    } catch {
        results.innerHTML = "❌ Invalid URL";
    }
}

// ===== File Hash Checker Pro =====
async function generateFileHash() {
    const file = fileHashInput.files[0];
    if (!file) {
        fileHashResult.innerHTML = "⚠ Please choose a file.";
        lastFileHash = "";
        lastFileName = "";
        return;
    }
    try {
        const buffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
        
        lastFileHash = hashHex;
        lastFileName = file.name;
        
        const fileType = file.type || "Unknown";
        const fileSizeBytes = file.size;
        const fileSizeFormatted = formatFileSize(fileSizeBytes);
        const lastModified = formatDate(file.lastModified);
        
        fileHashResult.innerHTML = `
            📂 File Hash
            <br><br>
            <b>File Name:</b> ${file.name}
            <br>
            <b>File Type:</b> ${fileType}
            <br>
            <b>File Size:</b> ${fileSizeFormatted} (${fileSizeBytes} bytes)
            <br>
            <b>Last Modified:</b> ${lastModified}
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
    }
}

// ===== Copy File Hash =====
async function copyFileHash() {
    if (!lastFileHash) {
        fileHashResult.innerHTML = "⚠ No hash to copy. Generate a file hash first.";
        return;
    }
    try {
        await navigator.clipboard.writeText(lastFileHash);
        fileHashResult.innerHTML = "✅ SHA-256 copied to clipboard!";
    } catch (e) {
        const ta = document.createElement("textarea");
        ta.value = lastFileHash;
        document.body.appendChild(ta);
        ta.select();
        try {
            document.execCommand("copy");
            fileHashResult.innerHTML = "✅ SHA-256 copied (fallback)!";
        } catch (err) {
            fileHashResult.innerHTML = "❌ Copy failed";
        }
        ta.remove();
    }
}

// ===== Download Report =====
function downloadReport() {
    if (!lastFileHash || !lastFileName) {
        fileHashResult.innerHTML = "⚠ No hash to download. Generate a file hash first.";
        return;
    }
    const reportContent = `
=== File Hash Report ===
Generated: ${new Date().toLocaleString()}

File Name: ${lastFileName}
SHA-256: ${lastFileHash}
    `;
    const blob = new Blob([reportContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${lastFileName}_hash_report.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    fileHashResult.innerHTML = "✅ Report downloaded successfully!";
}

// ===== Clear File Hash Result =====
function clearFileHashResult() {
    fileHashResult.innerHTML = "Waiting for file analysis...";
    lastFileHash = "";
    lastFileName = "";
    fileHashInput.value = "";
}

// ===== Clear Results =====
function clearResults() {
  results.innerHTML = "Waiting for analysis...";
}

// ===== Event Listeners =====
analyzeTextBtn.addEventListener("click", analyzeText);
checkPasswordBtn.addEventListener("click", checkPassword);
generatePasswordBtn.addEventListener("click", generatePassword);
copyPasswordBtn.addEventListener("click", copyPassword);
analyzeLinkBtn.addEventListener("click", analyzeLink);
generateHashBtn.addEventListener("click", generateHash);
encodeBtn.addEventListener("click", encodeBase64);
decodeBtn.addEventListener("click", decodeBase64);
copyBase64Btn.addEventListener("click", copyBase64Result);
clearBase64Btn.addEventListener("click", clearBase64Result);
validateEmailBtn.addEventListener("click", validateEmail);
parseUrlBtn.addEventListener("click", parseURL);
generateFileHashBtn.addEventListener("click", generateFileHash);
copyFileHashBtn.addEventListener("click", copyFileHash);
downloadReportBtn.addEventListener("click", downloadReport);
clearFileHashBtn.addEventListener("click", clearFileHashResult);
clearResultsBtn.addEventListener("click", clearResults);
