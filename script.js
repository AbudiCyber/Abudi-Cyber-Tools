// =====================
// Abudi Cyber Tools v1.1
// =====================

// ===== Inputs =====

const textInput =
document.getElementById("textInput");

const passwordInput =
document.getElementById("passwordInput");

const passwordLength =
document.getElementById("passwordLength");

const linkInput =
document.getElementById("linkInput");

// ===== Buttons =====

const analyzeTextBtn =
document.getElementById("analyzeTextBtn");

const checkPasswordBtn =
document.getElementById("checkPasswordBtn");

const generatePasswordBtn =
document.getElementById("generatePasswordBtn");

const copyPasswordBtn =
document.getElementById("copyPasswordBtn");

const analyzeLinkBtn =
document.getElementById("analyzeLinkBtn");

const clearResultsBtn =
document.getElementById("clearResultsBtn");

// ===== Results =====

const results =
document.getElementById("results");

let generatedPassword = "";

// =====================
// Security
// =====================

function sanitize(input)
{
    return input
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;");
}

// =====================
// Text Analyzer
// =====================

function analyzeText()
{

    let text =
    textInput.value.trim();

    if(text.length > 5000)
    {

        results.innerHTML =
        "⚠ Max 5000 characters";

        return;

    }

    text = sanitize(text);

    const characters =
    text.length;

    const words =
    text === ""
    ? 0
    : text.split(/\s+/).length;

    const numbers =
    (text.match(/\d/g)||[]).length;

    const symbols =
    (text.match(/[^a-zA-Z0-9\s]/g)||[]).length;

    results.innerHTML =
    `
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

// =====================
// Password Checker
// =====================

function checkPassword()
{

    const password =
    passwordInput.value;

    let strength =
    "Weak ❌";

    const hasNumbers =
    /\d/.test(password);

    const hasLetters =
    /[a-zA-Z]/.test(password);

    const hasSymbols =
    /[!@#$%^&*]/.test(password);

    if(
        password.length >= 8
        &&
        hasNumbers
        &&
        hasLetters
        &&
        hasSymbols
    )
    {

        strength =
        "Strong 💪";

    }

    else if(
        password.length >= 6
        &&
        hasNumbers
        &&
        hasLetters
    )
    {

        strength =
        "Medium ⚠";

    }

    results.innerHTML =
    `
    🔐 Password Strength

    <br><br>

    ${strength}
    `;

}