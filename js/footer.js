/**
 * ChinaBuyHub Footer Component
 * Dynamically generates the site footer with consistent structure across all pages.
 * 
 * Usage: Add <div id="footer-placeholder"></div> where you want the footer to appear.
 * The footer will be injected on DOMContentLoaded.
 */

(function() {
    'use strict';

    const FOOTER_HTML = `
    <footer style="background: #0a0a0a; padding: 50px 20px 30px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
    <div style="max-width: 1000px; margin: 0 auto; display: grid; grid-template-columns: 1.3fr 1fr 1.2fr; gap: 30px;">
        <div>
            <h3 style="font-size: 20px; margin-bottom: 12px; background: linear-gradient(135deg, #00d4ff, #ff006e); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 800;">ChinaBuyHub</h3>
            <p style="color: #ffffff; line-height: 1.7; font-size: 13px;">Best guide to Chinese shopping agents. We compare verified agents to help buyers in the USA, UK, Canada and Australia buy safely from China and save 60-80%.</p>
            <div style="display:flex;gap:10px;margin-top:16px">
                <a href="https://discord.gg/9gZaWVbwCx" target="_blank" rel="noopener noreferrer" style="background:rgba(88,101,242,0.15);border:1px solid #5865F2;color:#fff;padding:9px 16px;border-radius:10px;text-decoration:none;font-size:13px;font-weight:700">💬 Discord</a>
                <a href="https://t.me/repschinabuyhub" target="_blank" rel="noopener noreferrer" style="background:rgba(0,212,255,0.12);border:1px solid #00d4ff;color:#fff;padding:9px 16px;border-radius:10px;text-decoration:none;font-size:13px;font-weight:700">✈️ Telegram</a>
            </div>
        </div>
        <div>
            <h4 style="font-size: 14px; margin-bottom: 12px; color: #fff;">Explore</h4>
            <ul style="list-style: none; padding: 0;">
                <li style="margin-bottom: 7px;"><a href="/" style="color: #ffffff; text-decoration: none; font-size: 13px;">Home</a></li>
                <li style="margin-bottom: 7px;"><a href="/catalog" style="color: #ffffff; text-decoration: none; font-size: 13px;">Catalog</a></li>
                <li style="margin-bottom: 7px;"><a href="/agents" style="color: #ffffff; text-decoration: none; font-size: 13px;">Agents &amp; Bonuses</a></li>
                <li style="margin-bottom: 7px;"><a href="/tools" style="color: #ffffff; text-decoration: none; font-size: 13px;">Tools</a></li>
                <li style="margin-bottom: 7px;"><a href="/blog/" style="color: #ffffff; text-decoration: none; font-size: 13px;">Blog &amp; Guides</a></li>
            </ul>
        </div>
        <div>
            <h4 style="font-size: 14px; margin-bottom: 12px; color: #fff;">Join the Community</h4>
            <ul style="list-style: none; padding: 0;">
                <li style="margin-bottom: 7px;"><a href="https://discord.gg/9gZaWVbwCx" target="_blank" rel="noopener noreferrer" style="color: #ffffff; text-decoration: none; font-size: 13px;">💬 Discord — AI bot 24/7</a></li>
                <li style="margin-bottom: 7px;"><a href="https://t.me/repschinabuyhub" target="_blank" rel="noopener noreferrer" style="color: #ffffff; text-decoration: none; font-size: 13px;">📦 Daily finds on Telegram</a></li>
                <li style="margin-bottom: 7px;"><a href="https://www.reddit.com/r/luxeechoreplicas/" target="_blank" rel="noopener noreferrer" style="color: #ffffff; text-decoration: none; font-size: 13px;">🔥 Reddit community</a></li>
                <li style="margin-bottom: 7px;"><a href="https://t.me/repschinabuyhub" target="_blank" rel="noopener noreferrer" style="color: #ffffff; text-decoration: none; font-size: 13px;">📋 Weidian spreadsheet</a></li>
            </ul>
        </div>
    </div>
    <div style="text-align: center; margin-top: 36px; padding-top: 24px; border-top: 1px solid rgba(255, 255, 255, 0.1); color: #ffffff; font-size: 13px;">
        <p>&copy; 2024&ndash;2026 ChinaBuyHub. Best comparison guide. Some links are affiliate links.</p>
    </div>
</footer>
    `;

    function initFooter() {
        const placeholder = document.getElementById('footer-placeholder');
        if (placeholder) {
            placeholder.innerHTML = FOOTER_HTML;
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFooter);
    } else {
        initFooter();
    }
})();
