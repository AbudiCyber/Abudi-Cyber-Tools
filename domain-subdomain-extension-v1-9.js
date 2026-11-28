// Abudi Domain Subdomain Extension v1.9
(() => {
  "use strict";

  function getSubdomain(input) {
    const service = window.AbudiPublicSuffixService;
    if (!service) throw new Error("PUBLIC_SUFFIX_SERVICE_NOT_READY");
    return service.getSubdomain(input);
  }

  window.AbudiDomainSubdomain = Object.freeze({
    version: "1.9.4",
    getSubdomain
  });
})();
