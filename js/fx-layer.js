/* ============================================
   ChinaBuyHub — Advanced Visual Effects Layer
   Replace bg-animation.js with comprehensive FX:
   cursor, particles, orbs, card tilt, magnetic
   buttons, scroll reveal, counters, glitch,
   marquee, copy-to-clipboard, navbar scroll
   ============================================ */

(function () {
    'use strict';

    var isMobile = window.matchMedia('(max-width: 768px)').matches;
    var isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var mouseX = 0, mouseY = 0;
    var particleMouseX = -1000, particleMouseY = -1000;

    /* ============================================
       1. CUSTOM MAGNETIC CURSOR
       ============================================ */
    function initCursor() {
        if (isMobile || isTouch) {
            document.body.style.cursor = 'auto';
            return;
        }
        document.body.style.cursor = 'none';

        var dot = document.createElement('div');
        dot.className = 'fx-cursor-dot';
        var ring = document.createElement('div');
        ring.className = 'fx-cursor-ring';
        var trail = document.createElement('div');
        trail.className = 'fx-cursor-trail';

        document.body.appendChild(dot);
        document.body.appendChild(ring);
        document.body.appendChild(trail);

        var ringX = 0, ringY = 0;
        var trailX = 0, trailY = 0;

        document.addEventListener('mousemove', function (e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
            dot.style.transform = 'translate(' + (mouseX - 3) + 'px, ' + (mouseY - 3) + 'px)';
        });

        function animateCursor() {
            ringX += (mouseX - ringX) * 0.13;
            ringY += (mouseY - ringY) * 0.13;
            trailX += (mouseX - trailX) * 0.055;
            trailY += (mouseY - trailY) * 0.055;

            ring.style.transform = 'translate(' + (ringX - 19) + 'px, ' + (ringY - 19) + 'px)';
            trail.style.transform = 'translate(' + (trailX - 45) + 'px, ' + (trailY - 45) + 'px)';
        }

        function onHoverEnter() {
            dot.classList.add('fx-cursor-hover');
            ring.classList.add('fx-cursor-hover');
        }

        function onHoverLeave() {
            dot.classList.remove('fx-cursor-hover');
            ring.classList.remove('fx-cursor-hover');
        }

        function bindHoverTargets() {
            var targets = document.querySelectorAll('a, button, .card, .product-card, .testimonial-card, .agent-card, .btn-primary, .btn-secondary, .btn-cta-main, .agent-buy-btn');
            for (var i = 0; i < targets.length; i++) {
                var el = targets[i];
                if (el._fxCursorBound) continue;
                el._fxCursorBound = true;
                el.addEventListener('mouseenter', onHoverEnter);
                el.addEventListener('mouseleave', onHoverLeave);
            }
        }

        bindHoverTargets();

        var cursorObserver = new MutationObserver(function () {
            bindHoverTargets();
        });
        cursorObserver.observe(document.body, { childList: true, subtree: true });

        return { animate: animateCursor, bindHoverTargets: bindHoverTargets };
    }

    /* ============================================
       2. INTERACTIVE PARTICLE CANVAS
       ============================================ */
    function initParticleCanvas() {
        if (prefersReduced) return null;
        if (isMobile) return null;

        var canvas = document.createElement('canvas');
        canvas.id = 'pc';
        document.body.appendChild(canvas);
        var ctx = canvas.getContext('2d');
        var w, h;

        var Particle = function () {
            this.x = Math.random() * (w || window.innerWidth);
            this.y = Math.random() * (h || window.innerHeight);
            this.vx = (Math.random() - 0.5) * 0.9;
            this.vy = (Math.random() - 0.5) * 0.9;
            this.size = Math.random() * 1.6 + 0.4;
            var colorRoll = Math.random();
            if (colorRoll < 0.4) {
                this.r = 255; this.g = 255; this.b = 255;
            } else if (colorRoll < 0.7) {
                this.r = 255; this.g = 0; this.b = 110;
            } else {
                this.r = 255; this.g = 140; this.b = 0;
            }
            this.alpha = Math.random() * 0.5 + 0.3;
        };

        Particle.prototype.update = function () {
            if (!isMobile && !isTouch) {
                var dx = this.x - particleMouseX;
                var dy = this.y - particleMouseY;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 130 && dist > 0) {
                    var force = (130 - dist) / 130;
                    this.vx += (dx / dist) * force * 0.6;
                    this.vy += (dy / dist) * force * 0.6;
                }
            }

            this.vx *= 0.999;
            this.vy *= 0.999;
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < -20) this.x = w + 20;
            if (this.x > w + 20) this.x = -20;
            if (this.y < -20) this.y = h + 20;
            if (this.y > h + 20) this.y = -20;
        };

        Particle.prototype.draw = function () {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + this.alpha + ')';
            ctx.fill();
        };

        var particles = [];
        for (var i = 0; i < 90; i++) {
            particles.push(new Particle());
        }

        function resize() {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        }

        function drawConnections() {
            for (var i = 0; i < particles.length; i++) {
                for (var j = i + 1; j < particles.length; j++) {
                    var dx = particles[i].x - particles[j].x;
                    var dy = particles[i].y - particles[j].y;
                    var dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 125) {
                        var alpha = (1 - dist / 125) * 0.14;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = 'rgba(255, 0, 110, ' + alpha + ')';
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        }

        function draw() {
            ctx.clearRect(0, 0, w, h);
            drawConnections();
            for (var i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
            }
        }

        document.addEventListener('mousemove', function (e) {
            particleMouseX = e.clientX;
            particleMouseY = e.clientY;
        });

        window.addEventListener('resize', resize);
        resize();

        return { draw: draw };
    }

    /* ============================================
       3. ANIMATED GRADIENT ORBS CONTAINER
       ============================================ */
    function injectOrbsContainer() {
        if (prefersReduced) return;
        var container = document.createElement('div');
        container.className = 'fx-orbs-container';
        container.setAttribute('aria-hidden', 'true');

        var orb1 = document.createElement('div');
        orb1.className = 'fx-orb fx-orb--1';
        var orb2 = document.createElement('div');
        orb2.className = 'fx-orb fx-orb--2';
        var orb3 = document.createElement('div');
        orb3.className = 'fx-orb fx-orb--3';

        container.appendChild(orb1);
        container.appendChild(orb2);
        container.appendChild(orb3);
        document.body.appendChild(container);
    }

    /* ============================================
       5. 3D PERSPECTIVE CARD TILT
       (applied to non-catalog cards only)
       ============================================ */
    function initCardTilt() {
        if (prefersReduced) return;
        if (isMobile || isTouch) return;

        function applyTiltToCards() {
            var cards = document.querySelectorAll(
                '.testimonial-card, .agent-card, .feature-card, .review-card, .comparison-card, .step-card, .guide-card'
            );
            for (var i = 0; i < cards.length; i++) {
                var card = cards[i];
                if (card._fxTilt) continue;
                card._fxTilt = true;
                card.classList.add('card-tilt');

                var shine = document.createElement('div');
                shine.className = 'shine';
                card.appendChild(shine);

                function applyTilt(e) {
                    var rect = card.getBoundingClientRect();
                    var clientX, clientY;
                    if (e.touches) {
                        clientX = e.touches[0].clientX;
                        clientY = e.touches[0].clientY;
                    } else {
                        clientX = e.clientX;
                        clientY = e.clientY;
                    }
                    var x = clientX - rect.left;
                    var y = clientY - rect.top;
                    var cx = rect.width / 2;
                    var cy = rect.height / 2;
                    var rx = ((y - cy) / cy) * -13;
                    var ry = ((x - cx) / cx) * 13;
                    var pctX = (x / rect.width) * 100;
                    var pctY = (y / rect.height) * 100;

                    card.style.transform = 'perspective(900px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateZ(12px)';

                    var shineEl = card.querySelector('.shine');
                    if (shineEl) {
                        shineEl.style.setProperty('--mx', pctX + '%');
                        shineEl.style.setProperty('--my', pctY + '%');
                    }
                }

                function resetTilt() {
                    card.classList.add('card-tilt-reset');
                    card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)';
                    setTimeout(function () {
                        card.classList.remove('card-tilt-reset');
                        card.style.transition = 'box-shadow 0.4s ease, border-color 0.4s ease, transform 0.4s ease';
                    }, 650);
                }

                card.addEventListener('mouseenter', function () {
                    card.style.transition = 'box-shadow 0.15s ease, border-color 0.3s ease';
                });

                card.addEventListener('mousemove', applyTilt);
                card.addEventListener('mouseleave', resetTilt);

                card.addEventListener('touchmove', function (e) {
                    applyTilt(e);
                }, { passive: true });
                card.addEventListener('touchend', resetTilt);
                card.addEventListener('touchcancel', resetTilt);
            }
        }

        applyTiltToCards();
        var tiltObserver = new MutationObserver(function () {
            applyTiltToCards();
        });
        tiltObserver.observe(document.body, { childList: true, subtree: true });
    }

    /* ============================================
       6. MAGNETIC BUTTONS
       ============================================ */
    function initMagneticButtons() {
        if (prefersReduced) return;
        if (isMobile || isTouch) return;

        function bindMagnets() {
            var btns = document.querySelectorAll('.btn-primary, .btn-cta-main, .btn-secondary, .sticky-btn, .btn-magnetic');
            for (var i = 0; i < btns.length; i++) {
                var btn = btns[i];
                if (btn._fxMagnet) continue;
                btn._fxMagnet = true;
                btn.classList.add('btn-magnetic');

                function applyMagnet(e) {
                    var rect = btn.getBoundingClientRect();
                    var clientX, clientY;
                    if (e.touches) {
                        clientX = e.touches[0].clientX;
                        clientY = e.touches[0].clientY;
                    } else {
                        clientX = e.clientX;
                        clientY = e.clientY;
                    }
                    var dx = clientX - (rect.left + rect.width / 2);
                    var dy = clientY - (rect.top + rect.height / 2);
                    var maxDist = Math.max(rect.width, rect.height) * 0.9;
                    var dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < maxDist) {
                        btn.style.transform = 'translate(' + (dx * 0.45).toFixed(1) + 'px, ' + (dy * 0.45).toFixed(1) + 'px)';
                    }
                }

                function resetMagnet() {
                    btn.style.transform = 'translate(0px, 0px)';
                }

                if (!isMobile && !isTouch) {
                    btn.addEventListener('mousemove', applyMagnet);
                    btn.addEventListener('mouseleave', resetMagnet);
                }

                btn.addEventListener('touchmove', function (e) {
                    applyMagnet(e);
                }, { passive: true });

                btn.addEventListener('touchend', resetMagnet);
                btn.addEventListener('touchcancel', resetMagnet);
            }
        }

        bindMagnets();
        var magnetObserver = new MutationObserver(function () {
            bindMagnets();
        });
        magnetObserver.observe(document.body, { childList: true, subtree: true });
    }

    /* ============================================
       7. SCROLL REVEAL ANIMATIONS
       ============================================ */
    function initScrollReveal() {
        if (!('IntersectionObserver' in window)) return;

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var delay = entry.target.getAttribute('data-delay');
                    if (delay) {
                        setTimeout(function () {
                            entry.target.classList.add('visible');
                        }, parseInt(delay, 10));
                    } else {
                        entry.target.classList.add('visible');
                    }
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        function observeElements() {
            var targets = document.querySelectorAll('.reveal, .fx-reveal');
            for (var i = 0; i < targets.length; i++) {
                if (targets[i]._fxReveal) continue;
                targets[i]._fxReveal = true;
                observer.observe(targets[i]);
            }

            var headings = document.querySelectorAll('section h1, section h2, section h3');
            for (var j = 0; j < headings.length; j++) {
                if (headings[j]._fxReveal) continue;
                headings[j]._fxReveal = true;
                if (headings[j].classList.contains('reveal') || headings[j].classList.contains('fx-reveal')) continue;
                headings[j].classList.add('fx-reveal');
                observer.observe(headings[j]);
            }

            var cards = document.querySelectorAll('.card, .product-card, .testimonial-card, .agent-card');
            for (var k = 0; k < cards.length; k++) {
                if (cards[k]._fxReveal) continue;
                cards[k]._fxReveal = true;
                if (cards[k].classList.contains('reveal') || cards[k].classList.contains('fx-reveal')) continue;
                cards[k].classList.add('fx-reveal');
                observer.observe(cards[k]);
            }
        }

        observeElements();
        var revealObserver = new MutationObserver(function () {
            observeElements();
        });
        revealObserver.observe(document.body, { childList: true, subtree: true });
    }

    /* ============================================
       8. ANIMATED STAT COUNTERS
       ============================================ */
    function initCounters() {
        if (!('IntersectionObserver' in window)) return;

        var counters = document.querySelectorAll('[data-target]');
        if (counters.length === 0) return;

        function easeOutCubic(t) {
            return 1 - Math.pow(1 - t, 3);
        }

        var counterObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var el = entry.target;
                    if (el._fxCounted) return;
                    el._fxCounted = true;

                    var target = parseInt(el.getAttribute('data-target'), 10);
                    var prefix = el.getAttribute('data-prefix') || '';
                    var suffix = el.getAttribute('data-suffix') || '';
                    var duration = parseInt(el.getAttribute('data-duration'), 10) || 1400;
                    var start = 0;
                    var startTime = null;

                    function step(timestamp) {
                        if (!startTime) startTime = timestamp;
                        var elapsed = timestamp - startTime;
                        var progress = Math.min(elapsed / duration, 1);
                        var easedProgress = easeOutCubic(progress);
                        var current = Math.round(start + (target - start) * easedProgress);
                        el.textContent = prefix + current.toLocaleString() + suffix;

                        if (progress < 1) {
                            requestAnimationFrame(step);
                        }
                    }

                    requestAnimationFrame(step);
                    counterObserver.unobserve(el);
                }
            });
        }, { threshold: 0.6 });

        for (var i = 0; i < counters.length; i++) {
            counterObserver.observe(counters[i]);
        }
    }

    /* ============================================
       9. GLITCH TEXT EFFECT
       ============================================ */
    function initGlitchText() {
        if (prefersReduced) return;
        if (isMobile || isTouch) return;

        var h1 = document.querySelector('h1');
        if (!h1) return;

        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#@$%&?!';
        var originalText = h1.textContent.trim();
        h1.classList.add('glitch');
        h1.setAttribute('data-text', originalText);
        h1.setAttribute('data-original', originalText);

        function scramble(el, callback) {
            var text = el.getAttribute('data-original');
            var iterations = 0;
            var maxIterations = 12;

            function tick() {
                var scrambled = '';
                for (var i = 0; i < text.length; i++) {
                    if (text[i] === ' ' || text[i] === '\n') {
                        scrambled += text[i];
                    } else if (iterations > maxIterations * (i / text.length)) {
                        scrambled += text[i];
                    } else {
                        scrambled += chars[Math.floor(Math.random() * chars.length)];
                    }
                }
                el.textContent = scrambled;
                iterations++;

                if (iterations <= maxIterations + 3) {
                    requestAnimationFrame(tick);
                } else {
                    el.textContent = text;
                    if (callback) callback();
                }
            }

            tick();
        }

        function triggerGlitch() {
            h1.classList.add('glitching');
            setTimeout(function () {
                h1.classList.remove('glitching');
            }, 400);
        }

        scramble(h1);

        var glitchInterval = setInterval(function () {
            triggerGlitch();
        }, 3500 + Math.random() * 1500);

        h1.addEventListener('mouseenter', function () {
            triggerGlitch();
            scramble(h1);
        });
        h1.addEventListener('touchstart', function (e) {
            triggerGlitch();
            scramble(h1);
        }, { passive: true });
    }

    /* ============================================
       10. GLASSMORPHISM NAVBAR SCROLL
       ============================================ */
    function initNavbarScroll() {
        var header = document.querySelector('header');
        if (!header) return;

        var scrollThreshold = 60;

        window.addEventListener('scroll', function () {
            if (window.scrollY > scrollThreshold) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }, { passive: true });
    }

    /* ============================================
       11. INFINITE MARQUEE STRIP
       ============================================ */
    function injectMarquee() {
        var existing = document.querySelector('.fx-marquee-wrap');
        if (existing) return;

        var agents = ['USFans', 'Kakobuy', 'Litbuy', 'Joyagoo', 'Weidian', 'Taobao', '1688'];
        var items = agents.concat(agents);

        var wrap = document.createElement('div');
        wrap.className = 'fx-marquee-wrap';
        wrap.setAttribute('aria-hidden', 'true');

        var track = document.createElement('div');
        track.className = 'fx-marquee-track';

        for (var i = 0; i < items.length; i++) {
            var item = document.createElement('span');
            item.className = 'fx-marquee-item';
            item.innerHTML = '✦ ' + items[i] + ' ';
            track.appendChild(item);
        }

        wrap.appendChild(track);

        var placeholder = document.getElementById('marqueePlaceholder');
        if (placeholder) {
            placeholder.parentNode.replaceChild(wrap, placeholder);
        } else {
            var firstSection = document.querySelector('section');
            if (firstSection && firstSection.nextElementSibling) {
                firstSection.parentNode.insertBefore(wrap, firstSection.nextElementSibling);
            } else {
                var footer = document.querySelector('footer');
                if (footer) {
                    footer.parentNode.insertBefore(wrap, footer);
                } else {
                    document.body.appendChild(wrap);
                }
            }
        }
    }

    /* ============================================
       12. COPY-TO-CLIPBOARD ON PROMO CODES
       ============================================ */
    function initCopyToClipboard() {
        var knownCodes = ['RCGD5Y', 'FINDSES', 'YBMHFG55L', '300768147'];
        var codeRegex = new RegExp('\\b(' + knownCodes.join('|') + ')\\b', 'gi');

        function addCopyButtons(root) {
            var walker = document.createTreeWalker(
                root,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );

            var textNodes = [];
            var node;
            while ((node = walker.nextNode())) {
                textNodes.push(node);
            }

            for (var i = 0; i < textNodes.length; i++) {
                var textNode = textNodes[i];
                if (textNode._fxCopy) continue;
                textNode._fxCopy = true;

                var text = textNode.textContent;
                var match = codeRegex.exec(text);
                codeRegex.lastIndex = 0;

                if (!match) continue;

                var parent = textNode.parentNode;
                if (!parent || parent._fxCopyWrap) continue;

                var spanEl = parent.querySelector('strong, code, .promo-code, .referral-code');
                if (!spanEl) {
                    spanEl = document.createElement('span');
                    spanEl.textContent = match[0];
                    spanEl.style.cssText = 'font-weight:700;letter-spacing:1px;';
                }

                if (spanEl._fxCopyBtn) continue;
                spanEl._fxCopyBtn = true;

                var wrap = document.createElement('span');
                wrap.className = 'fx-copy-wrap';

                var copyBtn = document.createElement('button');
                copyBtn.className = 'fx-copy-btn';
                copyBtn.textContent = 'Copy';
                copyBtn.setAttribute('type', 'button');
                copyBtn.setAttribute('aria-label', 'Copy promo code ' + match[0]);

                copyBtn.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    var code = match[0];
                    navigator.clipboard.writeText(code).then(function () {
                        copyBtn.textContent = '\u2705 Copied!';
                        copyBtn.classList.add('copied');
                        setTimeout(function () {
                            copyBtn.textContent = 'Copy';
                            copyBtn.classList.remove('copied');
                        }, 2200);
                    }).catch(function () {
                        copyBtn.textContent = 'Error';
                        setTimeout(function () {
                            copyBtn.textContent = 'Copy';
                        }, 1500);
                    });
                });

                wrap.appendChild(spanEl.cloneNode ? spanEl : spanEl);
                wrap.appendChild(copyBtn);

                if (parent.contains(spanEl)) {
                    parent.replaceChild(wrap, spanEl);
                }
            }
        }

        addCopyButtons(document.body);

        var copyObserver = new MutationObserver(function (mutations) {
            for (var i = 0; i < mutations.length; i++) {
                var m = mutations[i];
                for (var j = 0; j < m.addedNodes.length; j++) {
                    var node = m.addedNodes[j];
                    if (node.nodeType === 1) {
                        addCopyButtons(node);
                    }
                }
            }
        });
        copyObserver.observe(document.body, { childList: true, subtree: true });
    }

    /* ============================================
       MAIN INITIALIZATION
       ============================================ */
    function init() {
        var cursor = initCursor();
        var pCanvas = initParticleCanvas();
        injectOrbsContainer();
        initCardTilt();
        initMagneticButtons();
        initScrollReveal();
        initCounters();
        initGlitchText();
        initNavbarScroll();
        injectMarquee();
        initCopyToClipboard();

        /* ---- Animation Loop ---- */
        function loop() {
            if (cursor && cursor.animate) cursor.animate();
            if (pCanvas && pCanvas.draw) pCanvas.draw();
            requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
