(function () {
    'use strict';

    var catalogAgents = {
        'KAKOBUY': { name: 'Kakobuy', logo: 'images/kakobuy-logo.jpg' },
        'LITBUY': { name: 'Litbuy', logo: 'images/litbuy-logo.webp' },
        'USFANS': { name: 'USFans', logo: 'https://s3-eu-west-1.amazonaws.com/tpd/logos/6825a376b16be873d3c23e82/0x0.png' }
    };

    var agentMessages = {
        usfans: { text: '\u{1F1FA}\u{1F1F8} Best for USA & Europe', recommended: true },
        litbuy: { text: '\u{1F381} $500 in Coupons', recommended: false },
        kakobuy: { text: '\u26A1 Fast & Secure Shipping', recommended: false }
    };

    var likedProducts = JSON.parse(localStorage.getItem('likedProducts') || '{}');
    var likedCounts = JSON.parse(localStorage.getItem('likedCounts') || '{}');

    // Populated once loadProductData() resolves \u2014 holds only the products
    // belonging to this item's category (not the whole catalog).
    var products = null;

    function getProductIdFromUrl() {
        var params = new URLSearchParams(window.location.search);
        if (params.get('id')) return params.get('id');
        var m = window.location.pathname.match(/\/product\/([^/]+)\/?/);
        return m ? m[1] : null;
    }

    function findProduct(id) {
        if (!products) return null;
        for (var i = 0; i < products.length; i++) {
            if (products[i].id === id) return products[i];
        }
        return null;
    }

    /* ---- DATA LOADING ----
       Instead of shipping the full ~8MB catalog to every product page,
       we fetch a small id->category index, then only the one category
       chunk (data/<CATEGORY>.json) that actually contains this product.
       Each fetch is retried once with a cache-busting param before failing,
       since a truncated/corrupt transfer is the main failure mode for a
       large file served over flaky connections. */
    function fetchJsonWithRetry(url, attempt) {
        attempt = attempt || 1;
        var bustUrl = attempt === 1 ? url : url + (url.indexOf('?') === -1 ? '?' : '&') + 'retry=' + Date.now();
        return fetch(bustUrl, { cache: attempt === 1 ? 'default' : 'reload' }).then(function (r) {
            if (!r.ok) throw new Error('HTTP ' + r.status + ' for ' + url);
            return r.json();
        }).catch(function (err) {
            if (attempt >= 2) throw err;
            return fetchJsonWithRetry(url, attempt + 1);
        });
    }

    function loadProductData(id) {
        return fetchJsonWithRetry('/data/product-index.json').then(function (index) {
            var category = index[id];
            if (!category) throw new Error('Product id not found in index: ' + id);
            return fetchJsonWithRetry('/data/' + encodeURIComponent(category) + '.json');
        }).then(function (categoryProducts) {
            products = categoryProducts;
            return products;
        });
    }

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function buildAgentLinks(product) {
        var html = '';
        if (!product.links) return html;

        var agents = [
            { key: 'usfans', cls: 'usfans-btn', agentKey: 'USFANS' },
            { key: 'litbuy', cls: 'litbuy-btn', agentKey: 'LITBUY' },
            { key: 'kakobuy', cls: 'kakobuy-btn', agentKey: 'KAKOBUY' }
        ];

        for (var i = 0; i < agents.length; i++) {
            var a = agents[i];
            if (product.links[a.key]) {
                var msg = agentMessages[a.key].text;
                var rec = agentMessages[a.key].recommended ? ' recommended' : '';
                html += '<a href="' + escapeHtml(product.links[a.key]) + '" class="agent-buy-btn ' + a.cls + rec + '" target="_blank" rel="noopener noreferrer">' +
                    '<img src="' + escapeHtml(catalogAgents[a.agentKey].logo) + '" class="agent-logo-small" alt="Buy at ' + escapeHtml(catalogAgents[a.agentKey].name) + '">' +
                    'Buy at ' + escapeHtml(catalogAgents[a.agentKey].name) + ' ' + escapeHtml(msg) +
                    '</a>';
            }
        }
        return html;
    }

    function buildSpecs(product) {
        var specs = [
            { label: 'Category', value: product.category },
            { label: 'Brand', value: product.brand || 'N/A' },
            { label: 'Gender', value: (product.gender || 'unisex').charAt(0).toUpperCase() + (product.gender || 'unisex').slice(1) },
            { label: 'Price', value: '$' + product.price }
        ];
        if (product.subcategory) specs.splice(1, 0, { label: 'Subcategory', value: product.subcategory });
        if (product.tags && product.tags.length) specs.push({ label: 'Tags', value: product.tags.join(', ') });

        return specs.map(function(s) {
            return '<dt>' + escapeHtml(s.label) + '</dt><dd>' + escapeHtml(s.value) + '</dd>';
        }).join('');
    }

    function updateSchema(product) {
        var schema = {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name,
            "description": product.description,
            "image": product.image,
            "brand": { "@type": "Brand", "name": product.brand || 'Unknown' },
            "category": product.category,
            "offers": {
                "@type": "AggregateOffer",
                "priceCurrency": "USD",
                "lowPrice": parseFloat(product.price),
                "highPrice": parseFloat(product.price),
                "availability": "https://schema.org/InStock",
                "seller": { "@type": "Organization", "name": "ChinaBuyHub (via verified agents)" }
            }
        };
        var schemaEl = document.getElementById('productSchema');
        if (schemaEl) schemaEl.textContent = JSON.stringify(schema, null, 2);
    }

    function renderProduct(product) {
        document.title = escapeHtml(product.name) + ' | ChinaBuyHub';
        document.querySelector('meta[property="og:title"]').setAttribute('content', escapeHtml(product.name) + ' | ChinaBuyHub');
        document.querySelector('meta[property="og:description"]').setAttribute('content', escapeHtml(product.description || 'Premium product from ChinaBuyHub catalog'));
        document.querySelector('meta[property="og:image"]').setAttribute('content', product.image);
        document.querySelector('meta[property="og:url"]').setAttribute('content', window.location.href);
        document.querySelector('meta[name="twitter:title"]').setAttribute('content', escapeHtml(product.name) + ' | ChinaBuyHub');
        document.querySelector('meta[name="twitter:description"]').setAttribute('content', escapeHtml(product.description || 'Premium product from ChinaBuyHub catalog'));
        document.querySelector('meta[name="twitter:image"]').setAttribute('content', product.image);
        document.querySelector('link[rel="canonical"]').setAttribute('href', window.location.href);

        document.getElementById('breadcrumbCategory').textContent = product.category;
        document.getElementById('breadcrumbName').textContent = product.name;

        var mainImg = document.getElementById('mainImage');
        mainImg.src = product.image;
        mainImg.alt = escapeHtml(product.name);
        mainImg.onerror = function() {
            this.style.display = 'none';
            this.nextElementSibling.style.display = 'flex';
        };

        document.getElementById('productCategory').textContent = product.category;
        document.getElementById('productName').textContent = product.name;
        document.getElementById('productDescription').textContent = product.description || '';
        document.getElementById('productPrice').textContent = '$' + product.price;

        var badgesContainer = document.getElementById('productBadges');
        if (product.badge) {
            badgesContainer.innerHTML = '<span class="product-badge badge-' + product.badge.toLowerCase() + '">' + escapeHtml(product.badge) + '</span>';
        }

        var isLiked = !!likedProducts[product.id];
        var displayLikes = (product.likes || 0) + (likedCounts[product.id] || 0) + (isLiked ? 1 : 0);
        var likesEl = document.getElementById('productLikes');
        likesEl.dataset.productId = productId = product.id;
        likesEl.classList.toggle('liked', isLiked);
        likesEl.querySelector('.like-icon').textContent = isLiked ? '\u2764\uFE0F' : '\uD83D\uDC99';
        likesEl.querySelector('.like-count').textContent = displayLikes;

        document.getElementById('agentLinks').innerHTML = buildAgentLinks(product);
        document.getElementById('productSpecs').innerHTML = buildSpecs(product);

        updateSchema(product);

        initLikeButton(likesEl, product);
        loadRelatedProducts(product);

        document.getElementById('productLoading').hidden = true;
        document.getElementById('productDetail').hidden = false;
    }

    function initLikeButton(el, product) {
        el.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            handleLike(el, product);
        });
        el.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleLike(el, product);
            }
        });
    }

    function handleLike(el, product) {
        var productId = product.id;
        var baseLikes = product.likes || 0;
        var isLiked = !!likedProducts[productId];
        var countEl = el.querySelector('.like-count');
        var iconEl = el.querySelector('.like-icon');

        if (isLiked) {
            delete likedProducts[productId];
            likedCounts[productId] = (likedCounts[productId] || 0) - 1;
            el.classList.remove('liked');
            iconEl.textContent = '\uD83D\uDC99';
        } else {
            likedProducts[productId] = true;
            likedCounts[productId] = (likedCounts[productId] || 0) + 1;
            el.classList.add('liked');
            iconEl.textContent = '\u2764\uFE0F';
        }

        countEl.textContent = baseLikes + (likedCounts[productId] || 0);
        localStorage.setItem('likedProducts', JSON.stringify(likedProducts));
        localStorage.setItem('likedCounts', JSON.stringify(likedCounts));

        el.style.transform = 'scale(1.3)';
        setTimeout(function () { el.style.transform = 'scale(1)'; }, 200);
    }

    function loadRelatedProducts(product) {
        if (!products) return;
        var sameCategory = products.filter(function(p) {
            return p.category === product.category && p.id !== product.id && p.image && p.image.indexOf('http') === 0;
        });
        sameCategory.sort(function() { return Math.random() - 0.5; });
        var related = sameCategory.slice(0, 4);

        var container = document.getElementById('relatedProducts');
        container.innerHTML = related.map(function(p) {
            var linksHtml = buildAgentLinks(p);
            return '<div class="related-card">' +
                '<img src="' + escapeHtml(p.image) + '" alt="' + escapeHtml(p.name) + '" class="related-image" loading="lazy">' +
                '<div class="related-info">' +
                    '<h3 class="related-name">' + escapeHtml(p.name) + '</h3>' +
                    '<span class="related-price">$' + p.price + '</span>' +
                    '<div class="related-links">' + linksHtml + '</div>' +
                '</div>' +
                '<a href="/product/' + p.id + '" class="related-overlay" aria-label="View ' + escapeHtml(p.name) + '"></a>' +
            '</div>';
        }).join('');
    }

    function showError(message) {
        document.getElementById('productLoading').innerHTML =
            '<div class="no-results"><h3>Error loading product</h3><p>' + message + ' <a href="/catalog">Back to catalog</a></p></div>';
    }

    function init() {
        var productId = getProductIdFromUrl();
        if (!productId) {
            document.getElementById('productLoading').innerHTML = '<div class="no-results"><h3>Product not specified</h3><p>No product ID provided. <a href="/catalog">Browse catalog</a></p></div>';
            return;
        }

        loadProductData(productId).then(function () {
            var product = findProduct(productId);
            if (!product) {
                document.getElementById('productLoading').innerHTML = '<div class="no-results"><h3>Product not found</h3><p>Product ID "' + escapeHtml(productId) + '" not found. <a href="/catalog">Browse catalog</a></p></div>';
                return;
            }
            renderProduct(product);
        }).catch(function (err) {
            console.error('Product load error:', err);
            showError('The product catalog could not be loaded.');
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();