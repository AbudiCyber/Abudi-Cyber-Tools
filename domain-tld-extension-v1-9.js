// Abudi Domain TLD Extension v1.9
(() => {
  "use strict";

  function getTLD(input) {
    const service = window.AbudiPublicSuffixService;
    if (!service) throw new Error("PUBLIC_SUFFIX_SERVICE_NOT_READY");
    return service.getTLD(input);
  }

  window.AbudiDomainTLD = Object.freeze({
    version: "1.9.4",
    getTLD
  });
})();
