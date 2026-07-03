(function() {
  var CONSENT_KEY = 'chinabuyhub_consent';

  function getCookie(name) {
    var match = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return match ? decodeURIComponent(match[2]) : null;
  }

  function setCookie(name, value, days) {
    var expires = days ? '; expires=' + new Date(Date.now() + days * 864e5).toUTCString() : '';
    document.cookie = name + '=' + encodeURIComponent(value) + '; path=/; SameSite=Lax' + expires;
  }

  function consentGiven() {
    var stored = localStorage.getItem(CONSENT_KEY);
    if (stored) return stored;
    stored = getCookie(CONSENT_KEY);
    if (stored) {
      localStorage.setItem(CONSENT_KEY, stored);
      return stored;
    }
    return null;
  }

  function applyConsent(mode) {
    var granted = mode === 'accepted' ? 'granted' : 'denied';
    gtag('consent', 'update', {
      'ad_storage': granted,
      'ad_user_data': granted,
      'ad_personalization': granted,
      'analytics_storage': granted
    });
    localStorage.setItem(CONSENT_KEY, mode);
    setCookie(CONSENT_KEY, mode, 365);
  }

  function showBanner() {
    var banner = document.createElement('div');
    banner.id = 'consent-banner';
    banner.innerHTML =
      '<div style="position:fixed;bottom:0;left:0;right:0;background:#1a1a2e;color:#fff;padding:18px 24px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px;z-index:999999;font-family:Arial,sans-serif;font-size:14px;border-top:2px solid #e63946;box-shadow:0 -4px 20px rgba(0,0,0,0.3)">' +
      '<span style="flex:1;min-width:220px">We use cookies to improve your experience and show personalized ads. <a href="/legal.html" style="color:#e63946;text-decoration:underline">Privacy Policy</a></span>' +
      '<div style="display:flex;gap:10px;flex-shrink:0">' +
      '<button id="consent-reject" style="background:transparent;color:#aaa;border:1px solid #444;padding:8px 18px;border-radius:4px;cursor:pointer;font-size:13px">Reject All</button>' +
      '<button id="consent-accept" style="background:#e63946;color:#fff;border:none;padding:8px 18px;border-radius:4px;cursor:pointer;font-size:13px;font-weight:bold">Accept All</button>' +
      '</div></div>';
    document.body.appendChild(banner);

    document.getElementById('consent-accept').onclick = function() {
      applyConsent('accepted');
      banner.remove();
    };
    document.getElementById('consent-reject').onclick = function() {
      applyConsent('rejected');
      banner.remove();
    };
  }

  var existing = consentGiven();
  if (existing) {
    applyConsent(existing);
  } else {
    showBanner();
  }
})();
