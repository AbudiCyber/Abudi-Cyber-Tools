// Abudi Domain Extractor Smoke Test v1.0
(() => {
  "use strict";

  const assert = (condition, message) => {
    if (!condition) {
      throw new Error("SMOKE_TEST_FAILED: " + message);
    }
  };

  const result = window.AbudiDomainExtractor.extractDomain(
    "https://sub.example.com:8443/path/to?q=1#top"
  );

  assert(result.protocol === "https", "protocol");
  assert(result.hostname === "sub.example.com", "hostname");
  assert(result.port === "8443", "port");
  assert(result.path === "/path/to", "path");
  assert(result.query === "?q=1", "query");
  assert(result.fragment === "#top", "fragment");

  const validation =
    window.AbudiDomainValidationService.validateInput("example.com/path?x=1#top");

  assert(validation.valid === true, "valid input accepted");

  const invalid =
    window.AbudiDomainValidationService.validateInput("");

  assert(invalid.valid === false, "empty input rejected");

  window.AbudiDomainRuntime.validate();
  window.AbudiDomainActions.bindAllActions();

  const { input, result: resultElement, analyzeButton, copyButton, clearButton } =
    window.AbudiDomainDOM.getElements();

  assert(input && resultElement && analyzeButton && copyButton && clearButton, "DOM elements");
  assert(typeof analyzeButton.onclick === "function", "analyze handler bound");
  assert(typeof copyButton.onclick === "function", "copy handler bound");
  assert(typeof clearButton.onclick === "function", "clear handler bound");

  input.value = "example.com/path?x=1#top";
  analyzeButton.onclick();

  const output = resultElement.textContent;
  assert(output.includes("Protocol: https"), "analyze protocol output");
  assert(output.includes("Hostname: example.com"), "analyze hostname output");
  assert(output.includes("Path: /path"), "analyze path output");
  assert(output.includes("Query: ?x=1"), "analyze query output");
  assert(output.includes("Fragment: #top"), "analyze fragment output");
  assert(output.includes("Origin: https://example.com"), "origin output");
  assert(output.includes("Secure: Yes"), "secure output");
  assert(output.includes("TLD: com"), "TLD output");
  assert(output.includes("Subdomain: none"), "subdomain output");

  clearButton.onclick();

  assert(input.value === "", "clear input");
  assert(resultElement.textContent === "Waiting for domain input...", "clear result");

  window.AbudiDomainSmokeTest = Object.freeze({
    version: "1.0.0",
    run() {
      return "PASS";
    }
  });
})();
