// v1.8.3 text and password cards
(function(){
const mount=document.getElementById('toolMount');
mount.insertAdjacentHTML('beforeend', `
<div class="category-title" data-category-title="text">📝 Text Tools</div>
<div class="card tool-card" data-category="text" data-tool="text analyzer text analysis words characters symbols lines spaces">
<h2>📝 Text Analyzer Pro</h2>
<textarea id="textInput" placeholder="Enter text here..."></textarea>
<button id="analyzeTextBtn">Analyze Text</button>
<div id="textAnalyzerResult" class="tool-result">Waiting for text input...</div>
<div class="tool-actions"><button id="copyTextAnalysisBtn" class="action-btn copy-btn">📋 Copy Result</button><button id="clearTextAnalysisBtn" class="action-btn clear-btn">🧹 Clear Result</button></div>
</div>
<div class="card tool-card" data-category="text" data-tool="base64 encoder decoder encode decode text unicode">
<h2>🔢 Base64 Encoder / Decoder Pro</h2>
<textarea id="base64Input" placeholder="Enter text..."></textarea>
<button id="encodeBtn">Encode Base64</button><br><br><button id="decodeBtn">Decode Base64</button>
<div id="base64Result" class="tool-result">Waiting for Base64 input...</div>
<div class="tool-actions"><button id="copyBase64Btn" class="action-btn copy-btn">📋 Copy Result</button><button id="clearBase64Btn" class="action-btn clear-btn">🧹 Clear Result</button></div>
</div>
<div class="category-title" data-category-title="password">🔐 Password Tools</div>
<div class="card tool-card" data-category="password" data-tool="password checker strength weak medium strong security">
<h2>🔐 Password Checker Pro</h2>
<input type="text" id="passwordInput" placeholder="Enter password">
<button id="checkPasswordBtn">Check Password</button>
<div id="passwordCheckerResult" class="tool-result">Waiting for password input...</div>
<div class="tool-actions"><button id="copyPasswordCheckBtn" class="action-btn copy-btn">📋 Copy Result</button><button id="clearPasswordCheckBtn" class="action-btn clear-btn">🧹 Clear Result</button></div>
</div>
<div class="card tool-card" data-category="password" data-tool="password generator random generate symbols numbers uppercase lowercase">
<h2>🎲 Password Generator Pro</h2>
<select id="passwordLength"><option value="8">8</option><option value="12" selected>12</option><option value="16">16</option><option value="20">20</option><option value="24">24</option></select>
<button id="generatePasswordBtn">Generate Password</button>
<div id="passwordGeneratorResult" class="tool-result">Waiting for password generation...</div>
<div class="tool-actions"><button id="copyPasswordBtn" class="action-btn copy-btn">📋 Copy Password</button><button id="clearPasswordBtn" class="action-btn clear-btn">🧹 Clear Result</button></div>
</div>`);
})();
