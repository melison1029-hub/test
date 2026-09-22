/* ============================================================
   SERHANT. — site behavior
   Vanilla JS, no dependencies. Everything degrades gracefully:
   with JS off the page is still fully readable and navigable.
   ============================================================ */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Current year ---------- */
  var year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Sticky nav state ---------- */
  var nav = $('#nav');
  var onScroll = function () {
    if (nav) nav.classList.toggle('is-stuck', window.scrollY > 24);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  var burger = $('#burger');
  var mobile = $('#mobileMenu');
  var setMenu = function (open) {
    if (!burger || !mobile) return;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mobile.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
  };
  if (burger) {
    burger.addEventListener('click', function () {
      setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });
  }
  if (mobile) {
    mobile.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') setMenu(false);
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 1040) setMenu(false);
  });

  /* ---------- Seller / Buyer tabs ---------- */
  var tabs   = $$('.tab');
  var inkBar = $('.tabs__ink');

  var moveInk = function (btn) {
    if (!inkBar || !btn) return;
    inkBar.style.width = btn.offsetWidth + 'px';
    inkBar.style.transform = 'translateX(' + btn.offsetLeft + 'px)';
  };

  var selectTab = function (name, focus) {
    var target = null;
    tabs.forEach(function (btn) {
      var on = btn.dataset.tab === name;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-selected', String(on));
      if (on) target = btn;

      var panel = document.getElementById(btn.dataset.tab);
      if (panel) {
        panel.classList.toggle('is-active', on);
        panel.hidden = !on;
        // Reveal-on-scroll elements inside a freshly shown panel were never
        // observed while hidden — show them immediately.
        if (on) $$('.reveal', panel).forEach(function (el) { el.classList.add('is-in'); });
      }
    });
    moveInk(target);
    if (focus && target) target.focus();
  };

  tabs.forEach(function (btn, i) {
    btn.addEventListener('click', function () { selectTab(btn.dataset.tab); });
    btn.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      var next = (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      selectTab(tabs[next].dataset.tab, true);
    });
  });

  if (tabs.length) {
    var active = $('.tab.is-active') || tabs[0];
    moveInk(active);
    window.addEventListener('resize', function () { moveInk($('.tab.is-active')); });
    // Fonts load after first paint and change button widths.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { moveInk($('.tab.is-active')); });
    }
  }

  // Hero "I'm Selling" / "I'm Buying" switch the tab before scrolling.
  $$('[data-tab-jump]').forEach(function (a) {
    a.addEventListener('click', function () { selectTab(a.dataset.tabJump); });
  });

  // Deep link support: /#buyers opens the buyer panel.
  var openFromHash = function () {
    var h = (location.hash || '').replace('#', '');
    if (h === 'buyers' || h === 'sellers') selectTab(h);
  };
  openFromHash();
  window.addEventListener('hashchange', openFromHash);

  /* ---------- Prefill the contact form intent ---------- */
  $$('[data-prefill]').forEach(function (a) {
    a.addEventListener('click', function () {
      var sel = $('#f-intent');
      if (!sel) return;
      Array.prototype.forEach.call(sel.options, function (o) {
        if (o.text === a.dataset.prefill) sel.value = o.value;
      });
    });
  });

  /* ---------- Scroll reveal ---------- */
  var revealables = $$('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    revealables.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Stat count-up ---------- */
  var counters = $$('.c');
  var runCount = function (el) {
    var target   = parseFloat(el.dataset.count || '0');
    var decimals = parseInt(el.dataset.decimals || '0', 10);
    if (reduced) { el.textContent = target.toFixed(decimals); return; }

    var start = null;
    var dur = 1500;
    var tick = function (ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (counters.length) {
    if (!('IntersectionObserver' in window)) {
      counters.forEach(runCount);
    } else {
      var co = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          runCount(entry.target);
          co.unobserve(entry.target);
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { co.observe(el); });
    }
  }

  /* ---------- Nav scroll-spy ---------- */
  var navLinks = $$('.nav__links a');
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle('is-current', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { so.observe(s); });
  }

  /* ---------- Contact form ----------
     Posts to Netlify Forms when the site is hosted there. On any
     other host (GitHub Pages, a local file, a static bucket) the
     POST won't be accepted, so we fall back to opening a
     pre-filled email instead of losing the lead.
  --------------------------------------------------------------- */
  var form   = $('#contactForm');
  var status = $('#formStatus');
  var MAILTO = 'melanienannetti@serhant.com'; // EDIT: where leads should land

  var say = function (msg, ok) {
    if (!status) return;
    status.textContent = msg;
    status.classList.toggle('is-ok', !!ok);
  };

  var mailtoFallback = function (data) {
    var lines = [
      'Name: '     + (data.get('name')     || ''),
      'Email: '    + (data.get('email')    || ''),
      'Phone: '    + (data.get('phone')    || ''),
      'Interest: ' + (data.get('intent')   || ''),
      'Location: ' + (data.get('location') || ''),
      'Timeline: ' + (data.get('timeline') || ''),
      '',
      (data.get('message') || '')
    ].join('\n');

    var href = 'mailto:' + MAILTO +
      '?subject=' + encodeURIComponent('Website inquiry — ' + (data.get('name') || 'New lead')) +
      '&body='    + encodeURIComponent(lines);

    window.location.href = href;
    say('Opening your email app to send this over. If nothing happens, email ' + MAILTO + ' directly.');
  };

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);
      if (data.get('company')) return; // honeypot tripped

      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
      say('Sending…');

      var body = new URLSearchParams();
      data.forEach(function (v, k) { body.append(k, v); });

      var restore = function () {
        if (btn) { btn.disabled = false; btn.textContent = 'Send'; }
      };

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
      })
        .then(function (res) {
          if (!res.ok) throw new Error('not accepted');
          form.reset();
          restore();
          say('Thank you — your message is in. I\'ll be in touch within one business day.', true);
        })
        .catch(function () {
          restore();
          mailtoFallback(data);
        });
    });
  }
})();
