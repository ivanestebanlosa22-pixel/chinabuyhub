(function () {
  'use strict';

  var STYLES_ID = 'ai-widget-styles';
  if (document.getElementById(STYLES_ID)) return;

  var styles = document.createElement('style');
  styles.id = STYLES_ID;
  styles.textContent = [
    '#ai-widget-btn{position:fixed;bottom:70px;right:20px;z-index:10000;width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#00d4ff,#0080ff);border:none;cursor:pointer;box-shadow:0 4px 20px rgba(0,180,255,0.4);display:flex;align-items:center;justify-content:center;transition:transform .2s,box-shadow .2s;color:#fff;font-size:26px}',
    '#ai-widget-btn:hover{transform:scale(1.1);box-shadow:0 6px 28px rgba(0,180,255,0.6)}',
    '#ai-widget-panel{position:fixed;bottom:135px;right:20px;z-index:10000;width:360px;max-width:calc(100vw - 40px);height:480px;max-height:calc(100vh - 160px);background:rgba(18,18,24,0.97);border:1px solid rgba(255,255,255,0.1);border-radius:16px;box-shadow:0 10px 50px rgba(0,0,0,0.5);display:none;flex-direction:column;overflow:hidden;backdrop-filter:blur(12px)}',
    '#ai-widget-header{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.08)}',
    '#ai-widget-header h3{margin:0;font-size:15px;color:#fff;font-weight:600}',
    '#ai-widget-header span{font-size:12px;color:#888}',
    '#ai-widget-close{background:none;border:none;color:#888;cursor:pointer;font-size:20px;padding:0;line-height:1;transition:color .2s}',
    '#ai-widget-close:hover{color:#fff}',
    '#ai-widget-messages{flex:1;overflow-y:auto;padding:14px 16px;display:flex;flex-direction:column;gap:8px}',
    '#ai-widget-messages::-webkit-scrollbar{width:4px}',
    '#ai-widget-messages::-webkit-scrollbar-track{background:transparent}',
    '#ai-widget-messages::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.15);border-radius:2px}',
    '.ai-msg{max-width:85%;padding:10px 14px;border-radius:14px;font-size:13px;line-height:1.5;animation:fadeIn .3s}',
    '.ai-msg.bot{background:rgba(0,180,255,0.12);color:#d0d0e0;align-self:flex-start;border-bottom-left-radius:4px}',
    '.ai-msg.user{background:linear-gradient(135deg,#00d4ff,#0080ff);color:#fff;align-self:flex-end;border-bottom-right-radius:4px}',
    '#ai-widget-input{display:flex;align-items:center;gap:8px;padding:10px 14px;border-top:1px solid rgba(255,255,255,0.08)}',
    '#ai-widget-input input{flex:1;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 14px;font-size:13px;color:#fff;outline:none;transition:border-color .2s}',
    '#ai-widget-input input::placeholder{color:#666}',
    '#ai-widget-input input:focus{border-color:#00d4ff}',
    '#ai-widget-input button{background:linear-gradient(135deg,#00d4ff,#0080ff);border:none;border-radius:10px;width:38px;height:38px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:opacity .2s;flex-shrink:0}',
    '#ai-widget-input button:disabled{opacity:0.4;cursor:not-allowed}',
    '#ai-widget-input button svg{fill:#fff;width:16px;height:16px}',
    '.ai-typing{display:flex;gap:4px;padding:12px 16px;align-items:center}',
    '.ai-typing span{width:6px;height:6px;border-radius:50%;background:#888;animation:aiBounce 1.4s infinite}',
    '.ai-typing span:nth-child(2){animation-delay:.2s}',
    '.ai-typing span:nth-child(3){animation-delay:.4s}',
    '@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}',
    '@keyframes aiBounce{0%,80%,100%{opacity:.3;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}',
    '@media(max-width:480px){#ai-widget-panel{right:10px;bottom:120px;width:calc(100vw - 20px);height:calc(100vh - 150px)}#ai-widget-btn{right:12px;bottom:60px;width:48px;height:48px;font-size:22px}}'
  ].join('');
  document.head.appendChild(styles);

  var chatHistory = [];
  var btn = document.createElement('button');
  btn.id = 'ai-widget-btn';
  btn.setAttribute('aria-label', 'Open AI chat');
  btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';

  var panel = document.createElement('div');
  panel.id = 'ai-widget-panel';
  panel.innerHTML = [
    '<div id="ai-widget-header">',
    '<div><h3>ChinaBuyHub Assistant</h3><span>AI • EN/ES</span></div>',
    '<button id="ai-widget-close" aria-label="Close chat">&times;</button>',
    '</div>',
    '<div id="ai-widget-messages">',
    '<div class="ai-msg bot">Hi! I\'m the ChinaBuyHub assistant. I can help you with questions about Chinese shopping agents, how to buy from China, and guide you through the site. I speak English and Spanish — just ask in whichever you prefer! \uD83D\uDE0A</div>',
    '</div>',
    '<div id="ai-widget-input">',
    '<input id="ai-widget-input-field" type="text" placeholder="Type your message..." autocomplete="off">',
    '<button id="ai-widget-send" aria-label="Send message" disabled>',
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>',
    '</button>',
    '</div>'
  ].join('');

  document.body.appendChild(btn);
  document.body.appendChild(panel);

  var msgContainer = document.getElementById('ai-widget-messages');
  var inputField = document.getElementById('ai-widget-input-field');
  var sendBtn = document.getElementById('ai-widget-send');

  function addMessage(text, role) {
    var div = document.createElement('div');
    div.className = 'ai-msg ' + role;
    div.textContent = text;
    msgContainer.appendChild(div);
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }

  function showTyping() {
    var div = document.createElement('div');
    div.className = 'ai-msg bot ai-typing';
    div.id = 'ai-typing-indicator';
    div.innerHTML = '<span></span><span></span><span></span>';
    msgContainer.appendChild(div);
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }

  function hideTyping() {
    var el = document.getElementById('ai-typing-indicator');
    if (el) el.remove();
  }

  function setLoading(state) {
    sendBtn.disabled = state;
    inputField.disabled = state;
  }

  async function sendMessage(text) {
    addMessage(text, 'user');
    inputField.value = '';
    setLoading(true);
    showTyping();

    try {
      var res = await fetch('/chat.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: chatHistory })
      });
      if (!res.ok) {
        var errText = await res.text();
        console.error('Chat error:', res.status, errText);
        hideTyping();
        addMessage('Server error (' + res.status + '). Try again.', 'bot');
        setLoading(false);
        return;
      }
      var data = await res.json();
      hideTyping();
      if (data.reply) {
        chatHistory = data.history || [];
        addMessage(data.reply, 'bot');
      } else {
        addMessage('Sorry, there was an error. Try again.', 'bot');
      }
    } catch (e) {
      hideTyping();
      console.error('Fetch error:', e);
      addMessage('Network error — are you testing locally? You need to upload the files to Hostinger for this to work, or have PHP running locally.', 'bot');
    }

    setLoading(false);
  }

  function togglePanel(show) {
    panel.style.display = show ? 'flex' : 'none';
    btn.style.display = show ? 'none' : 'flex';
    if (show) inputField.focus();
  }

  btn.addEventListener('click', function () { togglePanel(true); });
  document.getElementById('ai-widget-close').addEventListener('click', function () { togglePanel(false); });

  sendBtn.addEventListener('click', function () {
    var text = inputField.value.trim();
    if (text) sendMessage(text);
  });

  inputField.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      var text = inputField.value.trim();
      if (text) sendMessage(text);
    }
  });

  inputField.addEventListener('input', function () {
    sendBtn.disabled = !inputField.value.trim();
  });
})();
