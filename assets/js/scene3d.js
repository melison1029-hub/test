/* ============================================================
   HERO 3D — drone shot over a neighborhood at dusk
   ------------------------------------------------------------
   Progressive enhancement. The drawn SVG neighborhood renders
   immediately and is what phones, older machines and anyone with
   reduced motion keep. On a capable desktop this loads Three.js
   (self-hosted, no CDN) and crossfades a real WebGL scene in.

   Turn it off site-wide by deleting the <script> tag for this
   file in index.html — the SVG scene stays, nothing else breaks.
   ============================================================ */
(function () {
  'use strict';

  var HERO = document.querySelector('.hero');
  var SVG_SCENE = document.querySelector('.scene');
  if (!HERO || !SVG_SCENE) return;

  /* ---------- Should we even try? ---------- */
  function capable() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    if (window.innerWidth < 1024) return false;               // phones keep the SVG
    if (navigator.connection && navigator.connection.saveData) return false;
    if (navigator.deviceMemory && navigator.deviceMemory < 4) return false;
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) return false;
    try {
      var c = document.createElement('canvas');
      return !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch (e) { return false; }
  }
  if (!capable()) return;

  /* ---------- Deterministic placement ---------- */
  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function boot() {
    var THREE = window.THREE;
    if (!THREE) return;

    var NAVY = 0x0A0B3F;
    var canvas = document.createElement('canvas');
    canvas.className = 'scene3d';
    canvas.setAttribute('aria-hidden', 'true');
    HERO.insertBefore(canvas, SVG_SCENE);

    var renderer = new THREE.WebGLRenderer({
      canvas: canvas, antialias: true, alpha: true, powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    renderer.setClearAlpha(0);

    var scene = new THREE.Scene();
    scene.fog = new THREE.Fog(NAVY, 110, 290);

    var camera = new THREE.PerspectiveCamera(34, 1, 1, 600);

    /* ---------- Lighting: moonlight, no shadow maps ---------- */
    scene.add(new THREE.HemisphereLight(0x3442A8, 0x05061F, 1.0));
    var moon = new THREE.DirectionalLight(0xB6CEFF, 1.0);
    moon.position.set(-40, 60, 26);
    scene.add(moon);

    /* ---------- Ground and streets ---------- */
    var LOT = 13, GRID = 9, SPAN = LOT * GRID;
    var ground = new THREE.Mesh(
      new THREE.PlaneGeometry(SPAN * 2.6, SPAN * 2.6),
      new THREE.MeshLambertMaterial({ color: 0x0C1042 })
    );
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    var road = new THREE.MeshLambertMaterial({ color: 0x171D57 });
    for (var g = 0; g <= GRID; g++) {
      var off = (g - GRID / 2) * LOT;
      var ew = new THREE.Mesh(new THREE.PlaneGeometry(SPAN * 1.4, 3.4), road);
      ew.rotation.x = -Math.PI / 2; ew.position.set(0, 0.02, off); scene.add(ew);
      var ns = new THREE.Mesh(new THREE.PlaneGeometry(3.4, SPAN * 1.4), road);
      ns.rotation.x = -Math.PI / 2; ns.position.set(off, 0.02, 0); scene.add(ns);
    }

    /* ---------- Houses, built as instanced meshes ---------- */
    var rand = rng(20260922);
    var lots = [];
    for (var ix = 0; ix < GRID; ix++) {
      for (var iz = 0; iz < GRID; iz++) {
        if (rand() < 0.08) continue;   // the occasional empty lot
        lots.push([(ix - (GRID - 1) / 2) * LOT + (rand() - 0.5) * 5.2,
                   (iz - (GRID - 1) / 2) * LOT + (rand() - 0.5) * 5.2]);
      }
    }
    var N = lots.length;

    var bodies = new THREE.InstancedMesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshLambertMaterial({ color: 0x1B2278 }), N);
    var roofs = new THREE.InstancedMesh(
      new THREE.ConeGeometry(0.72, 1, 4),
      new THREE.MeshLambertMaterial({ color: 0x3440AE }), N);
    bodies.instanceMatrix.setUsage(THREE.StaticDrawUsage);
    roofs.instanceMatrix.setUsage(THREE.StaticDrawUsage);

    var WIN_PER_HOUSE = 8;
    var windows = new THREE.InstancedMesh(
      new THREE.PlaneGeometry(0.8, 0.95),
      new THREE.MeshBasicMaterial({ color: 0xFFFFFF, fog: true }),
      N * WIN_PER_HOUSE);
    windows.instanceColor = new THREE.InstancedBufferAttribute(
      new Float32Array(N * WIN_PER_HOUSE * 3), 3);

    var m = new THREE.Matrix4();
    var q = new THREE.Quaternion();
    var e = new THREE.Euler();
    var pos = new THREE.Vector3();
    var scl = new THREE.Vector3();
    var lit = new THREE.Color(0xFFC25E);
    var dark = new THREE.Color(0x0B0F3A);
    var houses = [];   // window indices, so they can flicker later
    var wi = 0;

    for (var i = 0; i < N; i++) {
      var w = 5 + rand() * 3.4;
      var d = 5 + rand() * 3.4;
      var h = 3.2 + rand() * 3.2;
      var yaw = Math.round(rand() * 3) * (Math.PI / 2) + (rand() - 0.5) * 0.34;
      var x = lots[i][0], z = lots[i][1];

      e.set(0, yaw, 0); q.setFromEuler(e);
      bodies.setMatrixAt(i, m.compose(pos.set(x, h / 2, z), q, scl.set(w, h, d)));

      var rh = 2.3 + rand() * 2.7;
      // ConeGeometry(0.72,...) has a 1.44 base, and its 4 segments sit 45 deg
      // off the box, so square the pyramid up and size it to the footprint.
      e.set(0, yaw + Math.PI / 4, 0); q.setFromEuler(e);
      roofs.setMatrixAt(i, m.compose(
        pos.set(x, h + rh / 2, z), q,
        scl.set(Math.max(w, d) * 0.92, rh, Math.max(w, d) * 0.92)));
      e.set(0, yaw, 0); q.setFromEuler(e);

      // Windows on all four faces, since the camera orbits the block.
      var rows = h > 6 ? 2 : 1;
      var start = wi;
      for (var f = 0; f < 4; f++) {
        var fy = yaw + f * (Math.PI / 2);
        var depth = (f % 2 === 0 ? d : w) / 2 + 0.06;
        for (var r = 0; r < rows && wi < N * WIN_PER_HOUSE; r++) {
          var wy = h * (rows === 2 ? (r === 0 ? 0.32 : 0.68) : 0.5);
          e.set(0, fy, 0); q.setFromEuler(e);
          pos.set(x + Math.sin(fy) * depth, wy, z + Math.cos(fy) * depth);
          windows.setMatrixAt(wi, m.compose(pos, q, scl.set(1, 1, 1)));
          var on = rand() < 0.5;
          windows.setColorAt(wi, on ? lit : dark);
          wi++;
        }
      }
      houses.push({ from: start, to: wi });
    }
    windows.count = wi;
    bodies.instanceMatrix.needsUpdate = true;
    roofs.instanceMatrix.needsUpdate = true;
    windows.instanceMatrix.needsUpdate = true;
    if (windows.instanceColor) windows.instanceColor.needsUpdate = true;
    scene.add(bodies, roofs, windows);

    /* ---------- Trees ---------- */
    var TREES = 150;
    var trees = new THREE.InstancedMesh(
      new THREE.IcosahedronGeometry(1, 0),
      new THREE.MeshLambertMaterial({ color: 0x17205E, flatShading: true }), TREES);
    for (var t = 0; t < TREES; t++) {
      var ts = 1.1 + rand() * 1.5;
      e.set(rand() * 3, rand() * 3, 0); q.setFromEuler(e);
      trees.setMatrixAt(t, m.compose(
        pos.set((rand() - 0.5) * SPAN * 1.15, ts * 0.9, (rand() - 0.5) * SPAN * 1.15),
        q, scl.set(ts, ts * 1.35, ts)));
    }
    trees.instanceMatrix.needsUpdate = true;
    scene.add(trees);

    /* ---------- Street lamps ---------- */
    var LAMPS = 60;
    var lamps = new THREE.InstancedMesh(
      new THREE.SphereGeometry(0.34, 8, 6),
      new THREE.MeshBasicMaterial({ color: 0xFFD79A, fog: true }), LAMPS);
    for (var l = 0; l < LAMPS; l++) {
      var lg = Math.floor(rand() * (GRID + 1));
      var along = (rand() - 0.5) * SPAN;
      var cross = (lg - GRID / 2) * LOT + 2.3;
      var flip = rand() < 0.5;
      lamps.setMatrixAt(l, m.compose(
        pos.set(flip ? along : cross, 3.1, flip ? cross : along),
        new THREE.Quaternion(), scl.set(1, 1, 1)));
    }
    lamps.instanceMatrix.needsUpdate = true;
    scene.add(lamps);

    /* ---------- Camera: a slow drone orbit ---------- */
    var angle = 0.7, target = new THREE.Vector3(0, 6, 0);
    var mouse = { x: 0, y: 0 }, aim = { x: 0, y: 0 };
    window.addEventListener('pointermove', function (ev) {
      aim.x = (ev.clientX / window.innerWidth - 0.5) * 2;
      aim.y = (ev.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    function resize() {
      var w = HERO.clientWidth, h = HERO.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    /* ---------- Frame loop, paused when not on screen ---------- */
    var visible = true, running = true, raf = null, last = performance.now();

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        visible = en[0].isIntersecting;
        if (visible && !raf) { last = performance.now(); loop(); }
      }, { threshold: 0.01 }).observe(HERO);
    }
    document.addEventListener('visibilitychange', function () {
      running = !document.hidden;
      if (running && visible && !raf) { last = performance.now(); loop(); }
    });

    var flickerAt = 0;
    function loop() {
      if (!visible || !running) { raf = null; return; }
      raf = requestAnimationFrame(loop);

      var now = performance.now();
      var dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      angle += dt * 0.045;
      mouse.x += (aim.x - mouse.x) * 0.045;
      mouse.y += (aim.y - mouse.y) * 0.045;

      var radius = 152;
      camera.position.set(
        Math.cos(angle) * radius + mouse.x * 9,
        86 + Math.sin(angle * 0.7) * 6 - mouse.y * 6,
        Math.sin(angle) * radius
      );
      camera.lookAt(target);

      // A few windows change state every couple of seconds — the street lives.
      if (now > flickerAt && windows.instanceColor) {
        flickerAt = now + 1400 + Math.random() * 1800;
        for (var k = 0; k < 3; k++) {
          var idx = Math.floor(Math.random() * windows.count);
          windows.setColorAt(idx, Math.random() < 0.5 ? lit : dark);
        }
        windows.instanceColor.needsUpdate = true;
      }

      renderer.render(scene, camera);
    }
    loop();

    // Crossfade: the drawn scene holds the frame until WebGL has something up.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        HERO.classList.add('has-3d');
      });
    });
  }

  /* ---------- Load the library once the page is settled ---------- */
  function load() {
    var s = document.createElement('script');
    s.src = 'assets/vendor/three.min.js';
    s.async = true;
    s.onload = boot;
    s.onerror = function () { /* SVG scene stays; nothing to do */ };
    document.head.appendChild(s);
  }

  if ('requestIdleCallback' in window) {
    requestIdleCallback(load, { timeout: 2500 });
  } else {
    window.addEventListener('load', function () { setTimeout(load, 400); });
  }
})();
