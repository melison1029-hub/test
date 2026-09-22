/* ============================================================
   THE ISON GROUP — site behavior
   Vanilla JS, no dependencies. The page is fully readable and
   navigable with JavaScript disabled.
   ============================================================ */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Header state ---------- */
  var hdr = $('#hdr');
  var onScroll = function () { if (hdr) hdr.classList.toggle('is-stuck', window.scrollY > 20); };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile drawer ---------- */
  var burger = $('#burger');
  var drawer = $('#drawer');
  var setDrawer = function (open) {
    if (!burger || !drawer) return;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    drawer.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) hdr.classList.add('is-stuck');
    else onScroll();
  };
  if (burger) burger.addEventListener('click', function () {
    setDrawer(burger.getAttribute('aria-expanded') !== 'true');
  });
  if (drawer) drawer.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') setDrawer(false);
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setDrawer(false); });
  window.addEventListener('resize', function () { if (window.innerWidth > 1080) setDrawer(false); });

  /* ---------- Contact intent ----------
     "What's my home worth" and "Start your search" preselect the
     matching option, so the form opens already pointed the right way.
  ------------------------------------------------------------------ */
  $$('[data-intent]').forEach(function (el) {
    el.addEventListener('click', function () {
      var map = { Selling: 'i-sell', Buying: 'i-buy', Both: 'i-both' };
      var radio = document.getElementById(map[el.dataset.intent]);
      if (radio) radio.checked = true;
    });
  });

  // "Buy" links open the buying column rather than the top of the section.
  $$('[data-path]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      var target = document.getElementById(el.dataset.path);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
      history.replaceState(null, '', '#' + el.dataset.path);
    });
  });

  /* ---------- Hero parallax ----------
     The three house layers drift at different rates as you scroll, which is
     what sells the depth. Transform only, so it stays on the compositor.
  ------------------------------------------------------------------ */
  var layers = [
    { el: $('.sky--far'),  rate: 0.18 },
    { el: $('.sky--mid'),  rate: 0.11 },
    { el: $('.sky--near'), rate: 0.04 }
  ].filter(function (l) { return l.el; });

  if (layers.length && !reduced) {
    var ticking = false;
    var park = function () {
      var y = window.scrollY;
      // Once the hero is off screen there is nothing to move.
      if (y < window.innerHeight * 1.2) {
        layers.forEach(function (l) {
          l.el.style.transform = 'translate3d(0,' + (y * l.rate).toFixed(1) + 'px,0)';
        });
      }
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(park);
    }, { passive: true });
    park();
  }

  /* ---------- Scroll reveal ---------- */
  var items = $$('.rv');
  if (reduced || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.06 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Count-up ---------- */
  var run = function (el) {
    var target = parseFloat(el.dataset.count || '0');
    var pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    if (reduced) { el.textContent = pre + target.toLocaleString() + suf; return; }
    var start = null, dur = 1400;
    var tick = function (ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var v = Math.round(target * (1 - Math.pow(1 - p, 3)));
      el.textContent = pre + v.toLocaleString() + suf;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  var counters = $$('[data-count]');
  if (!('IntersectionObserver' in window)) {
    counters.forEach(run);
  } else {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        run(en.target);
        co.unobserve(en.target);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { co.observe(el); });
  }

  /* ---------- Nav scroll-spy ---------- */
  var links = $$('.mainnav a[href^="#"]');
  var sections = links.map(function (a) { return $(a.getAttribute('href')); }).filter(Boolean);
  if (sections.length && 'IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle('is-current', a.getAttribute('href') === '#' + en.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { so.observe(s); });
  }

  /* ---------- Photo lightbox ----------
     Every listing photo is a <button>, so this works with a mouse, a
     finger or a keyboard. Escape closes, arrows move, focus returns to
     the photo you opened from.
  ------------------------------------------------------------------ */
  var GALLERY = [
    { src: 'assets/img/listings/exterior.jpg',     cap: 'Exterior at twilight' },
    { src: 'assets/img/listings/great-room.jpg',   cap: 'Great room with fireplace, kitchen beyond' },
    { src: 'assets/img/listings/kitchen.jpg',      cap: 'Kitchen' },
    { src: 'assets/img/listings/living-room.jpg',  cap: 'Living room, sliders to the deck' },
    { src: 'assets/img/listings/primary-bath.jpg', cap: 'Primary bathroom' }
  ];

  var lb = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCap');
  var shots = $$('.shot');
  var lbIndex = 0, lastFocus = null;

  function show(i) {
    lbIndex = (i + GALLERY.length) % GALLERY.length;
    var item = GALLERY[lbIndex];
    lbImg.src = item.src;
    lbImg.alt = item.cap;
    lbCap.textContent = item.cap + '  ·  ' + (lbIndex + 1) + ' of ' + GALLERY.length;
  }

  function openLb(i, from) {
    if (!lb) return;
    lastFocus = from || document.activeElement;
    show(i);
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    $('#lbClose').focus();
  }

  function closeLb() {
    if (!lb || lb.hidden) return;
    lb.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  shots.forEach(function (btn) {
    btn.addEventListener('click', function () {
      openLb(parseInt(btn.dataset.gallery, 10) || 0, btn);
    });
  });

  if (lb) {
    $('#lbClose').addEventListener('click', closeLb);
    $('#lbPrev').addEventListener('click', function () { show(lbIndex - 1); });
    $('#lbNext').addEventListener('click', function () { show(lbIndex + 1); });
    lb.addEventListener('click', function (e) {
      // Clicking the backdrop closes; clicking the photo or a control does not.
      if (e.target === lb || e.target.classList.contains('lightbox__stage')) closeLb();
    });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') { closeLb(); return; }
      if (e.key === 'ArrowRight') { e.preventDefault(); show(lbIndex + 1); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); show(lbIndex - 1); }
      if (e.key === 'Tab') {
        // Keep focus inside the viewer while it is open.
        var f = $$('button', lb);
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---------- Contact form ----------
     Posts to Netlify Forms when hosted there. Anywhere else the POST
     is refused, so we open a pre-filled email rather than drop a lead.
  ------------------------------------------------------------------ */
  var form = $('#contactForm');
  var statusEl = $('#formStatus');
  var MAILTO = 'info@theisongroup.com'; // EDIT: where leads should land

  var say = function (msg, ok) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.classList.toggle('ok', !!ok);
  };

  var fallback = function (data) {
    var body = [
      'Name: '     + (data.get('name')     || ''),
      'Email: '    + (data.get('email')    || ''),
      'Phone: '    + (data.get('phone')    || ''),
      'Interest: ' + (data.get('intent')   || ''),
      'Location: ' + (data.get('location') || ''),
      'Timeline: ' + (data.get('timeline') || ''),
      '',
      (data.get('message') || '')
    ].join('\n');

    window.location.href = 'mailto:' + MAILTO +
      '?subject=' + encodeURIComponent('Website inquiry — ' + (data.get('name') || 'New lead')) +
      '&body=' + encodeURIComponent(body);
    say('Opening your email app. If nothing happens, email ' + MAILTO + ' directly.');
  };

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);
      if (data.get('company')) return; // honeypot

      var btn = form.querySelector('button[type="submit"]');
      var restore = function () { if (btn) { btn.disabled = false; btn.textContent = 'Send'; } };
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
      say('Sending…');

      var body = new URLSearchParams();
      data.forEach(function (v, k) { body.append(k, v); });

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
      }).then(function (res) {
        if (!res.ok) throw new Error('rejected');
        form.reset();
        restore();
        say('Thanks — we’ll be in touch within one business day.', true);
      }).catch(function () {
        restore();
        fallback(data);
      });
    });
  }
})();
