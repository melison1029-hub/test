/* ============================================================
   CLIENTELE PORTAL — front-end demo
   ------------------------------------------------------------
   IMPORTANT: this is a browser-only prototype. The accounts and
   the client data below ship inside the page, so anyone who can
   open the page can read them. It is safe only because the data
   here is invented.

   To run this with real clients you need a backend that owns
   auth and data — see "Making the portal real" in the README.
   Replace DEMO_ACCOUNTS/DATA with authenticated fetch() calls
   and the rendering below keeps working as-is.
   ============================================================ */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };

  /* ---------- Sample accounts (demo only) ---------- */
  var DEMO_ACCOUNTS = {
    'seller@demo.com': { password: 'demo1234', role: 'seller', name: 'Dana Whitfield' },
    'buyer@demo.com':  { password: 'demo1234', role: 'buyer',  name: 'Marc Ellison' }
  };

  var TEAM = [
    { name: 'Ron Ison',         role: 'Team Leader',     img: 'assets/img/team/ron-ison.jpg',         tel: '+15551234567' },
    { name: 'Melanie Nannetti', role: 'Sales Associate', img: 'assets/img/team/melanie-nannetti.jpg', tel: '+15551234567' },
    { name: 'Dora',             role: 'Sales Associate', img: 'assets/img/team/dora.jpg',             tel: '+15551234567' },
    { name: 'Jonathan',         role: 'Sales Associate', img: 'assets/img/team/jonathan.jpg',         tel: '+15551234567' }
  ];

  /* ---------- Sample data (demo only) ---------- */
  var DATA = {
    seller: {
      address: '12 Sycamore Court, Holmdel',
      list: '$749,000',
      status: 'Live on market',
      days: 18, daysLabel: 'Days on market',
      stats: [
        { n: '14',  l: 'Showings booked', up: '+3 this week' },
        { n: '412', l: 'Listing views',   up: '+64 this week' },
        { n: '2',   l: 'Offers received', up: 'Newest today' },
        { n: '31',  l: 'Saves',           up: '+8 this week' }
      ],
      stages: [
        { t: 'Listing agreement signed', s: 'done', d: 'Feb 26' },
        { t: 'Prep & punch list',        s: 'done', d: 'Mar 1' },
        { t: 'Photography & floor plans', s: 'done', d: 'Mar 4' },
        { t: 'Live on market',           s: 'done', d: 'Mar 7' },
        { t: 'Showings & feedback',      s: 'now',  d: 'In progress', note: '14 booked, 11 completed' },
        { t: 'Offers & negotiation',     s: 'now',  d: '2 in review', note: 'Highest: $742,000' },
        { t: 'Under contract',           s: 'todo', d: '—' },
        { t: 'Inspection & appraisal',   s: 'todo', d: '—' },
        { t: 'Closing',                  s: 'todo', d: '—' }
      ],
      showings: [
        { day: '14', mon: 'Mar', t: 'Saturday 11:00am', who: 'K. Alvarez · Compass', tag: 'ok',   label: 'Confirmed' },
        { day: '14', mon: 'Mar', t: 'Saturday 2:30pm',  who: 'Open house · public',  tag: 'go',   label: 'Scheduled' },
        { day: '16', mon: 'Mar', t: 'Monday 5:00pm',    who: 'T. Nguyen · Weichert', tag: 'wait', label: 'Needs OK', act: true },
        { day: '18', mon: 'Mar', t: 'Wednesday 10:00am', who: 'Second showing · R. Patel', tag: 'wait', label: 'Needs OK', act: true },
        { day: '11', mon: 'Mar', t: 'Tuesday 4:00pm',   who: 'J. Moreau · Keller Williams', tag: 'mute', label: 'Completed' }
      ],
      offers: [
        { p: '$742,000', d: '20% down · conventional · no mortgage contingency', tag: 'hot', label: 'Review' },
        { p: '$725,000', d: '10% down · FHA · 45-day close', tag: 'mute', label: 'Countered' }
      ],
      feedback: [
        { who: 'K. Alvarez · Compass', when: 'Mar 12', text: 'Buyers loved the kitchen and the yard. Hesitant about the road noise at the front of the house.' },
        { who: 'J. Moreau · Keller Williams', when: 'Mar 11', text: 'Showed well. Their budget tops out at $710K so they are likely out, but they are still thinking.' },
        { who: 'R. Patel · RE/MAX', when: 'Mar 9', text: 'Second showing requested. Strong interest — asking about the age of the roof and HVAC.' }
      ],
      docs: [
        { n: 'Listing agreement.pdf',      m: 'Signed Feb 26 · 4 pages',  k: 'PDF' },
        { n: 'Seller disclosure.pdf',      m: 'Signed Feb 28 · 6 pages',  k: 'PDF' },
        { n: 'Comparative market analysis.pdf', m: 'Feb 24 · 12 pages',   k: 'PDF' },
        { n: 'Offer — 742000.pdf',         m: 'Received Mar 13 · 9 pages', k: 'PDF' },
        { n: 'Marketing report — week 2.pdf', m: 'Mar 14 · 3 pages',      k: 'PDF' }
      ]
    },

    buyer: {
      address: 'Your home search',
      list: '$600K – $750K',
      status: 'Actively touring',
      days: 32, daysLabel: 'Days searching',
      stats: [
        { n: '3',  l: 'Showings this week', up: 'Next: Saturday' },
        { n: '9',  l: 'Homes toured',       up: '+3 this week' },
        { n: '1',  l: 'Offer out',          up: 'Awaiting response' },
        { n: '5',  l: 'Saved homes',        up: '2 new matches' }
      ],
      stages: [
        { t: 'Buyer consultation',   s: 'done', d: 'Feb 8' },
        { t: 'Pre-approval received', s: 'done', d: 'Feb 14', note: 'Up to $755,000' },
        { t: 'Touring homes',        s: 'done', d: 'Ongoing', note: '9 toured so far' },
        { t: 'Offer submitted',      s: 'now',  d: 'Mar 13', note: '41 Cedar Hollow — $688,000' },
        { t: 'Attorney review',      s: 'todo', d: '—' },
        { t: 'Inspection',           s: 'todo', d: '—' },
        { t: 'Mortgage commitment',  s: 'todo', d: '—' },
        { t: 'Closing',              s: 'todo', d: '—' }
      ],
      showings: [
        { day: '15', mon: 'Mar', t: 'Saturday 10:00am', who: '8 Ridgeview Dr, Marlboro · $715,000', tag: 'ok',   label: 'Confirmed' },
        { day: '15', mon: 'Mar', t: 'Saturday 11:30am', who: '22 Brook Ln, Holmdel · $699,000',     tag: 'ok',   label: 'Confirmed' },
        { day: '17', mon: 'Mar', t: 'Monday 6:00pm',    who: '5 Harvest Way, Colts Neck · $739,000', tag: 'wait', label: 'Confirm?', act: true },
        { day: '20', mon: 'Mar', t: 'Thursday 5:30pm',  who: '14 Mill Rd, Freehold · $645,000',      tag: 'wait', label: 'Confirm?', act: true },
        { day: '12', mon: 'Mar', t: 'Tuesday 5:00pm',   who: '41 Cedar Hollow, Holmdel · $699,000',  tag: 'mute', label: 'Toured' }
      ],
      offers: [
        { p: '$688,000', d: '41 Cedar Hollow · 25% down · 30-day close', tag: 'go', label: 'Submitted Mar 13' }
      ],
      saved: [
        { p: '$699,000', a: '22 Brook Ln, Holmdel',      m: '4 bd · 2.5 ba · 2,300 sf' },
        { p: '$715,000', a: '8 Ridgeview Dr, Marlboro',  m: '4 bd · 3 ba · 2,650 sf' },
        { p: '$645,000', a: '14 Mill Rd, Freehold',      m: '3 bd · 2 ba · 1,900 sf' }
      ],
      checklist: [
        { t: 'Get pre-approved',        s: 'Lender letter on file, valid through May 14.', done: true },
        { t: 'Choose a real estate attorney', s: 'We can send three names you can call today.', done: true },
        { t: 'Line up homeowners insurance', s: 'Start quotes once the offer is accepted.', done: false },
        { t: 'Book the home inspection', s: 'Within 10 days of attorney review ending.', done: false },
        { t: 'Lock your rate',           s: 'Talk to your lender once inspection clears.', done: false },
        { t: 'Schedule the final walk-through', s: '24 hours before closing.', done: false }
      ],
      docs: [
        { n: 'Buyer agency agreement.pdf', m: 'Signed Feb 8 · 3 pages',  k: 'PDF' },
        { n: 'Pre-approval letter.pdf',    m: 'Feb 14 · 1 page',         k: 'PDF' },
        { n: 'Offer — 41 Cedar Hollow.pdf', m: 'Submitted Mar 13 · 11 pages', k: 'PDF' },
        { n: 'Attorney contacts.pdf',      m: 'Feb 10 · 1 page',         k: 'PDF' }
      ]
    }
  };

  /* ---------- Helpers ---------- */
  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function store(key, val) {
    try {
      if (val === undefined) { var r = sessionStorage.getItem(key); return r ? JSON.parse(r) : null; }
      sessionStorage.setItem(key, JSON.stringify(val));
    } catch (e) { /* private mode or blocked storage — the page still works */ }
    return null;
  }
  function saved(key, val) {
    try {
      if (val === undefined) { var r = localStorage.getItem(key); return r ? JSON.parse(r) : null; }
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) { /* ignore */ }
    return null;
  }
  function initials(name) {
    return name.split(/\s+/).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase();
  }

  /* ---------- Sign in ---------- */
  var signin = $('#signin');
  var app    = $('#app');
  var errEl  = $('#signinErr');

  document.querySelectorAll('[data-fill]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      $('#p-email').value = btn.dataset.fill + '@demo.com';
      $('#p-pass').value  = 'demo1234';
      errEl.textContent   = '';
      $('#p-email').focus();
    });
  });

  $('#signinForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var email = $('#p-email').value.trim().toLowerCase();
    var pass  = $('#p-pass').value;
    var acct  = DEMO_ACCOUNTS[email];

    if (!acct || acct.password !== pass) {
      errEl.textContent = 'That email and password don’t match. Try a demo login below.';
      return;
    }
    errEl.textContent = '';
    store('ig_session', { email: email, role: acct.role, name: acct.name });
    open(acct);
  });

  $('#signout').addEventListener('click', function () {
    try { sessionStorage.removeItem('ig_session'); } catch (e) {}
    app.classList.remove('on');
    signin.style.display = '';
    $('#p-pass').value = '';
    window.scrollTo(0, 0);
  });

  /* ---------- Render ---------- */
  var TABS = {
    seller: [
      { id: 'overview', label: 'Overview' },
      { id: 'showings', label: 'Showings & offers' },
      { id: 'feedback', label: 'Feedback' },
      { id: 'docs',     label: 'Documents' }
    ],
    buyer: [
      { id: 'overview',  label: 'Overview' },
      { id: 'showings',  label: 'Appointments' },
      { id: 'saved',     label: 'Saved homes' },
      { id: 'checklist', label: 'Checklist' },
      { id: 'docs',      label: 'Documents' }
    ]
  };

  function open(acct) {
    var d = DATA[acct.role];
    signin.style.display = 'none';
    app.classList.add('on');
    $('#whoName').textContent = acct.name;
    $('#avatar').textContent  = initials(acct.name);

    var bar = $('#tabbar');
    bar.innerHTML = TABS[acct.role].map(function (t, i) {
      return '<button role="tab" id="tb-' + t.id + '" aria-controls="pn-' + t.id + '" aria-selected="' +
        (i === 0) + '" data-tab="' + t.id + '">' + esc(t.label) + '</button>';
    }).join('');

    $('#portalMain').innerHTML = header(d) + TABS[acct.role].map(function (t, i) {
      return '<section class="panel' + (i === 0 ? ' on' : '') + '" id="pn-' + t.id +
        '" role="tabpanel" aria-labelledby="tb-' + t.id + '" tabindex="0">' +
        panel(t.id, acct.role, d) + '</section>';
    }).join('');

    bar.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () { showTab(b.dataset.tab); });
    });

    wire(acct.role);
    requestAnimationFrame(function () {
      var m = $('#meterFill');
      if (m) m.style.width = m.dataset.w;
    });
    window.scrollTo(0, 0);
  }

  function showTab(id) {
    document.querySelectorAll('#tabbar button').forEach(function (b) {
      b.setAttribute('aria-selected', String(b.dataset.tab === id));
    });
    document.querySelectorAll('.panel').forEach(function (p) {
      p.classList.toggle('on', p.id === 'pn-' + id);
    });
  }

  function header(d) {
    return '<div class="phead">' +
      '<div><h1>' + esc(d.address) + '</h1>' +
      '<p class="phead__sub">' + esc(d.list) + ' · <span class="status">' + esc(d.status) + '</span></p></div>' +
      '<div class="phead__stats"><div><b>' + esc(d.days) + '</b><span>' + esc(d.daysLabel) + '</span></div></div></div>';
  }

  function stagesBox(d) {
    var done = d.stages.filter(function (s) { return s.s === 'done'; }).length;
    var pct  = Math.round((done / d.stages.length) * 100);
    return '<div class="box"><div class="box__head"><h2>Where things stand</h2>' +
      '<p>' + done + ' of ' + d.stages.length + ' stages complete</p></div>' +
      '<div class="meter"><i id="meterFill" data-w="' + pct + '%" style="width:0"></i></div>' +
      '<div class="stages">' + d.stages.map(function (s) {
        return '<div class="stage ' + s.s + '"><span class="stage__dot" aria-hidden="true">✓</span>' +
          '<span><b>' + esc(s.t) + '</b>' + (s.note ? '<small>' + esc(s.note) + '</small>' : '') + '</span>' +
          '<span class="when">' + esc(s.d) + '</span></div>';
      }).join('') + '</div></div>';
  }

  function tiles(d) {
    return '<div class="tiles">' + d.stats.map(function (s) {
      return '<div class="tile"><b>' + esc(s.n) + '</b><span>' + esc(s.l) + '</span>' +
        (s.up ? '<em>' + esc(s.up) + '</em>' : '') + '</div>';
    }).join('') + '</div>';
  }

  function crew() {
    return '<div class="box"><div class="box__head"><h2>Your team</h2></div><ul class="crew">' +
      TEAM.map(function (m) {
        return '<li><img src="' + m.img + '" alt="" width="44" height="44">' +
          '<span><b>' + esc(m.name) + '</b><span>' + esc(m.role) + '</span><br>' +
          '<a href="tel:' + esc(m.tel) + '">Call</a></span></li>';
      }).join('') + '</ul></div>';
  }

  function showRows(d, role) {
    return '<div class="rows">' + d.showings.map(function (s, i) {
      return '<div class="row" data-show="' + i + '">' +
        '<span class="row__date"><b>' + esc(s.day) + '</b><span>' + esc(s.mon) + '</span></span>' +
        '<span class="row__main"><b>' + esc(s.t) + '</b><span>' + esc(s.who) + '</span></span>' +
        '<span class="row__side"><span class="tag tag--' + s.tag + '">' + esc(s.label) + '</span>' +
        (s.act ? '<button class="mini mini--go" data-confirm="' + i + '">' +
          (role === 'seller' ? 'Approve' : 'Confirm') + '</button>' : '') +
        '</span></div>';
    }).join('') + '</div>';
  }

  function offerRows(d) {
    if (!d.offers || !d.offers.length) return '<p class="empty">No offers yet.</p>';
    return '<div class="rows">' + d.offers.map(function (o) {
      return '<div class="row"><span class="row__date"><b>$</b><span>Offer</span></span>' +
        '<span class="row__main"><b>' + esc(o.p) + '</b><span>' + esc(o.d) + '</span></span>' +
        '<span class="row__side"><span class="tag tag--' + o.tag + '">' + esc(o.label) + '</span></span></div>';
    }).join('') + '</div>';
  }

  function docRows(d) {
    return '<div class="docs">' + d.docs.map(function (f) {
      return '<div class="doc"><span class="doc__ico">' + esc(f.k) + '</span>' +
        '<span><b>' + esc(f.n) + '</b><span>' + esc(f.m) + '</span></span>' +
        '<button class="mini" type="button" data-doc>Open</button></div>';
    }).join('') + '</div>';
  }

  function panel(id, role, d) {
    if (id === 'overview') {
      return tiles(d) + '<div class="grid2"><div>' + stagesBox(d) + '</div><div>' +
        (role === 'seller'
          ? '<div class="box"><div class="box__head"><h2>Latest feedback</h2></div>' +
            d.feedback.slice(0, 2).map(function (f) {
              return '<div class="fb"><div class="fb__top"><b>' + esc(f.who) + '</b><span>' + esc(f.when) +
                '</span></div><p>' + esc(f.text) + '</p></div>';
            }).join('') + '</div>'
          : '<div class="box"><div class="box__head"><h2>Next up</h2></div>' + showRows({ showings: d.showings.slice(0, 3) }, role) + '</div>') +
        crew() + '</div></div>';
    }
    if (id === 'showings') {
      return '<div class="box"><div class="box__head"><h2>' +
        (role === 'seller' ? 'Showing requests &amp; appointments' : 'Your appointments') +
        '</h2><p>Times shown in your local time zone</p></div>' + showRows(d, role) + '</div>' +
        '<div class="box"><div class="box__head"><h2>Offers</h2></div>' + offerRows(d) + '</div>';
    }
    if (id === 'feedback') {
      return '<div class="box"><div class="box__head"><h2>Buyer feedback</h2>' +
        '<p>Collected after each showing</p></div>' + d.feedback.map(function (f) {
          return '<div class="fb"><div class="fb__top"><b>' + esc(f.who) + '</b><span>' + esc(f.when) +
            '</span></div><p>' + esc(f.text) + '</p></div>';
        }).join('') + '</div>';
    }
    if (id === 'saved') {
      return '<div class="box"><div class="box__head"><h2>Saved homes</h2>' +
        '<p>Tap any home to ask about a showing</p></div><div class="saved">' +
        d.saved.map(function (h) {
          return '<article><div class="ph">Add photo</div><div class="bd"><b>' + esc(h.p) + '</b>' +
            '<p>' + esc(h.a) + '</p><span>' + esc(h.m) + '</span></div></article>';
        }).join('') + '</div></div>';
    }
    if (id === 'checklist') {
      return '<div class="box"><div class="box__head"><h2>Your checklist</h2>' +
        '<p>Saved on this device</p></div><ul class="checklist">' + d.checklist.map(function (c, i) {
          return '<li><label><input type="checkbox" data-check="' + i + '"' + (c.done ? ' checked' : '') + '>' +
            '<span class="cbox" aria-hidden="true"></span><span class="ctext"><b>' + esc(c.t) +
            '</b><span>' + esc(c.s) + '</span></span></label></li>';
        }).join('') + '</ul></div>';
    }
    return '<div class="box"><div class="box__head"><h2>Documents</h2>' +
      '<p>Everything signed and received</p></div>' + docRows(d) + '</div>';
  }

  /* ---------- Interactions ---------- */
  function wire(role) {
    var main = $('#portalMain');

    main.addEventListener('click', function (e) {
      var confirmBtn = e.target.closest('[data-confirm]');
      if (confirmBtn) {
        var row = confirmBtn.closest('.row');
        var tag = row.querySelector('.tag');
        tag.className = 'tag tag--ok';
        tag.textContent = 'Confirmed';
        confirmBtn.remove();
        return;
      }
      if (e.target.closest('[data-doc]')) {
        var btn = e.target.closest('[data-doc]');
        var was = btn.textContent;
        btn.textContent = 'Demo only';
        btn.disabled = true;
        setTimeout(function () { btn.textContent = was; btn.disabled = false; }, 1600);
      }
    });

    // Checklist state persists per device, which is all a demo should claim.
    var key = 'ig_checklist_' + role;
    var stored = saved(key) || {};
    main.querySelectorAll('[data-check]').forEach(function (box) {
      if (stored[box.dataset.check] !== undefined) box.checked = stored[box.dataset.check];
      box.addEventListener('change', function () {
        stored[box.dataset.check] = box.checked;
        saved(key, stored);
      });
    });
  }

  /* ---------- Resume a session on reload ---------- */
  var live = store('ig_session');
  if (live && DEMO_ACCOUNTS[live.email]) open(DEMO_ACCOUNTS[live.email]);
})();
