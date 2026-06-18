// =====================
// Abudi Cyber Tools v1.0
// =====================

// Text Analyzer
const textInput = document.getElementById("textInput");
const analyzeTextBtn = document.getElementById("analyzeTextBtn");

// Password Checker
const passwordInput = document.getElementById("passwordInput");
const checkPasswordBtn = document.getElementById("checkPasswordBtn");

// Password Generator
const generatePasswordBtn = document.getElementById("generatePasswordBtn");
const passwordLength =
document.getElementById("passwordLength");

const copyPasswordBtn =
document.getElementById("copyPasswordBtn");

const clearResultsBtn =
document.getElementById("clearResultsBtn");

let generatedPassword = "";

// Link Analyzer
const linkInput = document.getElementById("linkInput");
const analyzeLinkBtn = document.getElementById("analyzeLinkBtn");

// Results
const results = document.getElementById("results");

// =====================
// Security Function
// =====================

function sanitize(input)
{
    return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// =====================
// Text Analyzer
// =====================

analyzeTextBtn.addEventListener("click", function ()
{

    let text = textInput.value.trim();

    if (text.length > 5000)
    {
        results.innerHTML =
        "⚠ Input too large (Max 5000 characters)";
        return;
    }

    text = sanitize(text);

    const characters = text.length;

    const words =
    text === ""
    ? 0
    : text.split(/\s+/).length;

    const numbers =
    (text.match(/\d/g) || []).length;

    const symbols =
    (text.match(/[^a-zA-Z0-9\s]/g) || []).length;

    let suspiciousFound = false;

    const suspiciousPatterns =
    [
        "<script",
        "eval(",
        "document.cookie",
        "javascript:"
    ];

    for (let pattern of suspiciousPatterns)
    {
        if (
            text
            .toLowerCase()
            .includes(pattern)
        )
        {
            suspiciousFound = true;
        }
    }

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

    if (suspiciousFound)
    {
        results.innerHTML +=
        `
        <br><br>

        ⚠ Suspicious content detected
        `;
    }

});

// =====================
// Password Checker
// =====================

checkPasswordBtn.addEventListener(
"click",
function ()
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

    if (
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

    else if (
        password.length >= 6
        &&
        hasNumbers
        &&
        hasLetters
    )
    {
        strength =
        "Medium ⚠️";
    }

    results.innerHTML =
    `
    🔐 Password Strength

    <br><br>

    ${strength}
    `;

});

// =====================
// Password Generator
// =====================

generatePasswordBtn.addEventListener(
"click",
function ()
{

    const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

    let password = "";

    for (
        let i = 0;
        i < passwordLength.value
        i++
    )
    {

        const randomIndex =
        Math.floor(
            Math.random()
            *
            chars.length
        );

        password +=
        chars[randomIndex];

    }

    results.innerHTML =
    `
    🎲 Generated Password

    <br><br>

    <b>${password}</b>
    `;

});

// =====================
// Link Analyzer
// =====================

analyzeLinkBtn.addEventListener(
"click",
function ()
{

    const link =
    linkInput.value.trim();

    if (link === "")
    {
        results.innerHTML =
        "⚠ Please enter a link";

        return;
    }

    let status =
    "Safe ✅";

    const suspiciousWords =
    [
        "login",
        "verify",
        "free",
        "gift",
        "prize",
        "account",
        "update",
        "secure"
    ];

    for (
        let word
        of suspiciousWords
    )
    {

        if (
            link
            .toLowerCase()
            .includes(word)
        )
        {

            status =
            "Suspicious ⚠️";

        }

    }

    if (
        !link.startsWith("http")
    )
    {

        status =
        "Invalid Link ❌";

    }

    results.innerHTML =
    `
    🔗 Link Analysis

    <br><br>

    ${link}

    <br><br>

    Status:

    ${status}
    `;

});
copyPasswordBtn.addEventListener(
"click",
function ()
{

if (
generatedPassword === ""
)
{

results.innerHTML =
"⚠ Generate a password first";

return;

}

navigator.clipboard.writeText(
generatedPassword
);

results.innerHTML =
"✅ Password copied";

});
clearResultsBtn.addEventListener(
"click",
function ()
{

results.innerHTML =
"Waiting for analysis...";

});