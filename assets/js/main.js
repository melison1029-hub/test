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
