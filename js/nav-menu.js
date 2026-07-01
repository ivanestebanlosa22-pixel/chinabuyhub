(function () {
    'use strict';

    function whenReady(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    var CSS = [
        '@keyframes navSlideIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}',
        '@keyframes navPulse{0%,100%{box-shadow:0 0 0 0 rgba(0,212,255,0.4)}50%{box-shadow:0 0 0 8px rgba(0,212,255,0)}}',
        '@keyframes navShimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}',
        '@keyframes navGlow{0%,100%{filter:drop-shadow(0 0 4px rgba(0,212,255,0.3))}50%{filter:drop-shadow(0 0 8px rgba(255,0,110,0.4))}}',

        /* Overlay */
        '#navOverlay{position:fixed;top:0;left:0;width:100%;height:100%;',
        'background:rgba(0,0,0,0.7);backdrop-filter:blur(12px) saturate(180%);',
        '-webkit-backdrop-filter:blur(12px) saturate(180%);z-index:9998;',
        'opacity:0;visibility:hidden;transition:opacity 0.4s cubic-bezier(0.4,0,0.2,1),visibility 0.4s}',
        '#navOverlay.active{opacity:1;visibility:visible}',

        /* Panel */
        '#navPanel{position:fixed;top:0;right:-440px;width:420px;max-width:92vw;height:100vh;',
        'background:linear-gradient(180deg,rgba(14,14,18,0.995) 0%,rgba(8,8,12,0.998) 100%);',
        'backdrop-filter:blur(40px) saturate(200%);-webkit-backdrop-filter:blur(40px) saturate(200%);',
        'border-left:1px solid rgba(255,255,255,0.06);z-index:9999;',
        'transition:right 0.45s cubic-bezier(0.32,0.72,0,1);',
        'display:flex;flex-direction:column;overflow:hidden;',
        'box-shadow:-20px 0 80px rgba(0,0,0,0.8),-2px 0 20px rgba(0,212,255,0.03)}',
        '#navPanel.active{right:0}',

        /* Header */
        '#navPanelHeader{display:flex;align-items:center;justify-content:space-between;',
        'padding:20px 24px;border-bottom:1px solid rgba(255,255,255,0.06);flex-shrink:0;',
        'background:rgba(255,255,255,0.02)}',
        '.nav-logo-wrap{display:flex;align-items:center;gap:12px}',
        '.nav-logo-icon{width:36px;height:36px;border-radius:10px;',
        'background:linear-gradient(135deg,#00d4ff,#ff006e);display:flex;',
        'align-items:center;justify-content:center;font-size:1.1rem;font-weight:900;',
        'color:#fff;box-shadow:0 4px 15px rgba(0,212,255,0.3);animation:navGlow 3s ease infinite}',
        '.nav-logo-text{font-size:1.15rem;font-weight:800;',
        'background:linear-gradient(135deg,#00d4ff,#ff006e);',
        '-webkit-background-clip:text;-webkit-text-fill-color:transparent;',
        'background-clip:text;letter-spacing:-0.3px}',
        '.nav-logo-badge{font-size:0.55rem;padding:2px 6px;border-radius:4px;',
        'background:linear-gradient(135deg,#ff006e,#ff6b35);color:#fff;',
        'font-weight:700;letter-spacing:0.5px;text-transform:uppercase}',
        '#navPanelClose{width:38px;height:38px;border-radius:10px;',
        'border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.03);',
        'color:rgba(255,255,255,0.6);font-size:1.2rem;cursor:pointer;display:flex;',
        'align-items:center;justify-content:center;transition:all 0.3s cubic-bezier(0.4,0,0.2,1);',
        'flex-shrink:0;position:relative;overflow:hidden}',
        '#navPanelClose::before{content:"";position:absolute;inset:0;',
        'background:linear-gradient(135deg,rgba(255,0,110,0.2),rgba(0,212,255,0.2));',
        'opacity:0;transition:opacity 0.3s}',
        '#navPanelClose:hover{border-color:rgba(255,0,110,0.4);transform:rotate(90deg) scale(1.05)}',
        '#navPanelClose:hover::before{opacity:1}',
        '#navPanelClose svg{width:18px;height:18px;position:relative;z-index:1}',

        /* Scroll area */
        '#navPanelScroll{flex:1;overflow-y:auto;overflow-x:hidden;padding:12px 20px 24px;',
        'scrollbar-width:thin;scrollbar-color:rgba(255,255,255,0.08) transparent}',
        '#navPanelScroll::-webkit-scrollbar{width:3px}',
        '#navPanelScroll::-webkit-scrollbar-track{background:transparent}',
        '#navPanelScroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:10px}',

        /* Sections */
        '.nav-section{margin-bottom:8px;animation:navSlideIn 0.4s ease both}',
        '.nav-section:nth-child(2){animation-delay:0.05s}',
        '.nav-section:nth-child(3){animation-delay:0.1s}',
        '.nav-section:nth-child(4){animation-delay:0.15s}',
        '.nav-section:nth-child(5){animation-delay:0.2s}',
        '.nav-section:nth-child(6){animation-delay:0.25s}',
        '.nav-section:nth-child(7){animation-delay:0.3s}',
        '.nav-section:nth-child(8){animation-delay:0.35s}',
        '.nav-section-title{font-size:0.65rem;text-transform:uppercase;letter-spacing:0.18em;',
        'color:rgba(255,255,255,0.3);margin-bottom:8px;padding:8px 12px 6px;font-weight:700;',
        'display:flex;align-items:center;gap:10px}',
        '.nav-section-title::before{content:"";width:3px;height:3px;border-radius:50%;',
        'background:linear-gradient(135deg,#00d4ff,#ff006e);flex-shrink:0}',
        '.nav-section-title::after{content:"";flex:1;height:1px;',
        'background:linear-gradient(90deg,rgba(255,255,255,0.08),transparent)}',
        '.nav-section-links{display:flex;flex-direction:column;gap:2px}',

        /* Links */
        '.nav-link{display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:12px;',
        'color:rgba(255,255,255,0.7);text-decoration:none;font-size:0.88rem;font-weight:500;',
        'transition:all 0.25s cubic-bezier(0.4,0,0.2,1);position:relative;overflow:hidden}',
        '.nav-link::before{content:"";position:absolute;left:0;top:0;width:0;height:100%;',
        'background:linear-gradient(90deg,rgba(0,212,255,0.08),transparent);',
        'transition:width 0.3s cubic-bezier(0.4,0,0.2,1);border-radius:12px}',
        '.nav-link:hover{color:#fff;transform:translateX(6px)}',
        '.nav-link:hover::before{width:100%}',
        '.nav-link.active{background:linear-gradient(135deg,rgba(0,212,255,0.1),rgba(255,0,110,0.06));',
        'color:#fff;font-weight:600}',
        '.nav-link.active::before{width:100%;background:linear-gradient(90deg,rgba(0,212,255,0.12),transparent)}',
        '.nav-link.active::after{content:"";position:absolute;left:0;top:50%;',
        'transform:translateY(-50%);width:3px;height:18px;',
        'background:linear-gradient(180deg,#00d4ff,#ff006e);border-radius:0 4px 4px 0;',
        'box-shadow:0 0 8px rgba(0,212,255,0.4)}',
        '.nav-link-icon{font-size:1rem;width:24px;height:24px;display:flex;',
        'align-items:center;justify-content:center;border-radius:8px;',
        'background:rgba(255,255,255,0.04);flex-shrink:0;transition:all 0.25s}',
        '.nav-link:hover .nav-link-icon{background:rgba(0,212,255,0.1);transform:scale(1.1)}',
        '.nav-link-label{flex:1;line-height:1.3}',
        '.nav-link-sub{font-size:0.7rem;color:rgba(255,255,255,0.35);font-weight:400}',
        '.nav-link:hover .nav-link-sub{color:rgba(255,255,255,0.6)}',
        '.nav-link-badge{font-size:0.6rem;padding:3px 8px;border-radius:6px;',
        'background:linear-gradient(135deg,#ff006e,#ff6b35);color:#fff;',
        'font-weight:700;letter-spacing:0.3px;flex-shrink:0;text-transform:uppercase}',
        '.nav-link-badge.green{background:linear-gradient(135deg,#00c853,#00e676)}',
        '.nav-link-badge.blue{background:linear-gradient(135deg,#00d4ff,#0091ea)}',
        '.nav-link-badge.gold{background:linear-gradient(135deg,#ffd700,#ff8c00);color:#000}',
        '.nav-link-badge.pink{background:linear-gradient(135deg,#ff006e,#ff6b35)}',

        /* Divider */
        '.nav-divider{height:1px;margin:12px 0;',
        'background:linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)}',

        /* Promo banner */
        '.nav-promo{margin:8px 0 16px;padding:16px;border-radius:14px;',
        'background:linear-gradient(135deg,rgba(255,107,53,0.12),rgba(255,140,0,0.08));',
        'border:1px solid rgba(255,107,53,0.2);position:relative;overflow:hidden}',
        '.nav-promo::before{content:"";position:absolute;top:-50%;left:-50%;width:200%;height:200%;',
        'background:linear-gradient(45deg,transparent,rgba(255,255,255,0.03),transparent);',
        'transform:rotate(45deg);animation:navShimmer 4s infinite}',
        '.nav-promo-title{font-size:0.75rem;font-weight:700;color:#ff8c00;',
        'margin-bottom:4px;letter-spacing:0.5px;text-transform:uppercase}',
        '.nav-promo-text{font-size:0.82rem;color:rgba(255,255,255,0.7);line-height:1.4}',
        '.nav-promo-amount{font-size:1.4rem;font-weight:900;',
        'background:linear-gradient(135deg,#ffd700,#ff8c00);',
        '-webkit-background-clip:text;-webkit-text-fill-color:transparent;',
        'background-clip:text;margin:6px 0 10px}',
        '.nav-promo-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;',
        'border-radius:8px;background:linear-gradient(135deg,#ff6b35,#ff8c00);',
        'color:#000;font-size:0.78rem;font-weight:700;text-decoration:none;',
        'transition:all 0.25s;box-shadow:0 4px 12px rgba(255,107,53,0.3)}',
        '.nav-promo-btn:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(255,107,53,0.5)}',

        /* Footer area */
        '.nav-footer{padding:16px 24px;border-top:1px solid rgba(255,255,255,0.06);',
        'flex-shrink:0;background:rgba(255,255,255,0.01)}',
        '.nav-footer-links{display:flex;justify-content:center;gap:16px;margin-bottom:8px}',
        '.nav-footer-link{font-size:0.7rem;color:rgba(255,255,255,0.3);',
        'text-decoration:none;transition:color 0.2s}',
        '.nav-footer-link:hover{color:#00d4ff}',
        '.nav-footer-copy{font-size:0.65rem;color:rgba(255,255,255,0.15);text-align:center}',

        /* Mobile */
        '@media(max-width:480px){#navPanel{width:100vw;max-width:100vw;',
        'right:-100vw;border-left:none}',
        '#navPanel.active{right:0}',
        '.nav-promo{margin:8px 12px}}'
    ].join('');

    function sec(title, links) {
        var h = '<div class="nav-section"><div class="nav-section-title">' + title + '</div><div class="nav-section-links">';
        for (var i = 0; i < links.length; i++) {
            var l = links[i];
            h += '<a href="' + l.h + '" class="nav-link" data-nav="' + l.h + '">';
            h += '<span class="nav-link-icon">' + l.i + '</span>';
            h += '<span class="nav-link-label">' + l.l + (l.s ? '<span class="nav-link-sub">' + l.s + '</span>' : '') + '</span>';
            if (l.b) h += '<span class="nav-link-badge' + (l.bc ? ' ' + l.bc : '') + '">' + l.b + '</span>';
            h += '</a>';
        }
        h += '</div></div>';
        return h;
    }

    function buildPanel() {
        var d = document.createElement('div');
        d.id = 'navOverlay';
        document.body.appendChild(d);

        var p = document.createElement('div');
        p.id = 'navPanel';
        p.setAttribute('role', 'dialog');
        p.setAttribute('aria-label', 'Navigation');
        p.setAttribute('aria-modal', 'true');
        p.innerHTML =
            '<div id="navPanelHeader">' +
            '<div class="nav-logo-wrap">' +
            '<div class="nav-logo-icon">CB</div>' +
            '<div>' +
            '<span class="nav-logo-text">ChinaBuyHub</span>' +
            '<span class="nav-logo-badge">2026</span>' +
            '</div>' +
            '</div>' +
            '<button id="navPanelClose" aria-label="Close menu">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
            '</button>' +
            '</div>' +
            '<div id="navPanelScroll">' +

            sec('NAVIGATION', [
                { h: '/', l: 'Home', i: '🏠' },
                { h: '/catalog', l: 'Catalog', i: '🛍️', b: '9,935+', bc: 'green' },
                { h: '/agents', l: 'Agents & Bonuses', i: '🎁', b: 'TOP 3', bc: 'gold' },
                { h: '/tools', l: 'Tools', i: '🛠️' },
                { h: '/cost-calculator', l: 'Cost Calculator', i: '🧮' },
                { h: '/finds-es', l: 'FindsES Sheet', i: '📊', b: 'NEW', bc: 'blue' },
                { h: '/blog', l: 'Blog & Guides', i: '📝' },
                { h: '/extension', l: 'Chrome Extension', i: '🧩', b: 'FREE', bc: 'blue' }
            ]) +

            sec('MORE', [
                { h: '/about', l: 'About Us', i: 'ℹ️' },
                { h: '/extension-privacy', l: 'Extension Privacy', i: '🔒' },
                { h: '/legal', l: 'Legal', i: '⚖️' }
            ]) +

            '</div>' +

            '<div class="nav-footer">' +
            '<div class="nav-footer-links">' +
            '<a href="https://t.me/repschinabuyhub" class="nav-footer-link" target="_blank" rel="noopener">Telegram</a>' +
            '<a href="https://discord.gg/9gZaWVbwCx" class="nav-footer-link" target="_blank" rel="noopener">Discord</a>' +
            '<a href="https://www.reddit.com/r/luxeechoreplicas/" class="nav-footer-link" target="_blank" rel="noopener">Reddit</a>' +
            '</div>' +
            '<div class="nav-footer-copy">© 2024–2026 ChinaBuyHub</div>' +
            '</div>';

        document.body.appendChild(p);
    }

    function open() {
        var o = document.getElementById('navOverlay');
        var p = document.getElementById('navPanel');
        if (o) o.classList.add('active');
        if (p) p.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function close() {
        var o = document.getElementById('navOverlay');
        var p = document.getElementById('navPanel');
        if (o) o.classList.remove('active');
        if (p) p.classList.remove('active');
        document.body.style.overflow = '';
    }

    function bind() {
        var hb = document.getElementById('hamburger');
        if (!hb) return;

        var overlay = document.getElementById('navOverlay');
        var panel = document.getElementById('navPanel');
        if (!overlay || !panel) return;

        hb.addEventListener('click', function (e) {
            e.stopPropagation();
            open();
        });

        var cls = document.getElementById('navPanelClose');
        if (cls) cls.addEventListener('click', close);

        overlay.addEventListener('click', close);

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && panel.classList.contains('active')) close();
        });

        var links = panel.querySelectorAll('.nav-link');
        for (var i = 0; i < links.length; i++) {
            links[i].addEventListener('click', function () {
                setTimeout(close, 150);
            });
        }
    }

    function highlight() {
        var path = window.location.pathname.replace(/\/$/, '') || '/';
        var links = document.querySelectorAll('#navPanel .nav-link');
        for (var i = 0; i < links.length; i++) {
            if (links[i].getAttribute('data-nav') === path) {
                links[i].classList.add('active');
                links[i].setAttribute('aria-current', 'page');
            }
        }
    }

    whenReady(function () {
        var style = document.createElement('style');
        style.id = 'nav-menu-css';
        style.textContent = CSS;
        document.head.appendChild(style);
        buildPanel();
        bind();
        highlight();
    });
})();
