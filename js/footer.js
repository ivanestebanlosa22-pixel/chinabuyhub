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
    <footer style="background: #0a0a0a; padding: 60px 20px 30px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
    <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 30px;">
        <div>
            <h3 style="font-size: 20px; margin-bottom: 15px; background: linear-gradient(135deg, #00d4ff, #ff006e); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 800;">ChinaBuyHub</h3>
            <p style="color: #aaa; line-height: 1.7; font-size: 13px;">Independent guide to Chinese shopping agents. We test, review and compare verified agents to help buyers in Spain access premium products from China safely and save 60-80%.</p>
        </div>
        <div>
            <h4 style="font-size: 15px; margin-bottom: 15px; color: #fff;">Main Pages</h4>
            <ul style="list-style: none; padding: 0;">
                <li style="margin-bottom: 8px;"><a href="/" style="color: #b8b8b8; text-decoration: none; font-size: 13px;">Home</a></li>
                <li style="margin-bottom: 8px;"><a href="/catalog" style="color: #b8b8b8; text-decoration: none; font-size: 13px;">Catalog</a></li>
                <li style="margin-bottom: 8px;"><a href="/tools" style="color: #b8b8b8; text-decoration: none; font-size: 13px;">Tools</a></li>
                <li style="margin-bottom: 8px;"><a href="/agents" style="color: #b8b8b8; text-decoration: none; font-size: 13px;">Agents</a></li>
                <li style="margin-bottom: 8px;"><a href="/blog/how-to-buy" style="color: #b8b8b8; text-decoration: none; font-size: 13px;">How to Buy</a></li>
                <li style="margin-bottom: 8px;"><a href="/about" style="color: #b8b8b8; text-decoration: none; font-size: 13px;">About Us</a></li>
            </ul>
        </div>
        <div>
            <h4 style="font-size: 15px; margin-bottom: 15px; color: #fff;">USFans Resources</h4>
            <ul style="list-style: none; padding: 0;">
                <li style="margin-bottom: 8px;"><a href="/blog/usfans-agent-review" style="color: #b8b8b8; text-decoration: none; font-size: 13px;">USFans Full Review</a></li>
                <li style="margin-bottom: 8px;"><a href="/blog/usfans-referral-code" style="color: #b8b8b8; text-decoration: none; font-size: 13px;">RCGD5Y Bonus Code</a></li>
                <li style="margin-bottom: 8px;"><a href="/blog/usfans-shipping-costs" style="color: #b8b8b8; text-decoration: none; font-size: 13px;">Shipping Costs</a></li>
                <li style="margin-bottom: 8px;"><a href="/blog/usfans-qc-photos" style="color: #b8b8b8; text-decoration: none; font-size: 13px;">QC Photo Guide</a></li>
                <li style="margin-bottom: 8px;"><a href="/blog/usfans-vs-alternatives" style="color: #b8b8b8; text-decoration: none; font-size: 13px;">vs Alternatives</a></li>
                <li style="margin-bottom: 8px;"><a href="/blog/how-to-buy-with-usfans" style="color: #b8b8b8; text-decoration: none; font-size: 13px;">USFans Tutorial</a></li>
            </ul>
        </div>
        <div>
            <h4 style="font-size: 15px; margin-bottom: 15px; color: #fff;">More</h4>
            <ul style="list-style: none; padding: 0;">
                <li style="margin-bottom: 8px;"><a href="/blog/kakobuy-review" style="color: #b8b8b8; text-decoration: none; font-size: 13px;">Kakobuy Review</a></li>
                <li style="margin-bottom: 8px;"><a href="/blog/litbuy-review" style="color: #b8b8b8; text-decoration: none; font-size: 13px;">Litbuy Review</a></li>
                <li style="margin-bottom: 8px;"><a href="/blog/kakobuy-invite-code" style="color: #b8b8b8; text-decoration: none; font-size: 13px;">Kakobuy Code FINDSES</a></li>
                <li style="margin-bottom: 8px;"><a href="/blog/best-chinese-shopping-agents" style="color: #b8b8b8; text-decoration: none; font-size: 13px;">Compare Agents</a></li>
                <li style="margin-bottom: 8px;"><a href="/blog" style="color: #b8b8b8; text-decoration: none; font-size: 13px;">Blog</a></li>
                <li style="margin-bottom: 8px;"><a href="/legal" style="color: #b8b8b8; text-decoration: none; font-size: 13px;">Legal</a></li>
            </ul>
        </div>
    </div>
    <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid rgba(255, 255, 255, 0.1); color: #666; font-size: 13px;">
        <p>&copy; 2024–2026 ChinaBuyHub. All rights reserved.</p>
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
