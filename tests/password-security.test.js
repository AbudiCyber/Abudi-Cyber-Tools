const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const script = fs.readFileSync(path.join(root, "script.js"), "utf8");
const shell = fs.readFileSync(path.join(root, "shell-text-password-1-8-3.js"), "utf8");

assert.match(html, /<input type="password" id="passwordInput"/);
assert.match(shell, /<input type="password" id="passwordInput"/);
const generatorSource = script.slice(script.indexOf("function generatePassword()"), script.indexOf("\nfunction clearPasswordResult()"));
assert.doesNotMatch(generatorSource, /Math\.random/);
assert.match(script, /function secureRandomIndex\(max\)/);
assert.match(script, /getRandomValues/);

const dom = new JSDOM(html, { runScripts: "outside-only", url: "https://example.test/" });
const { window } = dom;
for (const id of ["passwordLength", "passwordGeneratorResult", "passwordInput", "passwordCheckerResult", "generatePasswordBtn", "checkPasswordBtn"]) {
  assert.ok(window.document.getElementById(id), "Missing DOM element: " + id);
}
let randomCalls = 0;
window.crypto.getRandomValues = array => {
  randomCalls++;
  array[0] = (randomCalls * 37) % 256;
  return array;
};
window.Math.random = () => { throw new Error("Math.random must not be used for password generation"); };
window.eval(script);
window.document.getElementById("passwordLength").value = "24";
window.document.getElementById("generatePasswordBtn").click();
const resultElement = window.document.getElementById("passwordGeneratorResult");
const result = resultElement.textContent;
assert.match(result, /Length: 24 characters/);
const password = result.split("Password:")[1].trim();
assert.equal(password.length, 24);
const passwordOutput = resultElement.querySelector("code.generated-password");
assert.ok(passwordOutput, "Generated password should use a dedicated styled code element");
assert.equal(passwordOutput.textContent, password, "Password must be inserted as text, not parsed as HTML");
assert.match(password, /[a-z]/);
assert.match(password, /[A-Z]/);
assert.match(password, /\d/);
assert.match(password, /[!@#$%^&*()_+\-=\[\]{}|;:,.<>/?]/);
assert.ok(randomCalls > 0, "Web Crypto must be used");

window.document.getElementById("passwordInput").value = "ExampleSecret123!";
window.document.getElementById("checkPasswordBtn").click();
const checkResult = window.document.getElementById("passwordCheckerResult").textContent;
assert.match(checkResult, /Strong Password/);
assert.doesNotMatch(checkResult, /ExampleSecret123!/, "Password checker output must not reveal the entered password");

dom.window.close();
console.log("Password security regression test: PASS");

// Rejection sampling must discard out-of-range bytes rather than introduce modulo bias.
let samples = [255, 7];
window.crypto.getRandomValues = array => {
  const sample = samples.shift();
  array[0] = sample;
  return array;
};
assert.equal(window.secureRandomIndex(10), 7, "Out-of-range random bytes must be rejected");

// If Web Crypto fails, generation must fail closed and expose no generated password.
const failureDom = new JSDOM(html, { runScripts: "outside-only", url: "https://example.test/" });
const failureWindow = failureDom.window;
failureWindow.crypto.getRandomValues = () => { throw new Error("CRYPTO_UNAVAILABLE"); };
failureWindow.eval(script);
failureWindow.document.getElementById("generatePasswordBtn").click();
const failureResult = failureWindow.document.getElementById("passwordGeneratorResult").textContent;
assert.match(failureResult, /Secure password generation is unavailable/);
assert.doesNotMatch(failureResult, /Password:\\s*[A-Za-z0-9!@#$%^&*()_+\\-=\\[\\]{}|;:,.<>/?]{8,}/);
assert.equal(failureWindow.generatedPassword, "", "Failed generation must clear the generated password state");
failureDom.window.close();
