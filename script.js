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
const emailInput = document.getElementById("emailInput");
const validateEmailBtn = document.getElementById("validateEmailBtn");
const urlParserInput = document.getElementById("urlParserInput");
const parseUrlBtn = document.getElementById("parseUrlBtn");

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

// ===== Helpers =====
function sanitize(input) {
  return input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
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
  // Ensure at least one of each category for better strength
  pass += lower[Math.floor(Math.random() * lower.length)];
  pass += upper[Math.floor(Math.random() * upper.length)];
  pass += numbers[Math.floor(Math.random() * numbers.length)];
  pass += symbols[Math.floor(Math.random() * symbols.length)];
  for (let i = pass.length; i < len; i++) {
    pass += all[Math.floor(Math.random() * all.length)];
  }
  // shuffle
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
    // if no generated, try copy from input if any
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
    // fallback
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

// ===== Base64 Encoder =====
function encodeBase64() {
    const text = base64Input.value.trim();
    if (!text) {
        results.innerHTML = "⚠ Enter text";
        return;
    }
    const encoded = btoa(text);
    results.innerHTML = `
        Base64 Encoded
        <br><br>
        ${encoded}
    `;
}

// ===== Base64 Decoder =====
function decodeBase64() {
    const text = base64Input.value.trim();
    if (!text) {
        results.innerHTML = "⚠ Enter Base64";
        return;
    }
    try {
        const decoded = atob(text);
        results.innerHTML = `
            Base64 Decoded
            <br><br>
            ${decoded}
        `;
    } catch {
        results.innerHTML = "❌ Invalid Base64";
    }
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
validateEmailBtn.addEventListener("click", validateEmail);
parseUrlBtn.addEventListener("click", parseURL);
clearResultsBtn.addEventListener("click", clearResults);