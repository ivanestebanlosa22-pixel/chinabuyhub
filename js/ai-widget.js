(function () {
  'use strict';

  var GROQ_API_KEY = '';
  var GROQ_MODEL   = 'llama-3.1-8b-instant';
  var GROQ_SYSTEM  = 'You are the ChinaBuyHub assistant. ChinaBuyHub specializes in Chinese shopping agents (USFans code RCGD5Y, Kakobuy code FINDSES, LitBuy code YBMHFG55L, Sugargoo, Pandabuy) and buying via Taobao, Weidian and 1688. Help users choose agents, understand costs (product + shipping + taxes), find products, and navigate the buying process. Respond in the same language the user uses (English or Spanish). Be concise, practical and honest.';

  var STYLES_ID = 'ai-widget-styles';
  if (document.getElementById(STYLES_ID)) return;

  var styles = document.createElement('style');
  styles.id = STYLES_ID;
  styles.textContent = [
    '#ai-widget-btn{position:fixed;bottom:70px;right:20px;z-index:10000;width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#ff006e,#b8004a);border:none;cursor:pointer;box-shadow:0 4px 24px rgba(255,0,110,0.5);display:flex;align-items:center;justify-content:center;transition:transform .2s,box-shadow .2s;color:#fff}',
    '#ai-widget-btn:hover{transform:scale(1.1);box-shadow:0 6px 32px rgba(255,0,110,0.75)}',
    '#ai-widget-btn::after{content:"";position:absolute;inset:-4px;border-radius:50%;border:2px solid rgba(0,212,255,0.5);animation:aiPulseRing 2.2s ease-out infinite;pointer-events:none}',
    '#ai-widget-badge{position:absolute;top:-1px;right:-1px;width:18px;height:18px;border-radius:50%;background:#ff006e;border:2px solid #0d0d14;font-size:10px;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700}',
    '#ai-widget-bubble{position:fixed;bottom:142px;right:20px;z-index:9999;background:rgba(13,13,24,0.97);border:1px solid rgba(255,0,110,0.3);border-radius:14px 14px 4px 14px;padding:11px 16px;max-width:230px;font-size:13px;color:#e0ddd5;box-shadow:0 4px 24px rgba(0,0,0,0.45);animation:bubbleIn .35s ease;cursor:pointer;backdrop-filter:blur(12px)}',
    '#ai-widget-bubble strong{color:#ff006e}',
    '#ai-widget-panel{position:fixed;bottom:142px;right:20px;z-index:10000;width:375px;max-width:calc(100vw - 40px);height:510px;max-height:calc(100vh - 160px);background:rgba(10,10,10,0.97);border:1px solid rgba(255,0,110,0.15);border-radius:18px;box-shadow:0 12px 60px rgba(0,0,0,0.65);display:none;flex-direction:column;overflow:hidden;backdrop-filter:blur(18px)}',
    '#ai-widget-header{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.07);background:linear-gradient(135deg,rgba(255,0,110,0.1),rgba(0,212,255,0.06))}',
    '#ai-widget-header-info{display:flex;align-items:center;gap:10px}',
    '#ai-widget-avatar{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#ff006e,#00d4ff);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}',
    '#ai-widget-header h3{margin:0;font-size:14px;color:#fff;font-weight:700}',
    '#ai-widget-status{font-size:11px;color:#00d4ff;display:flex;align-items:center;gap:4px}',
    '#ai-widget-close{background:none;border:none;color:#555;cursor:pointer;font-size:20px;padding:4px 8px;line-height:1;transition:color .2s;border-radius:6px}',
    '#ai-widget-close:hover{color:#fff;background:rgba(255,255,255,0.08)}',
    '#ai-widget-messages{flex:1;overflow-y:auto;padding:14px 16px;display:flex;flex-direction:column;gap:8px}',
    '#ai-widget-messages::-webkit-scrollbar{width:4px}',
    '#ai-widget-messages::-webkit-scrollbar-thumb{background:rgba(255,0,110,0.25);border-radius:2px}',
    '.ai-msg{max-width:87%;padding:10px 14px;border-radius:14px;font-size:13px;line-height:1.58;animation:fadeIn .25s ease}',
    '.ai-msg.bot{background:rgba(255,255,255,0.05);color:#e0ddd5;align-self:flex-start;border-bottom-left-radius:4px;border:1px solid rgba(255,255,255,0.1)}',
    '.ai-msg.user{background:linear-gradient(135deg,#ff006e,#b8004a);color:#fff;align-self:flex-end;border-bottom-right-radius:4px}',
    '#ai-suggestions{display:flex;flex-wrap:wrap;gap:6px;padding:0 16px 10px}',
    '.ai-sug{background:rgba(255,0,110,0.08);border:1px solid rgba(255,0,110,0.22);color:#ff006e;border-radius:20px;padding:5px 12px;font-size:11.5px;cursor:pointer;transition:background .18s;white-space:nowrap}',
    '.ai-sug:hover{background:rgba(255,0,110,0.16);border-color:rgba(255,0,110,0.4)}',
    '#ai-widget-input{display:flex;align-items:center;gap:8px;padding:10px 14px;border-top:1px solid rgba(255,255,255,0.07)}',
    '#ai-widget-input input{flex:1;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 14px;font-size:13px;color:#fff;outline:none;transition:border-color .2s;font-family:inherit}',
    '#ai-widget-input input::placeholder{color:#666}',
    '#ai-widget-input input:focus{border-color:rgba(255,0,110,0.45)}',
    '#ai-send-btn{background:linear-gradient(135deg,#ff006e,#b8004a);border:none;border-radius:10px;width:38px;height:38px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:opacity .2s;flex-shrink:0}',
    '#ai-send-btn:disabled{opacity:0.3;cursor:not-allowed}',
    '#ai-send-btn svg{fill:#fff;width:16px;height:16px}',
    '#ai-widget-privacy{padding:7px 14px;font-size:10.5px;color:#7d756c;border-top:1px solid rgba(255,255,255,0.05);line-height:1.45;text-align:center;background:rgba(0,0,0,0.2)}',
    '#ai-widget-privacy a{color:#00d4ff;text-decoration:none}',
    '#ai-widget-privacy a:hover{text-decoration:underline}',
    '.ai-typing{display:flex;gap:4px;padding:12px 16px;align-items:center}',
    '.ai-typing span{width:7px;height:7px;border-radius:50%;background:rgba(0,212,255,0.5);animation:aiBounce 1.4s infinite}',
    '.ai-typing span:nth-child(2){animation-delay:.22s}',
    '.ai-typing span:nth-child(3){animation-delay:.44s}',
    '@keyframes fadeIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}',
    '@keyframes aiBounce{0%,80%,100%{opacity:.25;transform:scale(.75)}40%{opacity:1;transform:scale(1)}}',
    '@keyframes aiPulseRing{0%{transform:scale(1);opacity:.7}70%{transform:scale(1.55);opacity:0}100%{transform:scale(1.55);opacity:0}}',
    '@keyframes bubbleIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}',
    '@media(max-width:480px){#ai-widget-panel{right:10px;bottom:118px;width:calc(100vw - 20px);height:calc(100vh - 148px)}#ai-widget-btn{right:14px;bottom:58px;width:54px;height:54px}#ai-widget-bubble{right:10px;bottom:124px;max-width:calc(100vw - 80px)}}'
  ].join('');
  document.head.appendChild(styles);

  var chatHistory = [];
  var panelOpen = false;

  /* ---- Floating button ---- */
  var btn = document.createElement('button');
  btn.id = 'ai-widget-btn';
  btn.setAttribute('aria-label', 'Open AI assistant');
  btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';

  var badge = document.createElement('span');
  badge.id = 'ai-widget-badge';
  badge.textContent = '1';
  btn.appendChild(badge);
  document.body.appendChild(btn);

  /* ---- Welcome bubble ---- */
  var bubble = document.createElement('div');
  bubble.id = 'ai-widget-bubble';
  bubble.innerHTML = '<strong>ChinaBuyHub AI</strong><br>Which agent is best for you? Ask me!';
  document.body.appendChild(bubble);

  /* ---- Chat panel ---- */
  var panel = document.createElement('div');
  panel.id = 'ai-widget-panel';
  panel.innerHTML =
    '<div id="ai-widget-header">' +
      '<div id="ai-widget-header-info">' +
        '<div id="ai-widget-avatar">&#x1F916;</div>' +
        '<div>' +
          '<h3>ChinaBuyHub AI</h3>' +
          '<div id="ai-widget-status">Online</div>' +
        '</div>' +
      '</div>' +
      '<button id="ai-widget-close" aria-label="Close">&times;</button>' +
    '</div>' +
    '<div id="ai-widget-messages"></div>' +
    '<div id="ai-suggestions">' +
      '<span class="ai-sug">Best agent for beginners?</span>' +
      '<span class="ai-sug">USFans vs Kakobuy</span>' +
      '<span class="ai-sug">How do I buy on Taobao?</span>' +
      '<span class="ai-sug">Calculate shipping cost</span>' +
    '</div>' +
    '<div id="ai-widget-input">' +
      '<input type="text" placeholder="Ask me anything..." autocomplete="off" />' +
      '<button id="ai-send-btn" aria-label="Send">' +
        '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>' +
      '</button>' +
    '</div>' +
    '<div id="ai-widget-privacy">Responses are generated by a third-party AI (Groq). Your messages are sent to process your request and are not used to identify you. See our <a href="/legal" target="_blank" rel="noopener">Privacy Policy</a>.</div>';
  document.body.appendChild(panel);

  var messagesEl   = document.getElementById('ai-widget-messages');
  var inputEl      = panel.querySelector('input');
  var sendBtn      = document.getElementById('ai-send-btn');
  var closeBtn     = document.getElementById('ai-widget-close');
  var sugContainer = document.getElementById('ai-suggestions');

  /* ---- Open / close ---- */
  function openPanel() {
    panelOpen = true;
    panel.style.display = 'flex';
    bubble.style.display = 'none';
    if (badge) badge.style.display = 'none';
    if (chatHistory.length === 0) {
      addBotMsg('Hi! I am the ChinaBuyHub assistant. I can help you choose the best Chinese shopping agent, calculate costs and guide you through the buying process. What can I help you with?');
    }
    setTimeout(function() { inputEl.focus(); }, 100);
  }

  function closePanel() {
    panelOpen = false;
    panel.style.display = 'none';
  }

  btn.addEventListener('click', function() {
    if (panelOpen) { closePanel(); } else { openPanel(); }
  });

  closeBtn.addEventListener('click', closePanel);

  bubble.addEventListener('click', openPanel);

  /* ---- Suggestions ---- */
  sugContainer.addEventListener('click', function(e) {
    var sug = e.target.closest('.ai-sug');
    if (!sug) return;
    inputEl.value = sug.textContent;
    sugContainer.style.display = 'none';
    send();
  });

  /* ---- Messages ---- */
  function addMsg(text, cls) {
    var div = document.createElement('div');
    div.className = 'ai-msg ' + cls;
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }
  function addBotMsg(t) { return addMsg(t, 'bot'); }
  function addUserMsg(t) { return addMsg(t, 'user'); }

  function showTyping() {
    var el = document.createElement('div');
    el.className = 'ai-typing';
    el.id = 'ai-typing-indicator';
    el.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function removeTyping() {
    var el = document.getElementById('ai-typing-indicator');
    if (el) el.parentNode.removeChild(el);
  }

  /* ---- Send ---- */
  function send() {
    var text = inputEl.value.trim();
    if (!text) return;
    sugContainer.style.display = 'none';
    addUserMsg(text);
    chatHistory.push({ role: 'user', content: text });
    inputEl.value = '';
    inputEl.disabled = true;
    sendBtn.disabled = true;
    showTyping();

    callChatPHP().catch(function() {
      if (GROQ_API_KEY) return callGroqDirect();
      throw new Error('no api');
    }).then(function(reply) {
      removeTyping();
      chatHistory.push({ role: 'assistant', content: reply });
      addBotMsg(reply);
    }).catch(function() {
      removeTyping();
      addBotMsg('Sorry, I cannot respond right now. Please try again later.');
    }).then(function() {
      inputEl.disabled = false;
      sendBtn.disabled = false;
      inputEl.focus();
    });
  }

  function callChatPHP() {
    return fetch('/chat.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: chatHistory.slice(-10), system: GROQ_SYSTEM })
    }).then(function(res) {
      if (!res.ok) throw new Error('http ' + res.status);
      return res.json();
    }).then(function(data) {
      if (data.error) throw new Error(data.error);
      var r = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
      if (!r) throw new Error('empty');
      return r;
    });
  }

  function callGroqDirect() {
    var msgs = [{ role: 'system', content: GROQ_SYSTEM }].concat(chatHistory.slice(-10));
    return fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + GROQ_API_KEY },
      body: JSON.stringify({ model: GROQ_MODEL, messages: msgs, max_tokens: 500, temperature: 0.7 })
    }).then(function(res) {
      if (!res.ok) throw new Error('groq ' + res.status);
      return res.json();
    }).then(function(data) {
      var r = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
      if (!r) throw new Error('empty');
      return r;
    });
  }

  sendBtn.addEventListener('click', send);

  inputEl.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  });

  /* ---- Auto-hide bubble ---- */
  setTimeout(function() {
    if (!panelOpen && bubble.parentNode) {
      bubble.style.transition = 'opacity 0.5s';
      bubble.style.opacity = '0';
      setTimeout(function() { if (!panelOpen) bubble.style.display = 'none'; }, 500);
    }
  }, 6000);


})();