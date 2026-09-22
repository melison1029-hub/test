# The Ison Group — team site + clientele portal

A static site for The Ison Group (Ron Ison, Melanie Nannetti, Jonathan and Dora),
built in the brand navy sampled from the logotype (`#121373`). No build step, no
framework, no dependencies.

```
index.html              main site
clientele.html          private client portal (demo)
assets/css/styles.css   design tokens + main site
assets/css/portal.css   portal only
assets/js/main.js       nav, reveals, counters, contact form
assets/js/portal.js     portal sign-in, dashboards, sample data
assets/js/scene3d.js    optional WebGL hero scene
assets/vendor/          Three.js r149 (self-hosted, no CDN)
tools/build-skyline.py  regenerates the drawn neighborhood
assets/img/             logo (navy + white knockout) and team photos
netlify.toml            optional deploy config
```

## See it

Open `index.html` in a browser, or run a local server:

```bash
python3 -m http.server 8000     # http://localhost:8000
```

## Edit checklist

Everything below is marked in the code with `EDIT:` or `VERIFY`.

1. **Last names** — Jonathan and Dora are first-name only in `index.html` and in
   `TEAM` at the top of `assets/js/portal.js`.
2. **Bios** — Ron's is drafted from his public profile; the other three are
   placeholders.
3. **Stats** — `257+ homes sold`, `$675K average`, `9 years` come from public
   agent profiles, not from you. Confirm or replace them.
4. **Brokerage** — the footer says "Licensed Real Estate Salespersons, State of
   New Jersey." Public sources show both Keller Williams Central Monmouth and
   SERHANT. associated with the team, so set the correct current brokerage,
   office address and license numbers with your broker.
5. **Phone and email** — every number is `(555) 123-4567` right now. Also update
   `MAILTO` near the bottom of `assets/js/main.js`.
6. **Listings** — three placeholder cards. Add photos and point each `<img>` at
   them.
7. **Towns** — trim the Areas list to where you actually want leads.
8. **Reviews** — three placeholder testimonials.

## The clientele portal

`clientele.html` is a working front-end: sign in, seller dashboard (stage
tracker, showings, offers, buyer feedback, documents) and buyer dashboard
(appointments, saved homes, a checklist that persists, documents). Demo logins
are on the sign-in screen — `seller@demo.com` and `buyer@demo.com`, password
`demo1234`.

### Making the portal real

**Right now it is a prototype, not a secure system.** The accounts and the sample
data live inside `assets/js/portal.js`, which means anyone who opens the page can
read them. That is fine because the data is invented — it must not stay that way
once real client information is involved.

To make it real you need a backend that owns authentication and data. The shape
of the work:

1. **Auth** — a hosted identity provider (Auth0, Clerk, Firebase Auth, Supabase
   Auth) so passwords are never in the page. Magic-link email sign-in suits
   clients who will log in a handful of times.
2. **Data** — one record per transaction, behind an API that checks the signed-in
   user before returning anything. Replace `DEMO_ACCOUNTS` and `DATA` with
   authenticated `fetch()` calls; every render function below them keeps working
   unchanged, since they already take plain data objects.
3. **Who updates it** — someone on the team has to move a deal from "Showings" to
   "Under contract." Either an admin screen, or sync from your CRM or MLS feed.
4. **Privacy** — this holds clients' addresses, offer amounts and documents.
   HTTPS only, no indexing (already set), a real privacy policy, and a deletion
   path after closing.

Until that exists, keep the yellow demo banner at the top of `clientele.html`.
It is the honest label for what the page currently is.

## Publish it

**Netlify** — drag this folder onto [app.netlify.com/drop](https://app.netlify.com/drop),
or connect the repo. The contact form works automatically; submissions appear
under *Site configuration → Forms*.

**GitHub Pages** — *Settings → Pages → Deploy from a branch*, pick this branch
and `/ (root)`. The contact form falls back to opening a pre-filled email.

## The hero neighborhood

Two versions of the same idea, and the page picks one.

**Drawn (always).** `tools/build-skyline.py` generates three parallax layers of
houses as inline SVG and writes them into `index.html` between the SKYLINE
markers. Windows light up on staggered timers, map markers float over three
rooftops. Seeded, so re-running reproduces the same street:

```bash
python3 tools/build-skyline.py        # change SEED first for a new street
```

**3D (desktop only).** `assets/js/scene3d.js` loads Three.js and renders a live
drone orbit over a neighborhood at dusk — pitched roofs, lit windows, streets,
trees, street lamps, and a camera that drifts with your mouse. It crossfades in
over the drawn scene once it's ready.

It deliberately does not run everywhere. It's skipped on screens under 1024px,
when reduced motion is on, on Data Saver, and on machines reporting under 4GB of
RAM or fewer than 4 cores — those all keep the drawn scene, and Three.js is never
even downloaded. The render loop stops completely when the hero scrolls off
screen or the tab is hidden.

**To turn 3D off**, delete this line near the bottom of `index.html`:

```html
<script src="assets/js/scene3d.js" defer></script>
```

The drawn scene stays and nothing else changes.

**A note on weight.** Three.js is 608KB (about 150KB gzipped) and lives in
`assets/vendor/` rather than on a CDN, so there's no third-party request and it
can't break if a CDN does. It's loaded lazily, after the page is interactive, and
only on machines that pass the checks above — so it never delays the content a
lead actually came for. If that tradeoff isn't worth it to you, use the off
switch above.

## Build notes

- **Responsive** 320px to 1920px, verified with no horizontal overflow.
- **Accessible** — skip links, real tab/panel ARIA, visible focus rings, labelled
  form controls, and full `prefers-reduced-motion` support.
- **Motion** — the hero neighborhood (drawn or 3D), an animated aurora, scroll
  reveals, counting stats, pulsing live-stage markers, hover lift on cards. All
  of it stops for reduced-motion users.
- **Works without JavaScript** — reveal animations are gated behind a `.js`
  class, so the main site stays readable. The portal needs JS.
- **Fast** — two stylesheets, two scripts, one webfont family, no trackers.
