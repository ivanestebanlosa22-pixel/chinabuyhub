/* ============================================
   ChinaBuyHub Premium Catalog — Modular JS
   Fuse.js search, skeleton loaders, lazy loading,
   paginate, filter, like system
   ============================================ */

(function () {
    'use strict';

    var PRODUCTS_PER_PAGE = 32;
    var DEBOUNCE_MS = 250;

    var _allProducts = [];

    var state = {
        currentPage: 1,
        currentCategory: 'all',
        currentBrand: 'all',
        currentGender: 'all',
        currentSort: 'default',
        searchQuery: '',
        fuzzyEnabled: false,
        fuse: null,
        isFirstRender: true,
        likedProducts: JSON.parse(localStorage.getItem('likedProducts') || '{}'),
        likedCounts: JSON.parse(localStorage.getItem('likedCounts') || '{}')
    };

    var catalogAgents = {
        'KAKOBUY': { name: 'Kakobuy', logo: 'images/kakobuy-logo.webp' },
        'LITBUY': { name: 'Litbuy', logo: 'images/litbuy-logo.webp' },
        'MULEBUY': { name: 'Mulebuy', logo: 'images/mulebuy-logo.webp' },
        'SUPERBUY': { name: 'Superbuy', logo: 'images/superbuy-logo.webp' },
        'OOPBUY': { name: 'Oopbuy', logo: 'images/oopbuy-logo.webp' }
    };

    var agentMessages = {
        kakobuy: { text: '\u26A1 Fast & Secure Shipping', recommended: true },
        litbuy: { text: '\u{1F381} $500 in Coupons', recommended: false },
        mulebuy: { text: '\u{1F4E6} $441 pack + 15% OFF', recommended: false },
        superbuy: { text: '\u{1F4B0} $78 coupon + cashback', recommended: false },
        oopbuy: { text: '\u{1F3AF} $490 pack + 15% OFF', recommended: false }
    };

    /* ---- FUSE.JS INIT ---- */
    function initFuse(products) {
        if (typeof Fuse === 'undefined') return;
        state.fuse = new Fuse(products, {
            keys: [
                { name: 'name', weight: 0.4 },
                { name: 'brand', weight: 0.25 },
                { name: 'description', weight: 0.2 },
                { name: 'category', weight: 0.15 }
            ],
            threshold: 0.45,
            distance: 200,
            minMatchCharLength: 2,
            includeScore: true,
            ignoreLocation: true
        });
    }

    /* ---- HELPERS ---- */
    function hasImage(p) {
        return p && p.image && String(p.image).trim() !== '' && String(p.image) !== 'undefined' && String(p.image).indexOf('resources/') !== 0 && p.image.indexOf('http') === 0;
    }

    function getAllProducts() {
        return _allProducts;
    }

    /* ---- SKELETON RENDERING ---- */
    function renderSkeletons(count, container) {
        var html = '';
        for (var i = 0; i < count; i++) {
            html += '<div class="skeleton-card product-card" aria-hidden="true">' +
                '<div class="skeleton skeleton-image"></div>' +
                '<div class="product-info">' +
                    '<div class="skeleton skeleton-title"></div>' +
                    '<div class="skeleton skeleton-text"></div>' +
                    '<div class="skeleton skeleton-text-short"></div>' +
                    '<div class="skeleton skeleton-price"></div>' +
                    '<div class="skeleton skeleton-btn"></div>' +
                    '<div class="skeleton skeleton-btn"></div>' +
                '</div>' +
            '</div>';
        }
        container.innerHTML = html;
    }

    /* ---- SEARCH ---- */
    function debounce(fn, ms) {
        var timer;
        return function () {
            var args = arguments;
            var ctx = this;
            clearTimeout(timer);
            timer = setTimeout(function () { fn.apply(ctx, args); }, ms);
        };
    }

    function getFilteredProducts() {
        var list = getAllProducts();

        if (state.currentCategory !== 'all') {
            list = list.filter(function (p) {
                return (p.category || '').toUpperCase() === state.currentCategory;
            });
        }

        if (state.currentBrand !== 'all') {
            list = list.filter(function (p) {
                return (p.brand || '').trim() === state.currentBrand;
            });
        }

        if (state.currentGender !== 'all') {
            list = list.filter(function (p) {
                return (p.gender || 'unisex') === state.currentGender;
            });
        }

        if (state.searchQuery) {
            if (state.fuzzyEnabled && state.fuse) {
                var filteredFuse = new Fuse(list, {
                    keys: [
                        { name: 'name', weight: 0.4 },
                        { name: 'brand', weight: 0.25 },
                        { name: 'description', weight: 0.2 },
                        { name: 'category', weight: 0.15 }
                    ],
                    threshold: 0.45,
                    distance: 200,
                    minMatchCharLength: 2,
                    includeScore: true,
                    ignoreLocation: true
                });
                return filteredFuse.search(state.searchQuery).map(function (r) { return r.item; });
            } else {
                var q = state.searchQuery.toLowerCase();
                list = list.filter(function (p) {
                    return (p.name || '').toLowerCase().includes(q) ||
                           (p.brand || '').toLowerCase().includes(q) ||
                           (p.description || '').toLowerCase().includes(q) ||
                           (p.category || '').toLowerCase().includes(q);
                });
            }
        }

        if (state.currentSort && state.currentSort !== 'default') {
            var sort = state.currentSort;
            list.sort(function (a, b) {
                if (sort === 'brand') return (a.brand || '').localeCompare(b.brand || '');
                if (sort === 'name') return (a.name || '').localeCompare(b.name || '');
                if (sort === 'price-asc' || sort === 'price-desc') {
                    var pa = parseFloat((a.price || '0').toString().replace(/[^0-9.]/g, '')) || 0;
                    var pb = parseFloat((b.price || '0').toString().replace(/[^0-9.]/g, '')) || 0;
                    return sort === 'price-asc' ? pa - pb : pb - pa;
                }
                return 0;
            });
        }

        return list;
    }

    /* ---- RENDER PRODUCTS ---- */
    function renderProducts() {
        var container = document.getElementById('productsContainer');
        var resultsInfo = document.getElementById('searchResultsCount');
        if (!container) return;

        showSkeletonsBrief(container, function () {
            var filteredProducts = getFilteredProducts();
            var totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE) || 1;

            if (state.currentPage > totalPages) state.currentPage = 1;

            if (resultsInfo) {
                if (state.searchQuery) {
                    resultsInfo.textContent = filteredProducts.length + ' product' + (filteredProducts.length !== 1 ? 's' : '') + ' found';
                    resultsInfo.style.opacity = '1';
                } else {
                    resultsInfo.textContent = '';
                    resultsInfo.style.opacity = '0';
                }
            }

            var startIndex = (state.currentPage - 1) * PRODUCTS_PER_PAGE;
            var endIndex = startIndex + PRODUCTS_PER_PAGE;
            var pageProducts = filteredProducts.slice(startIndex, endIndex);

            if (pageProducts.length === 0) {
                container.innerHTML = '<div class="no-results">' +
                    '<h3>No products found</h3>' +
                    '<p>' + (state.searchQuery ? 'Try different search terms or enable fuzzy search' : 'Try another category or brand filter') + '</p>' +
                '</div>';
                document.getElementById('pagination').innerHTML = '';
                return;
            }

            container.innerHTML = pageProducts.map(function (product, index) {
                var linksHTML = buildAgentLinks(product);
                var isLiked = !!state.likedProducts[product.id];
                var displayLikes = (product.likes || 0) + (state.likedCounts[product.id] || 0) + (isLiked ? 1 : 0);

                return '<div class="product-card" data-tilt>' +
                    '<div class="card-shine"></div>' +
                    '<div class="card-border-glow"></div>' +
                    (product.badge ? '<div class="product-badge badge-' + escapeHtml(product.badge.toLowerCase()) + '">' + escapeHtml(product.badge) + '</div>' : '') +
                    '<div class="product-likes' + (isLiked ? ' liked' : '') + '" data-product-id="' + product.id + '" role="button" tabindex="0" aria-label="Like ' + escapeHtml(product.name) + '">' +
                        '<span class="like-icon">' + (isLiked ? '\u2764\uFE0F' : '\uD83D\uDC99') + '</span>' +
                        '<span class="like-count">' + displayLikes + '</span>' +
                    '</div>' +
                    '<a href="/product/' + product.id + '" class="product-image-link" aria-label="View ' + escapeHtml(product.name) + '">' +
                    '<div class="product-image-wrapper">' +
                        '<img src="' + escapeHtml(product.image || '') + '" alt="' + escapeHtml(product.name || 'Product') + '" class="product-image" loading="lazy" data-loaded="false" fetchpriority="' + (index === 0 && state.currentPage === 1 ? 'high' : 'auto') + '">' +
                        '<div class="product-image-fallback">\uD83D\uDCE6</div>' +
                    '</div>' +
                    '</a>' +
                    '<div class="product-info">' +
                        '<div class="product-category">' + escapeHtml(product.category || '') + '</div>' +
                        '<h3 class="product-name"><a href="/product/' + product.id + '" class="product-name-link">' + escapeHtml(product.name || '') + '</a></h3>' +
                        '<p class="product-description">' + escapeHtml(product.description || '') + '</p>' +
                        '<div class="product-footer">' +
                            '<span class="product-price" translate="no">$' + product.price + '</span>' +
                        '</div>' +
                        '<div class="product-links">' + linksHTML + '</div>' +
                    '</div>' +
                '</div>';
            }).join('');

            initLazyImages(container);
            initLikeButtons(container);
            initBuyButtons(container);
            initTiltEffect(container);
            renderPagination(totalPages);

            if (!state.isFirstRender) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            state.isFirstRender = false;
        });
    }

    function showSkeletonsBrief(container, callback) {
        renderSkeletons(6, container);
        requestAnimationFrame(function () {
            requestAnimationFrame(callback);
        });
    }

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function buildAgentLinks(product) {
        if (!product.links) return '';
        var agents = [
            { key: 'kakobuy', cls: 'kakobuy-btn', agentKey: 'KAKOBUY' },
            { key: 'litbuy', cls: 'litbuy-btn', agentKey: 'LITBUY' },
            { key: 'mulebuy', cls: 'mulebuy-btn', agentKey: 'MULEBUY' },
            { key: 'superbuy', cls: 'superbuy-btn', agentKey: 'SUPERBUY' },
            { key: 'oopbuy', cls: 'oopbuy-btn', agentKey: 'OOPBUY' }
        ];

        // Extract the Weidian product id from an existing agent link (kakobuy/litbuy).
        var weidianId = '';
        var existing = product.links.kakobuy || product.links.litbuy || '';
        var m = existing.match(/itemID%3D(\d+)/) || existing.match(/weidian\/(\d+)/);
        if (m) weidianId = m[1];

        // Per-agent product-link template (id injected).
        var templates = {
            mulebuy: function (id) { return 'https://mulebuy.com/product/?shop_type=weidian&id=' + id + '&ref=200642502'; },
            oopbuy: function (id) { return 'https://oopbuy.com/product/weidian/' + id + '?inviteCode=GH40R4J0O'; },
            superbuy: function (id) { return 'https://www.superbuy.com/en/page/buy/?nTag=Home-search&from=search-input&partnercode=Ey3NrI&url=https%3A%2F%2Fweidian.com%2Fitem.html%3FitemID%3D' + id + '&trackPayload=pc_header_search_goods'; }
        };

        var items = '';
        for (var i = 0; i < agents.length; i++) {
            var a = agents[i];
            var url = product.links[a.key];
            if (!url && weidianId && templates[a.key]) url = templates[a.key](weidianId);
            if (!url) continue;
            var msg = agentMessages[a.key] ? agentMessages[a.key].text : '';
            items += '<a href="' + url + '" class="agent-drop-item ' + a.cls + '" target="_blank" rel="noopener noreferrer">' +
                '<img src="' + catalogAgents[a.agentKey].logo + '" class="agent-logo-small" alt="Buy at ' + catalogAgents[a.agentKey].name + '">' +
                '<span class="agent-drop-name">' + catalogAgents[a.agentKey].name + '</span>' +
                '<span class="agent-drop-msg">' + msg + '</span>' +
            '</a>';
        }
        if (!items) return '';

        var pid = product.id ? product.id.replace(/[^a-zA-Z0-9]/g, '') : 'x';
        return '<div class="agent-buy-wrap">' +
            '<button type="button" class="agent-buy-btn" aria-expanded="false" aria-controls="drop-' + pid + '">Buy ▾</button>' +
            '<div class="agent-dropdown" id="drop-' + pid + '" role="menu">' + items + '</div>' +
        '</div>';
    }

    /* ---- LAZY IMAGE LOADING ---- */
    function initLazyImages(root) {
        var images = root.querySelectorAll('.product-image[data-loaded="false"]');
        for (var i = 0; i < images.length; i++) {
            (function (img) {
                if (img.complete && img.naturalWidth > 0) {
                    img.setAttribute('data-loaded', 'true');
                    return;
                }
                img.addEventListener('load', function () {
                    img.setAttribute('data-loaded', 'true');
                }, { once: true });
                img.addEventListener('error', function () {
                    img.style.display = 'none';
                    var fallback = img.nextElementSibling;
                    if (fallback) fallback.style.display = 'flex';
                }, { once: true });
            })(images[i]);
        }
    }

    /* ---- INTERSECTION OBSERVER FOR PROGRESSIVE LOADING ---- */
    function initIntersectionObserver() {
        if (!('IntersectionObserver' in window)) return;
        var observer = new IntersectionObserver(function (entries) {
            for (var i = 0; i < entries.length; i++) {
                if (entries[i].isIntersecting) {
                    var card = entries[i].target;
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                    observer.unobserve(card);
                }
            }
        }, { threshold: 0.05, rootMargin: '50px' });

        var cards = document.querySelectorAll('.product-card');
        for (var j = 0; j < cards.length; j++) {
            observer.observe(cards[j]);
        }
    }

    /* ---- 3D TILT + CURSOR SPOTLIGHT ---- */
    var tiltConfig = {
        max: 8,
        perspective: 800,
        scale: 1.03,
        speed: 400,
        glare: true,
        maxGlare: 0.15
    };

    function initTiltEffect(root) {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        var cards = root.querySelectorAll('[data-tilt]');
        for (var i = 0; i < cards.length; i++) {
            (function (card) {
                card.addEventListener('mouseenter', handleTiltEnter);
                card.addEventListener('mousemove', handleTiltMove);
                card.addEventListener('mouseleave', handleTiltLeave);
            })(cards[i]);
        }
    }

    function handleTiltEnter(e) {
        this.classList.add('card-tilting');
        this.classList.remove('card-reset');
        this.style.transition = 'box-shadow 0.15s ease, border-color 0.3s ease';
    }

    function handleTiltMove(e) {
        var card = this;
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var centerX = rect.width / 2;
        var centerY = rect.height / 2;
        var rotateX = ((y - centerY) / centerY) * -tiltConfig.max;
        var rotateY = ((x - centerX) / centerX) * tiltConfig.max;

        var pctX = (x / rect.width) * 100;
        var pctY = (y / rect.height) * 100;

        card.style.transform = 'perspective(' + tiltConfig.perspective + 'px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale3d(' + tiltConfig.scale + ',' + tiltConfig.scale + ',' + tiltConfig.scale + ')';

        var shine = card.querySelector('.card-shine');
        if (shine) {
            shine.style.setProperty('--mx', pctX + '%');
            shine.style.setProperty('--my', pctY + '%');
        }

        var glow = card.querySelector('.card-border-glow');
        if (glow) {
            glow.style.setProperty('--mx', pctX + '%');
            glow.style.setProperty('--my', pctY + '%');
        }
    }

    function handleTiltLeave(e) {
        var card = this;
        card.classList.remove('card-tilting');
        card.classList.add('card-reset');
        card.style.transform = 'perspective(' + tiltConfig.perspective + 'px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
        card.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.5s ease, border-color 0.3s ease';

        var shine = card.querySelector('.card-shine');
        if (shine) shine.style.opacity = '0';

        var glow = card.querySelector('.card-border-glow');
        if (glow) glow.style.opacity = '0';

        setTimeout(function () {
            card.classList.remove('card-reset');
            card.style.transition = 'box-shadow 0.4s ease, border-color 0.4s ease, transform 0.4s ease';
        }, 500);
    }

    /* ---- LIKE BUTTONS ---- */
    function initLikeButtons(root) {
        var likeEls = root.querySelectorAll('.product-likes');
        for (var i = 0; i < likeEls.length; i++) {
            (function (el) {
                el.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    handleLike(el);
                });
                el.addEventListener('keydown', function (e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleLike(el);
                    }
                });
            })(likeEls[i]);
        }
    }

    /* ---- BUY BUTTON DROPDOWN ---- */
    function initBuyButtons(root) {
        var wraps = root.querySelectorAll('.agent-buy-wrap');
        for (var i = 0; i < wraps.length; i++) {
            (function (wrap) {
                var btn = wrap.querySelector('.agent-buy-btn');
                var drop = wrap.querySelector('.agent-dropdown');
                if (!btn || !drop) return;
                btn.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    var open = wrap.classList.toggle('open');
                    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
                });
                document.addEventListener('click', function (e) {
                    if (!wrap.contains(e.target)) {
                        wrap.classList.remove('open');
                        btn.setAttribute('aria-expanded', 'false');
                    }
                });
            })(wraps[i]);
        }
    }

    function handleLike(el) {
        var productId = el.getAttribute('data-product-id');
        if (!productId) return;

        var baseLikes = 0;
        var allProducts = getAllProducts();
        for (var i = 0; i < allProducts.length; i++) {
            if (allProducts[i].id === productId) {
                baseLikes = allProducts[i].likes || 0;
                break;
            }
        }

        var isLiked = !!state.likedProducts[productId];
        var countEl = el.querySelector('.like-count');
        var iconEl = el.querySelector('.like-icon');

        if (isLiked) {
            delete state.likedProducts[productId];
            state.likedCounts[productId] = (state.likedCounts[productId] || 0) - 1;
            el.classList.remove('liked');
            iconEl.textContent = '\uD83D\uDC99';
        } else {
            state.likedProducts[productId] = true;
            state.likedCounts[productId] = (state.likedCounts[productId] || 0) + 1;
            el.classList.add('liked');
            iconEl.textContent = '\u2764\uFE0F';
        }

        countEl.textContent = baseLikes + (state.likedCounts[productId] || 0);

        localStorage.setItem('likedProducts', JSON.stringify(state.likedProducts));
        localStorage.setItem('likedCounts', JSON.stringify(state.likedCounts));

        el.style.transform = 'scale(1.3)';
        setTimeout(function () { el.style.transform = 'scale(1)'; }, 200);
    }

    /* ---- PAGINATION ---- */
    function renderPagination(totalPages) {
        var pagination = document.getElementById('pagination');
        if (!pagination) return;

        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        var html = '<button class="page-btn" data-page="' + (state.currentPage - 1) + '"' + (state.currentPage === 1 ? ' disabled' : '') + '>' +
            '\u2190 Previous</button>';

        var maxPagesToShow = 5;
        var startPage = Math.max(1, state.currentPage - Math.floor(maxPagesToShow / 2));
        var endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        if (endPage - startPage < maxPagesToShow - 1) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        if (startPage > 1) {
            html += '<button class="page-btn" data-page="1">1</button>';
            if (startPage > 2) html += '<span class="page-info">...</span>';
        }

        for (var i = startPage; i <= endPage; i++) {
            html += '<button class="page-btn' + (i === state.currentPage ? ' active' : '') + '" data-page="' + i + '">' + i + '</button>';
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) html += '<span class="page-info">...</span>';
            html += '<button class="page-btn" data-page="' + totalPages + '">' + totalPages + '</button>';
        }

        html += '<button class="page-btn" data-page="' + (state.currentPage + 1) + '"' + (state.currentPage === totalPages ? ' disabled' : '') + '>' +
            'Next \u2192</button>';

        pagination.innerHTML = html;

        var btns = pagination.querySelectorAll('.page-btn');
        for (var j = 0; j < btns.length; j++) {
            (function (btn) {
                btn.addEventListener('click', function () {
                    if (btn.disabled) return;
                    state.currentPage = parseInt(btn.getAttribute('data-page'), 10);
                    renderProducts();
                });
            })(btns[j]);
        }
    }

    /* ---- CATEGORY COUNTS ---- */
    function updateCategoryCounts() {
        var categories = {};
        var validProducts = getAllProducts();

        for (var i = 0; i < validProducts.length; i++) {
            var cat = (validProducts[i].category || 'OTHER').toUpperCase();
            categories[cat] = (categories[cat] || 0) + 1;
        }

        var allCountEl = document.getElementById('count-all');
        if (allCountEl) allCountEl.textContent = '(' + validProducts.length + ')';

        var keys = Object.keys(categories);
        for (var j = 0; j < keys.length; j++) {
            var countEl = document.getElementById('count-' + keys[j]);
            if (countEl) countEl.textContent = '(' + categories[keys[j]] + ')';
        }
    }

    /* ---- BRAND FILTERS (only top ~20 brands) ---- */
    var topBrands = [
        'Nike', 'Jordan', 'Adidas', 'Yeezy', 'Dior', 'Balenciaga',
        'Louis Vuitton', 'Gucci', 'Prada', 'Versace', 'Burberry',
        'Moncler', 'Stone Island', 'Ralph Lauren', 'Supreme',
        'Essentials', 'Bape', 'New Balance', 'Asics', 'Converse',
        'Crocs', 'Stussy', 'Gallery Dept', 'Palm Angels', 'Off-White'
    ];

    function buildBrandFilters() {
        var brandContainer = document.getElementById('brandFilters');
        if (!brandContainer) return;

        var brands = {};
        var validProducts = getAllProducts();

        for (var i = 0; i < validProducts.length; i++) {
            var brand = (validProducts[i].brand || '').trim();
            if (!brand) continue;
            brands[brand] = (brands[brand] || 0) + 1;
        }

        if (Object.keys(brands).length === 0) {
            brandContainer.style.display = 'none';
            return;
        }

        var html = '<button class="brand-btn active" data-brand="all">All (' + validProducts.length + ')</button>';
        for (var t = 0; t < topBrands.length; t++) {
            var brandName = topBrands[t];
            if (brands[brandName]) {
                html += '<button class="brand-btn" data-brand="' + escapeHtml(brandName) + '">' + escapeHtml(brandName) + ' (' + brands[brandName] + ')</button>';
            }
        }

        brandContainer.innerHTML = html;

        var btns = brandContainer.querySelectorAll('.brand-btn');
        for (var j = 0; j < btns.length; j++) {
            (function (btn) {
                btn.addEventListener('click', function () {
                    var allBtns = brandContainer.querySelectorAll('.brand-btn');
                    for (var k = 0; k < allBtns.length; k++) allBtns[k].classList.remove('active');
                    btn.classList.add('active');
                    state.currentBrand = btn.getAttribute('data-brand');
                    state.currentPage = 1;
                    renderProducts();
                });
            })(btns[j]);
        }
    }

    /* ---- GENDER FILTERS ---- */
    function bindGenderButtons() {
        var btns = document.querySelectorAll('.gender-btn');
        for (var i = 0; i < btns.length; i++) {
            (function (btn) {
                btn.addEventListener('click', function () {
                    var allBtns = document.querySelectorAll('.gender-btn');
                    for (var j = 0; j < allBtns.length; j++) allBtns[j].classList.remove('active');
                    btn.classList.add('active');
                    state.currentGender = btn.getAttribute('data-gender');
                    state.currentPage = 1;
                    renderProducts();
                });
            })(btns[i]);
        }
    }

    /* ---- SORT SELECT ---- */
    function bindSortSelect() {
        var sel = document.getElementById('sortSelect');
        if (!sel) return;
        sel.addEventListener('change', function () {
            state.currentSort = sel.value;
            state.currentPage = 1;
            renderProducts();
        });
    }

    /* ---- EVENT BINDINGS ---- */
    function bindCategoryButtons() {
        var btns = document.querySelectorAll('.category-btn');
        for (var i = 0; i < btns.length; i++) {
            (function (btn) {
                btn.addEventListener('click', function () {
                    var allBtns = document.querySelectorAll('.category-btn');
                    for (var j = 0; j < allBtns.length; j++) allBtns[j].classList.remove('active');
                    btn.classList.add('active');
                    state.currentCategory = btn.getAttribute('data-category');
                    state.currentPage = 1;

                    var brandBtns = document.querySelectorAll('.brand-btn');
                    if (brandBtns.length > 0) {
                        for (var k = 0; k < brandBtns.length; k++) brandBtns[k].classList.toggle('active', k === 0);
                        state.currentBrand = 'all';
                    }

                    renderProducts();
                });
            })(btns[i]);
        }
    }

    function bindSearchInput() {
        var searchInput = document.getElementById('searchInput');
        if (!searchInput) return;

        var fuzzyCheckbox = document.getElementById('fuzzyToggle');
        if (fuzzyCheckbox) {
            fuzzyCheckbox.addEventListener('change', function () {
                state.fuzzyEnabled = fuzzyCheckbox.checked;
                state.currentPage = 1;
                renderProducts();
            });
        }

        var debouncedSearch = debounce(function () {
            state.searchQuery = searchInput.value.trim().toLowerCase();
            state.currentPage = 1;
            renderProducts();
        }, DEBOUNCE_MS);

        searchInput.addEventListener('input', debouncedSearch);
    }



    /* ---- INIT ---- */
    function init() {
        var container = document.getElementById('productsContainer');
        if (!container) return;

        renderSkeletons(32, container);

        function initWithData(data) {
            _allProducts = data.filter(hasImage);
            state.isFirstRender = false;
            initFuse(_allProducts);
            updateCategoryCounts();
            buildBrandFilters();
            renderProducts();
            bindCategoryButtons();
            bindSearchInput();
            bindGenderButtons();
            bindSortSelect();
            
        }

        function showLoadError(err) {
            console.error('Catalog load error:', err);
            if (container) {
                container.innerHTML = '<div class="no-results"><h3>Error loading products</h3>' +
                    '<p>The product catalog could not be loaded. Please refresh the page.</p>' +
                    '<p style="font-size:13px;color:#888;margin-top:10px">If this persists, contact support.</p></div>';
            }
        }

        // Products are embedded in the page as <script id="catalogData" type="application/json">.
        // No fetch needed — works with double-click (file://) and over HTTP.
        try {
            var rawData = document.getElementById('catalogData');
            var parsed = rawData ? JSON.parse(rawData.textContent) : [];
            initWithData(parsed);
        } catch (e) {
            showLoadError(e);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();