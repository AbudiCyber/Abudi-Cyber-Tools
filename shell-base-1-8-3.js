// v1.8.3 app shell base
(function(){
  document.body.innerHTML = `
<div class="container">
<h1>🛡️ Abudi Cyber Tools</h1>
<p>Simple Cyber Security Tools</p>
<div class="platform-panel">
<div class="tool-counter">🧰 11 Tools Available</div>
<div class="tool-note">Privacy-first • Runs in your browser • Mobile-friendly</div>
<div class="tool-search-row">
<input type="search" id="toolSearch" class="tool-search" placeholder="Search tools... example: hash, password, url, ip, encode">
<button id="clearToolSearch" class="clear-tool-search" type="button" hidden>Clear</button>
</div>
<div class="category-pills" aria-label="Tool categories">
<button type="button" class="category-pill active" data-filter="all">All</button>
<button type="button" class="category-pill" data-filter="text">Text</button>
<button type="button" class="category-pill" data-filter="password">Password</button>
<button type="button" class="category-pill" data-filter="web">Web / URL</button>
<button type="button" class="category-pill" data-filter="hash">Hash</button>
<button type="button" class="category-pill" data-filter="validation">Validation</button>
</div>
<div id="toolSearchStatus" class="tool-search-status">Showing all tools.</div>
<div id="noToolsFound" class="no-tools-found tool-hidden">🔎 No tools found. Try another keyword.</div>
</div>
<div id="toolMount"></div>
<footer class="site-footer"><div class="footer-brand">🛡️ Abudi</div><div class="footer-made">Built with 💖 in Iraq 🇮🇶</div><div class="footer-note">Privacy-first browser tools</div></footer>
</div>`;
})();
