# ChinaBuyHub — Complete Architecture Reference

> **Target audience**: A new AI architect (ChatGPT, Claude, etc.) who needs to understand, modify, or extend this project without reading the source code.
> **Last updated**: 2026-06-29
> **Live site**: https://www.chinabuyhub.com/
> **Project root**: `/home/u239511207/domains/chinabuyhub.com/public_html/` (Hostinger shared hosting)

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Directory Tree](#2-directory-tree)
3. [Architecture Philosophy](#3-architecture-philosophy)
4. [Critical Files: The Spine](#4-critical-files-the-spine)
5. [The Product Database (products.js)](#5-the-product-database-productsjs)
6. [JavaScript Module Inventory](#6-javascript-module-inventory)
7. [CSS & Design System](#7-css--design-system)
8. [SEO & Structured Data](#8-seo--structured-data)
9. [Affiliate System](#9-affiliate-system)
10. [AI Scripts & Groq Integration](#10-ai-scripts--groq-integration)
11. [Server Configuration](#11-server-configuration)
12. [Chrome Extension](#12-chrome-extension)
13. [Content Inventory](#13-content-inventory)
14. [Performance & Security](#14-performance--security)
15. [Code Quality & Technical Debt](#15-code-quality--technical-debt)
16. [Onboarding Notes for a New AI](#16-onboarding-notes-for-a-new-ai)

---

## 1. Project Overview

ChinaBuyHub is a **static HTML comparison guide** for Chinese shopping agents (USFans, Kakobuy, Litbuy, Joyagoo). It helps users find products across 1688/Taobao/Weidian and compare agent pricing.

### Business Model
- **Affiliate commissions** — Every product outbound link includes a referral code. Revenue is earned when users sign up or purchase through agent links.
- **No inventory, no fulfillment** — The site merely compares and links to third-party agents.
- **Agents promoted**: USFans (code `RCGD5Y`), Kakobuy (code `FINDSES`), Litbuy (code `YBMHFG55L`), Joyagoo (code `300768147`).

### Tech Stack (Intentional)
| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Hosting | Hostinger shared (Apache 2.4) | Cheap, simple, no DevOps |
| Markup | Plain `.html` | SEO-friendly, zero JS dependency for content |
| Styling | Tailwind CSS (CDN) + custom CSS | Rapid prototyping, no build step |
| JavaScript | Vanilla JS (no framework) | No bundle, no transpile, no npm |
| "Database" | `products.js` — a single 9,829-item array | Zero backend, all client-side |
| Search | Fuse.js (CDN) — client-side fuzzy search | No backend search needed |
| Backend logic | PHP (3 files) | Hostinger supports PHP natively |
| AI | Groq API (llama-3.3-70b-versatile) | Content generation pipeline |
| CI | cron-job.org → PHP cron | Featured product rotation |
| Chat | Commenting via Giscus (GitHub Discussions) | Free, no database |

### Key Design Decisions
1. **No framework, no build step** — Every page is a hand-written HTML file. Changes are FTP'd directly. This was a deliberate choice for simplicity and SEO.
2. **Products live in JS, not a database** — All 9,829 products are in a JS array. They load and render on the client side.
3. **No API layer** — There is no REST API, no GraphQL, no backend data service. PHP is used only for the Groq chat proxy and cron.
4. **Clean URLs** — Apache rewrites remove `.html` extensions. Internal links point to `/page`, not `/page.html`.
5. **AI-generated content** — Product descriptions, gender classification, and data cleanup were produced by batch AI scripts.

---

## 2. Directory Tree

```
public_html/
│
│   # ROOT PAGES
├── index.html                 # Homepage (hero, product grid, agent CTAs, FAQ, testimonials)
├── catalog.html               # Full product catalog with search/filter/sort
├── product.html               # Dynamic product detail template (?id= parameter)
├── about-en.html              # About Us (English)
├── how-to-buy.html            # How to Buy guide (English)
├── how-to-buy-cn.html         # How to Buy guide (Chinese)
├── agents.html                # Agent comparison page
├── tools.html                 # Tools & resources
├── cost-calculator.html       # Shipping cost calculator
├── contact.html               # Contact form (sends via Brevo SMTP)
├── reviews.html               # User reviews / testimonials
├── legal.html                 # Legal / privacy policy
├── 404.html                   # Custom 404 page
├── extension.html             # Chrome extension landing page
├── extension-privacy.html     # Chrome extension privacy policy
├── finds-es.html              # Spanish-language "finds" page
│
│   # STATIC ASSETS
├── favicon.ico
├── robots.txt
├── llms.txt                   # LLM-friendly site description
├── .htaccess                  # Apache config (rewrites, security, caching)
│
│   # PRODUCT DATA
├── products.js                # 9,829 products (THE "DATABASE")
├── products_backup.js         # Backup before catalog cleanup
├── featured.json              # Featured products (rotated every 12h)
│
│   # CATEGORY PAGES (subdirectories with index files)
├── c/
│   ├── SNEAKERS.html          # Category: Sneakers (1,520 products)
│   ├── T-SHIRTS.html          # Category: T-Shirts (3,144 products)
│   ├── HOODIES.html           # Category: Hoodies (938 products)
│   ├── JACKETS.html           # Category: Jackets (624 products)
│   ├── PANTS.html             # Category: Pants (749 products)
│   ├── SHORTS.html            # Category: Shorts (351 products)
│   ├── ACCESSORIES.html       # Category: Accessories (1,679 products)
│   ├── BAGS.html              # Category: Bags (313 products)
│   ├── CAPS.html              # Category: Caps (96 products)
│   ├── ELECTRONICS.html       # Category: Electronics (95 products)
│   └── WOMAN.html             # Category: Women (320 products)
│
│   # BLOG
├── blog/
│   ├── agent-101.html         # What is a shopping agent?
│   ├── best-agents.html       # Best Chinese shopping agents
│   ├── comparison.html        # Agent comparison
│   ├── cost-calculator.html   # Cost calculator guide
│   ├── qc.html                # Quality control guide
│   ├── shipping.html          # Shipping guide
│   └── sizing.html            # Chinese sizing guide
│
│   # SCRIPTS
├── js/
│   ├── main.js                # Core site JS (navbar, catalog, calculator, etc.)
│   ├── catalog-app.js         # Premium catalog module (Fuse.js, infinite scroll)
│   ├── product-detail.js      # Product detail page logic
│   ├── nav-menu.js            # Slide-in navigation panel
│   ├── ai-widget.js           # Floating AI chat widget
│   ├── consent.js             # Cookie consent / GDPR
│   └── fx-layer.js            # Visual effects layer (cursor, particles, scroll)
│
│   # CSS
├── css/
│   ├── tokens.css              # Design tokens (brand colors, typography, spacing)
│   ├── catalog.css             # Catalog grid / product card styles
│   ├── fx-layer.css            # Visual effects styles
│   ├── landing.css             # Homepage-specific styles
│   └── product.css             # Product detail page styles
│
│   # PHP BACKEND
├── chat.php                   # AI chat proxy (POST → Groq API)
├── ai-config.php              # Groq API key configuration
├── cron-featured.php          # Cron job: generates featured.json
│
│   # SITEMAPS
├── sitemap.xml                # Sitemap index file
├── sitemaps/
│   ├── sitemap-products.xml   # All 9,829 product URLs (full, ~10MB)
│   └── sitemap-blog-index.xml # Blog post URLs
│
│   # NODE.JS SCRIPTS (DEV ONLY — NOT ON SERVER)
└── scripts/
    ├── generate-sitemap.mjs   # XML sitemap generator
    ├── generate-featured.mjs  # Featured.json generator (Node version)
    ├── fix-catalog.mjs        # Catalog data cleanup tool
    ├── desc-generator.mjs     # AI description generator
    ├── ai-gender-text.mjs     # AI gender classifier (text-based)
    ├── ai-gender-sneakers.mjs # AI gender classifier (sneaker-specific)
    ├── ai-catalog-cleaner.mjs # AI catalog normalization
    └── ai-desc-log.json       # Description generation log
```

---

## 3. Architecture Philosophy

### Why Static HTML?
The site follows a **static-first** philosophy:
1. **SEO priority** — Static HTML pages are instantly indexable. Google sees full content on first crawl.
2. **No server cost** — No database, no API server, no compute. Hostinger shared hosting costs ~$3/month.
3. **No build step** — Edit HTML → FTP → Deploy. No npm install, no build, no CI/CD.
4. **Resilience** — If JS fails, pages still show content. The site degrades gracefully.

### The Trade-off
The downside: every new product listing or catalog change requires editing `products.js` (a 9,829-item array) and re-uploading. There is no CMS, no admin panel, no automated product ingestion.

### How Pages Load
```
1. Browser requests /page-name
2. Apache .htaccess rewrites to /page-name.html
3. Apache serves the HTML file (with compression + caching headers)
4. HTML loads Tailwind CSS from CDN + local CSS files
5. HTML loads JS files (deferred)
6. JS injects: navbar, footer, product grids, effects, chat widget
7. Page is interactive
```

### The Catalog Flow
```
catalog.html
  → loads js/catalog-app.js
  → catalog-app.js loads products.js via <script> tag
  → Fuse.js indexes all 9,829 products in-memory
  → Products are paginated (48 per page) + infinite scrolled
  → Filters: search, category, brand, gender, price sort
  → Each card renders 3 agent buy buttons (USFans, Kakobuy, Litbuy)
```

### The Product Detail Flow
```
User clicks product link: /product/?id=ABC123
  → Rewritten by .htaccess to /product.html?id=ABC123
  → product.html loads js/product-detail.js
  → product-detail.js reads URL param, finds product in window.products
  → Renders: gallery, name, price, brand, description, agent buy buttons
  → Also loads related products (same category)
```

---

## 4. Critical Files: The Spine

### 4.1 `products.js` (~10MB, ~9,829 products)
**This is the database.** Every product is an object in a single `const products = [...]` array. Used by:
- `catalog.html` (all products)
- `product.html` (single product detail)
- `c/*.html` (category pages)
- `index.html` (featured/random products)
- `cron-featured.php` (reads it to generate featured.json)

Product object structure:
```js
{
  "id": "BCY240",           // Unique product ID
  "name": "Nike Air Force 1 Low Supreme",  // Product name
  "price": 29.99,           // Price in USD
  "category": "SNEAKERS",   // One of 11 categories
  "subcategory": "NIKE",    // Brand/subcategory within category
  "image": "https://...",   // Product image URL
  "links": {
    "kakobuy": "https://...",      // Kakobuy link (with ?aff=FINDSES)
    "usfans": "https://...",       // USFans link (with ?rc=RCGD5Y)
    "litbuy": "https://..."        // Litbuy link (with ?aff=YBMHFG55L)
  },
  "description": "...",     // SEO product description
  "likes": 42,              // Like count (localStorage-based)
  "badge": "HOT",           // Optional: HOT, NEW, BEST, SALE
  "brand": "nike",          // Normalized brand name
  "source": "1688",         // Source: 1688, taobao, weidian
  "ranking": 85,            // Popularity score
  "gender": "men",          // men, women, unisex, or "pending"
  "_idx": 0                 // Index position within products array
}
```

### 4.2 `featured.json` (~4-6 products)
Rotating featured products for the homepage hero section. Generated every 12 hours by `cron-featured.php`. Format:
```json
[
  {
    "id": "BCY240",
    "name": "Nike Air Force 1 Low Supreme",
    "price": 29.99,
    "category": "SNEAKERS",
    "image": "https://...",
    "likes": 42,
    "badge": "HOT"
  }
]
```

### 4.3 `.htaccess`
Apache configuration file. Key rules:
- **Clean URLs**: `RewriteRule ^(.+)\.html$ /$1 [R=301,L]` + internal rewrite `RewriteRule ^(.+)$ /$1.html [L]`
- **HTTPS redirect**: All HTTP → HTTPS
- **WWW normalization**: `www.chinabuyhub.com` → `chinabuyhub.com`
- **Compression**: `mod_deflate` for HTML/CSS/JS/JSON/XML
- **Caching**: `mod_expires` — images 1 year, CSS/JS 1 month, HTML 1 day
- **Security headers**: CSP (Content Security Policy), HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- **Redirects**: Old URLs mapped to new ones
- **Allow CORS**: For specific origins

### 4.4 `chat.php` + `ai-config.php`
The AI chat backend. Called by `ai-widget.js` on the browser.
- Receives `{message, history}` via POST
- Uses `ai-config.php` for the Groq API key
- Calls Groq API with `llama-3.3-70b-versatile`
- Returns streaming response (or non-streaming fallback)
- System prompt teaches the AI about ChinaBuyHub agents and services

### 4.5 `cron-featured.php`
Called every 12 hours by cron-job.org.
1. Includes `products.js`
2. Groups products by category (SNEAKERS, HOODIES, T-SHIRTS, ACCESSORIES, PANTS)
3. For each category, selects one product using deterministic rotation based on `(current_hour / 12) % count`
4. Builds `featured.json` with the selected products
5. Writes file

---

## 5. The Product Database (products.js)

### 5.1 Structure
A single `const products = [...]` array. The variable is global (`window.products`). Every page that needs product data loads this script.

**Total products: 9,829**

### 5.2 Category Distribution

| Category | Count | % of Total |
|----------|-------|-----------|
| T-SHIRTS | 3,144 | 32.0% |
| ACCESSORIES | 1,679 | 17.1% |
| SNEAKERS | 1,520 | 15.5% |
| HOODIES | 938 | 9.5% |
| PANTS | 749 | 7.6% |
| JACKETS | 624 | 6.3% |
| SHORTS | 351 | 3.6% |
| WOMAN | 320 | 3.3% |
| BAGS | 313 | 3.2% |
| CAPS | 96 | 1.0% |
| ELECTRONICS | 95 | 1.0% |

### 5.3 Key Stats
- **100%** of products have valid image URLs
- **100%** have SEO descriptions (AI-generated via Groq)
- **Gender classified**: ~7,112 products (about 72%). 2,717 still "pending"
- **Subcategory/brand normalization**: Complete pass done by `fix-catalog.mjs` and `ai-catalog-cleaner.mjs`
- **Backup**: `products_backup.js` contains the original state before cleanup

### 5.4 Update Process
Adding or modifying products requires:
1. Edit `products.js` locally (insert/modify entries in the array)
2. Re-run sitemap generator: `node scripts/generate-sitemap.mjs`
3. FTP `products.js` and updated sitemaps to server
4. Optionally re-run `generate-featured.mjs` to update featured products

---

## 6. JavaScript Module Inventory

### 6.1 `js/main.js` (~400+ lines)
**The workhorse.** Injected by every page. Handles:
- **Navbar injection** — Loads navigation HTML dynamically (so nav markup exists in one place)
- **Footer injection** — Same pattern, footer HTML inserted via JS
- **Catalog page** — If on catalog page, loads products, renders grid, handles filter/sort/show-more
- **Cost calculator** — Calculates estimated shipping+customs costs
- **Reviews carousel** — Auto-scrolling testimonial carousel on homepage
- **Contact form** — Validates, sends via Brevo SMTP (XHR POST to... a handler)
- **Sidebar agents** — Agent promo box in sidebar
- **Like system** — Stores likes in `localStorage`, renders heart count
- **Utility functions** — Various helpers

### 6.2 `js/catalog-app.js` (~900+ lines)
**Premium catalog module.** Loaded by `catalog.html`. Features:
- **Fuse.js integration** — Fuzzy search with configurable threshold/weights
- **Skeleton loaders** — Anime-style shimmer cards while products load
- **Infinite scroll** — Loads 48 products initially, more on scroll
- **Pagination controls** — Jump-to-page, total counter
- **Multi-filter** — Category, brand, gender (AND-combined)
- **Sort options** — Price (low/high), popularity, name, newest
- **Like system** — Heart button per card, persisted in localStorage
- **Agent buy buttons** — 3 buttons per card (USFans, Kakobuy, Litbuy)
- **Mobile responsive** — Slides out filter panel on mobile
- **URL state** — Filters/sort/search sync to URL query params

### 6.3 `js/product-detail.js` (~300+ lines)
**Product detail page logic.** Loaded by `product.html`. Handles:
- **Product lookup** — Reads `?id=` from URL, finds match in `window.products`
- **Gallery rendering** — Shows main product image
- **Breadcrumb** — Home > Category > Product Name
- **Agent buy buttons** — 3 buttons, each with proper affiliate link
- **Description** — Full product description
- **Details panel** — Brand, source, category, price info
- **Like button** — Toggle heart, stored in localStorage
- **Related products** — Shows 4 products from same category
- **SEO meta tags** — Updates document.title and meta description

### 6.4 `js/nav-menu.js` (~500+ lines)
**Slide-in navigation panel.** Self-injecting. Creates:
- **Hamburger button** — Fixed top-left
- **Slide-out panel** — Full-height, slides from left
- **Search** — Input field that searches products (Fuse.js)
- **Category tree** — Nested list of all 11 categories with product counts
- **Agent submenu** — Links to agent comparison pages
- **Social links** — Instagram, TikTok, etc.
- **Glowing effects** — Animated gradient borders, floating particles
- **Animations** — CSS transitions, stagger animations on items

### 6.5 `js/ai-widget.js` (~250+ lines)
**Floating AI chat widget.** Bottom-right corner:
- **Chat bubble** — Circular button with AI icon
- **Chat panel** — Expands to show message history + input
- **API calls** — POST to `chat.php`, receives streaming response
- **Typing indicator** — Shows "AI is typing..." animation
- **System prompt** — Hardcoded in `chat.php`, teaches AI about agents
- **Error handling** — Retries on failure, shows error state
- **Persistence** — Chat history stored in localStorage

### 6.6 `js/fx-layer.js` (~1,100+ lines)
**Visual effects layer.** The largest JS file. Creates:
- **Custom cursor** — Rounded div following mouse, with hover interactions
- **Particle system** — Floating dots/shapes in background (canvas-based)
- **Floating orbs** — Glowing colored blobs that drift slowly
- **Card tilt** — 3D perspective tilt on hover for product cards
- **Magnetic buttons** — Buttons that slightly attract to cursor
- **Scroll reveal** — Elements fade/slide in on scroll (IntersectionObserver)
- **Animated counters** — Numbers count up on scroll
- **Glitch text** — Occasional glitch effect on headings
- **Marquee** — Infinite scrolling text banners
- **Copy to clipboard** — Click-to-copy with animation
- **Navbar scroll effects** — Background opacity changes on scroll

### 6.7 `js/consent.js` (~80 lines)
**Cookie consent / GDPR.** Minimal:
- Shows banner on first visit
- Accept button stores consent in localStorage
- Hides banner after acceptance

---

## 7. CSS & Design System

### 7.1 `css/tokens.css` — Design System
CSS custom properties defining the visual language:
```css
:root {
  /* BRAND COLORS */
  --pink: #FF1493;            /* DeepPink — primary accent */
  --pink-light: #FF69B4;      /* HotPink — secondary accent */
  --cyan: #00E5FF;            /* Cyan — secondary accent */
  --cyan-dark: #00B8D4;       /* Darker cyan */
  --bg-dark: #0A0A0F;         /* Near-black background */
  --bg-card: #1A1A2E;         /* Card background */
  --text-primary: #FFFFFF;    /* White text */
  --text-secondary: #B0B0C0;  /* Muted text */
  
  /* TYPOGRAPHY */
  --font-heading: 'Space Grotesk', sans-serif;
  --font-body: 'Inter', sans-serif;
  
  /* SPACING SCALE */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  
  /* EFFECTS */
  --glow-pink: 0 0 20px rgba(255, 20, 147, 0.3);
  --glow-cyan: 0 0 20px rgba(0, 229, 255, 0.3);
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  
  /* ANIMATION */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --duration-fast: 200ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
}
```

### 7.2 Tailwind CSS CDN
Loaded via `<script src="https://cdn.tailwindcss.com">` in every page. Used for rapid layout (flex, grid, spacing, responsive). Supplemented by local CSS for custom styling.

### 7.3 Local CSS Files
- **`catalog.css`** — Product card grid, filter panel, skeleton loaders, pagination
- **`fx-layer.css`** — Custom cursor, particles, floating orbs, card tilt, scroll reveals
- **`landing.css`** — Homepage hero section, featured grid, testimonial carousel, FAQ accordion
- **`product.css`** — Product detail layout, image gallery, breadcrumbs, buy buttons

---

## 8. SEO & Structured Data

### 8.1 Strategy
- **Static HTML** — Every page has unique title, meta description, and H1.
- **Clean URLs** — `/sneakers` instead of `/sneakers.html`.
- **Semantic HTML** — Proper heading hierarchy (`h1` → `h6`), `<article>`, `<nav>`, `<main>`.
- **Breadcrumbs** — Structured data (JSON-LD) on most pages.
- **Product schema** — On product detail pages (`product.html`), JSON-LD with `Product` schema.
- **FAQ schema** — On pages with FAQs (homepage, how-to-buy, agents).
- **Blog articles** — `Article` schema with author, date, publisher.
- **Sitemap** — Comprehensive XML sitemaps covering all pages and products.
- **`llms.txt`** — LLM-friendly site description for AI crawlers.

### 8.2 Sitemap Structure
- **`sitemap.xml`** — Index file listing sub-sitemaps and root pages
- **`sitemaps/sitemap-products.xml`** — All 9,829 product URLs (generated by `scripts/generate-sitemap.mjs`)
- **`sitemaps/sitemap-blog-index.xml`** — All 7 blog post URLs

### 8.3 Google Search Console
- Verified property: `chinabuyhub.com`
- Connected via Google Analytics
- Sitemap submitted and indexed

### 8.4 Key SEO Metrics
- **~60+ URLs** indexed (pages + blog + category pages)
- **9,829 product URLs** submitted via sitemap (some indexed, most pending discovery)

---

## 9. Affiliate System

### 9.1 How It Works
Every product outbound link includes a referral/affiliate code. When a user clicks and signs up or purchases, the agent provider credits the site owner.

### 9.2 Agent Referral Codes

| Agent | Code | Included In | Link Format |
|-------|------|-------------|-------------|
| USFans | `RCGD5Y` | All product links | `https://usfans.com/...?rc=RCGD5Y` |
| Kakobuy | `FINDSES` | All product links | `https://kakobuy.com/...?aff=FINDSES` |
| Litbuy | `YBMHFG55L` | All product links | `https://litbuy.com/...?aff=YBMHFG55L` |
| Joyagoo | `300768147` | Sidebar/some links | Code appended to signup links |

### 9.3 Agent Links in Products
Each product object has a `links` property with three URLs:
```js
links: {
  kakobuy: "https://kakobuy.com/item/123?aff=FINDSES",
  usfans: "https://usfans.com/go/123?rc=RCGD5Y",
  litbuy: "https://litbuy.com/product/123?aff=YBMHFG55L"
}
```

### 9.4 Link Display
- **Catalog cards**: 3 buy buttons per product card
- **Product detail**: 3 larger buy buttons
- **Homepage featured**: 3 buttons in the hero carousel
- **Sidebar**: Agent promo boxes with CTA links
- **Agent comparison page**: Full agent breakdown with referral links

---

## 10. AI Scripts & Groq Integration

### 10.1 Groq API Configuration
- **API key**: `YOUR_GROQ_API_KEY_HERE`
- **Model**: `llama-3.3-70b-versatile`
- **Endpoint**: `https://api.groq.com/openai/v1/chat/completions`
- **Rate limit**: 30 requests/minute, 14,400 requests/day (free tier limits)

### 10.2 Chat Widget (`chat.php` + `js/ai-widget.js`)
The live chat feature. A floating widget on the bottom-right of every page.
- User types a question
- `ai-widget.js` sends POST to `chat.php`
- `chat.php` calls Groq API with a system prompt about ChinaBuyHub
- Response streams back to the browser (or returns as JSON)
- System prompt covers: agents, shipping, customs, QC, returns, sizing, and recommends USFans/Kakobuy/Litbuy

### 10.3 Content Generation Scripts (Node.js — dev machine only)

| Script | Purpose | Status |
|--------|---------|--------|
| `desc-generator.mjs` | Generates SEO product descriptions via Groq | ✅ Complete (all 9,829 products) |
| `fix-catalog.mjs` | Reclassifies, normalizes brands/subcategories, adds gender field | ✅ Complete |
| `ai-catalog-cleaner.mjs` | AI-driven catalog normalization (brands, categories) | ✅ Complete |
| `ai-gender-text.mjs` | Classifies gender (men/women/unisex) by analyzing name+desc | ⚠️ Partial (~72% complete) |
| `ai-gender-sneakers.mjs` | Gender classifier specific to sneakers | ⚠️ Partial |

### 10.4 Gender Classification Status
- **Classified**: ~7,112 products (72%)
- **Pending**: ~2,717 products (28%)
- **Blocked by**: Groq free tier daily token limit
- **Next steps**: Run `ai-gender-text.mjs` again in batches of 20 products until all are classified

### 10.5 Script Patterns
All AI scripts follow the same pattern:
1. Read `products.js` (or a backup)
2. Filter products needing processing
3. Batch them (e.g., 20 at a time)
4. Send to Groq API with a system prompt asking for JSON output
5. Parse response, validate, apply changes
6. Write updated `products.js`
7. Log progress to a JSON log file

---

## 11. Server Configuration

### 11.1 Hosting
- **Provider**: Hostinger
- **Plan**: Shared hosting (Business or Premium)
- **Server**: Apache 2.4
- **PHP**: 8.x
- **Node.js**: Not available on server (scripts run locally)
- **FTP**: Required for file deployment
- **cPanel**: Available for file management

### 11.2 .htaccess Configuration
Located at `/public_html/.htaccess`. Key rules:

**Clean URLs:**
```apache
# Remove .html from displayed URL (redirect)
RewriteCond %{THE_REQUEST} \.html[\s?]
RewriteRule ^(.+)\.html$ /$1 [R=301,L]

# Internally rewrite clean URL to .html file
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME}\.html -f
RewriteRule ^(.+)$ /$1.html [L]
```

**Security headers:**
```apache
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
Header set X-Frame-Options "DENY"
Header set X-Content-Type-Options "nosniff"
Header set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"
```

**CSP (simplified):**
```apache
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' cdn.tailwindcss.com cdn.jsdelivr.net ...; style-src 'self' 'unsafe-inline' fonts.googleapis.com cdn.tailwindcss.com ...; 
```

**Caching:**
```apache
ExpiresActive On
ExpiresByType image/* "access plus 1 year"
ExpiresByType text/css "access plus 1 month"
ExpiresByType text/javascript "access plus 1 month"
ExpiresByType text/html "access plus 1 day"
```

**Compression:**
```apache
AddOutputFilterByType DEFLATE text/html text/css text/javascript application/json application/xml
```

### 11.3 Cron Job
- **Service**: cron-job.org (external)
- **Schedule**: Every 12 hours
- **URL**: `https://www.chinabuyhub.com/cron-featured.php`
- **Purpose**: Regenerate `featured.json` with rotated products

### 11.4 CDN
- **Tailwind CSS**: `cdn.tailwindcss.com`
- **Fuse.js**: `cdn.jsdelivr.net/npm/fuse.js@7.0.0`
- **Fonts**: `fonts.googleapis.com` (Space Grotesk, Inter)
- **Product images**: Mix of Chinese CDNs (`si.geilicdn.com`), `i.postimg.cc`, `lh3.googleusercontent.com`

---

## 12. Chrome Extension

### 12.1 Overview
ChinaBuyHub has a Chrome extension (Listed on Chrome Web Store). It has its own landing page (`extension.html`) and privacy policy (`extension-privacy.html`).

### 12.2 Purpose
The extension provides additional functionality (likely shopping assistance/product search) beyond the website. Details of the extension code are outside the website codebase.

### 12.3 Pages
- **`extension.html`** — Marketing/landing page for the extension. Explains features and links to Chrome Web Store listing.
- **`extension-privacy.html`** — Privacy policy required by Chrome Web Store.

---

## 13. Content Inventory

### 13.1 Blog Posts

| URL | Title | Topic |
|-----|-------|-------|
| `/blog/agent-101` | What Is a Shopping Agent? | Introduction to Chinese agents |
| `/blog/best-agents` | Best Chinese Shopping Agents (2025) | Top agent comparison |
| `/blog/comparison` | Chinese Agent Comparison | Detailed agent feature breakdown |
| `/blog/cost-calculator` | ChinaBuyHub Cost Calculator Guide | How to estimate total costs |
| `/blog/qc` | Quality Control Guide | QC photos, inspections, returns |
| `/blog/shipping` | Shipping from China | Methods, times, tracking |
| `/blog/sizing` | Chinese Sizing Guide | Size conversions, measurements |

### 13.2 Multilingual Content
| Language | Pages |
|----------|-------|
| English | All main pages (index, catalog, about, how-to-buy, agents, tools, cost-calculator, contact, reviews, legal, 404, extension) |
| Chinese | `index-cn.html`, `how-to-buy-cn.html`, `finds-cn.html` (referenced in links) |
| Spanish | `finds-es.html` |

### 13.3 Interactive Pages
| Page | Features | JS Dependencies |
|------|----------|----------------|
| `catalog.html` | Product grid, search, filter, sort, infinite scroll, like system | `catalog-app.js`, `products.js`, Fuse.js |
| `product.html` | Product detail, gallery, agent buy buttons, related products | `product-detail.js`, `products.js` |
| `cost-calculator.html` | Shipping + customs cost estimator | `main.js` |
| `contact.html` | Contact form with Brevo SMTP | `main.js` |
| `reviews.html` | Testimonials carousel | `main.js` |
| `c/*.html` (11 pages) | Category-specific product grids | `catalog-app.js`, `products.js` |
| All pages | Floating AI chat, effects layer, slide-in nav | `ai-widget.js`, `fx-layer.js`, `nav-menu.js` |

---

## 14. Performance & Security

### 14.1 Performance
- **Assets**: CSS and JS are minified (done manually, no build tool)
- **CDN**: Tailwind, Fuse.js, and Google Fonts are loaded from CDN (not self-hosted)
- **Images**: Hosted on external CDNs (geilicdn.com, postimg.cc, googleusercontent.com) — no local bandwidth cost
- **Compression**: Apache mod_deflate compresses HTML/CSS/JS/JSON
- **Caching**: Browser caching configured via .htaccess (images: 1 year, CSS/JS: 1 month)
- **JS loading**: All JS scripts have `defer` attribute (non-blocking)
- **Critical path**: Content renders before JS executes (static HTML first)
- **Main bottleneck**: `products.js` (~10MB) must be fully downloaded and parsed before catalog is interactive

### 14.2 Security
- **HTTPS**: Enforced via rewrite rule (HTTP → HTTPS)
- **HSTS**: `max-age=31536000; includeSubDomains`
- **CSP**: Strict Content Security Policy (script-src, style-src, img-src, connect-src, etc.)
- **X-Frame-Options**: `DENY` (cannot be iframed)
- **X-Content-Type-Options**: `nosniff`
- **Referrer-Policy**: `strict-origin-when-cross-origin`
- **Permissions-Policy**: No geolocation, microphone, or camera access
- **No backend database**: Reduces SQL injection surface to zero
- **PHP files are minimal**: `chat.php` only accepts POST and validates input before calling Groq API
- **API key in PHP**: Stored in `ai-config.php` (not exposed to frontend)
- **CORS**: Limited and specific origins allowed

### 14.3 Potential Security Improvements
- No rate limiting on `chat.php` (someone could spam the Groq API through it)
- No CAPTCHA on contact form
- `products.js` is fully exposed client-side (acceptable — all data is public)
- No WAF (Web Application Firewall) configured

---

## 15. Code Quality & Technical Debt

### 15.1 Strengths
- **Clean separation**: JS modules are well-separated by responsibility
- **CSS design tokens**: Centralized in `tokens.css` — easy to rebrand
- **No framework lock-in**: Zero npm dependencies, zero build tooling
- **Graceful degradation**: Content works without JS
- **SEO-first**: Static HTML, semantic markup, structured data
- **Self-contained**: Entire project is ~15 files of source code (plus 9,829-item data file)

### 15.2 Technical Debt

**JavaScript:**
- `main.js` is a "god module" — does too many things (nav, footer, catalog, calculator, contact, reviews). Should be split into focused modules.
- Global variable pollution (`window.products`, etc.) — no module system
- Hardcoded API keys and agent codes scattered across files (should be centralized)
- No TypeScript, no JSDoc types
- Error handling is inconsistent (some modules have try/catch, others don't)
- `fx-layer.js` at 1,100+ lines is the largest file and the most complex. Could be split into cursor.js, particles.js, scroll-reveal.js, etc.

**PHP:**
- No input sanitization library (minimal manual validation)
- No error logging mechanism
- `cron-featured.php` reads `products.js` as a PHP include — fragile approach

**CSS:**
- Some inline styles in HTML (should use CSS classes)
- Tailwind classes mixed with custom CSS — no clear boundary
- `landing.css` and `product.css` have some overlap

**Data:**
- `products.js` at 10MB is large for a JS file. Affects initial page load time on catalog.
- No pagination or lazy loading of product data — all 9,829 products load on every catalog page visit
- No cache busting for `products.js` — browsers may serve stale data

**Maintenance:**
- No CMS — every content change requires FTP
- No automated deployment
- No staging environment
- No git history tracking production changes (the local `git` repo may not match live)

### 15.3 Recommended Improvements
1. Split `main.js` into focused modules (nav.js, footer.js, calculator.js, contact.js, etc.)
2. Centralize configuration (agent codes, API keys) into a single `config.js`
3. Implement cache busting for `products.js` (versioned URL)
4. Consider JSON-based product loading (lazy-load products.js on demand)
5. Add rate limiting to `chat.php`
6. Add proper PHP error logging
7. Add `preload` hints for critical resources

---

## 16. Onboarding Notes for a New AI

### 16.1 First Steps
If you (ChatGPT/Claude) are asked to work on this project:

1. **Read `CHINABUYHUB-FULL-REFERENCE.md`** (this file) for complete context
2. **Check `products.js`** for the current product count and data structure
3. **Check `featured.json`** for current featured products
4. **Check `.htaccess`** if you need to add URL routes or security headers
5. **Check `tokens.css`** for brand colors/typography before adding new CSS

### 16.2 Common Tasks

**Adding a product:**
1. Open `products.js`
2. Append to `const products = [...]` array
3. Ensure all fields present (id, name, price, category, image, links, etc.)
4. Re-run `scripts/generate-sitemap.mjs`
5. FTP `products.js` and sitemaps to server

**Adding a new page:**
1. Create `new-page.html` in root
2. Include standard CSS links (`tokens.css`, Tailwind CDN)
3. Include standard JS scripts (`main.js`, `nav-menu.js`, `fx-layer.js`, `ai-widget.js`)
4. Add clean URL rewrite to `.htaccess` if needed
5. Add to `sitemap.xml` and run sitemap generator
6. Add internal links from relevant pages

**Rebranding:**
1. Edit `css/tokens.css` — change `--pink`, `--cyan`, `--bg-dark`, etc.
2. All custom properties cascade automatically

**Processing AI gender classification:**
1. Run `node scripts/ai-gender-text.mjs` locally
2. It processes 20 products per batch
3. Monitor Groq API rate limits
4. Repeat until all products classified (check for "pending" in gender field)

**Generating sitemaps:**
1. `node scripts/generate-sitemap.mjs`
2. Upload `sitemap.xml` and `sitemaps/` directory to server

### 16.3 Important Gotchas
- `products.js` is **included as a PHP file** in `cron-featured.php` (uses `include()`). Never break the PHP 5+ syntax compatibility.
- `.htaccess` clean URL rules affect ALL `.html` files. Adding a new `.html` file automatically gets clean URL support.
- The AI chat widget has a **hardcoded system prompt** in `chat.php`. Modify it there, not in the JS.
- Featured products are rotated by **time-based index**, not randomly. This means the same products appear at the same time each day.
- `products.js` backups are stored as `products_backup.js`. Always back up before running catalog cleanup scripts.
- The Chinese CDN (`si.geilicdn.com`) may be slow or blocked outside China. Product images may fail to load in some regions.

### 16.4 Contact & Accounts
| Service | Account/Login | Notes |
|---------|--------------|-------|
| Hostinger | Owner's cPanel credentials | FTP + server management |
| Chrome Web Store | Owner's Google account | Extension management |
| Stripe | `usfansagent@gmail.com` | Payment processing |
| Brevo | Owner's email | SMTP for contact form |
| Groq | Free tier account | API key in `ai-config.php` |
| Google Analytics | Owner's Google account | Site analytics |
| Google Search Console | Owner's Google account | SEO monitoring |
| cron-job.org | Owner's account | Cron job management |
| Giscus | Uses GitHub Discussions | Comment system |
| GitHub | Owner's repository | Source code (may not match live) |

### 16.5 File Sizes
| File | Size | Notes |
|------|------|-------|
| `products.js` | ~10 MB | Largest file, contains all product data |
| `sitemaps/sitemap-products.xml` | ~5 MB | 9,829 product URLs |
| `chat.php` | ~5 KB | AI chat proxy |
| `fx-layer.js` | ~45 KB | Visual effects (largest JS) |
| `main.js` | ~18 KB | Core site JS |
| All CSS combined | ~30 KB | Four CSS files |

---

*End of reference document. This file should be the first thing ChatGPT reads when asked to work on ChinaBuyHub.*
