// Abudi Domain Extractor Errors v1.9
(() => {
  "use strict";

  const STARTUP_ERROR_MESSAGES = Object.freeze({
    DOM_NOT_READY: "Required page elements are unavailable.",
    DOMAIN_ERRORS_NOT_READY: "The startup error module is unavailable.",
    DOMAIN_EXTRACTOR_NOT_READY: "The domain extraction engine is unavailable.",
    DOMAIN_UI_NOT_READY: "The result formatting module is unavailable.",
    DOMAIN_ACTIONS_NOT_READY: "The user action module is unavailable."
  });

  function getStartupErrorMessage(error) {
    const errorCode =
      error instanceof Error && error.message
        ? error.message
        : "UNKNOWN_STARTUP_ERROR";

    return (
      STARTUP_ERROR_MESSAGES[errorCode] ||
      `A required module failed to load: ${errorCode}`
    );
  }

  window.AbudiDomainErrors = Object.freeze({
    version: "1.9.1",
    getStartupErrorMessage
  });
})();
