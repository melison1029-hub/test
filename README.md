# SERHANT. — Buyer & Seller Presentation Site

A one-page, black-and-white presentation site in the SERHANT. visual language,
built for winning listings and signing buyers. Static HTML, CSS and vanilla
JavaScript — no build step, no framework, no dependencies to keep up with.

```
index.html              the whole page (sections are commented)
assets/css/styles.css   all styling; design tokens at the top
assets/js/main.js       nav, tabs, reveals, counters, form
assets/img/             your photos (see assets/img/README.md)
favicon.svg             browser tab mark
netlify.toml            optional deploy + form config
```

## See it right now

Open `index.html` in a browser by double-clicking it. Everything works from
the file system except the contact form's direct send, which falls back to
opening a pre-filled email.

To run it on a local server instead:

```bash
python3 -m http.server 8000     # then open http://localhost:8000
```

## Before you present — the edit checklist

Everything below is marked in the code with an `EDIT:` or `VERIFY` comment.

1. **Contact details** — phone, email and office in the Contact section of
   `index.html`, plus `MAILTO` near the bottom of `assets/js/main.js`.
2. **Stats** — the four figures in the Stats section are brand-level claims.
   Confirm each against the current SERHANT. brand deck and update the
   `data-count` values before you show this to a client.
3. **About** — replace the two placeholder paragraphs with your story, and
   fill in markets, specialties, license number and languages.
4. **Testimonials** — swap in three real client quotes with names and roles.
5. **Listings** — real addresses, specs and prices; drop the photos into
   `assets/img/` using the filenames in that folder's README.
6. **Legal** — confirm the brokerage disclosure, license line and any
   state-required advertising language in the footer with SERHANT. compliance.
7. **Photos** — portrait and listing images per `assets/img/README.md`.

Nothing above will break the layout if you leave it for later: missing photos
fall back to branded panels, so the page always presents cleanly.

## Publish it

**Netlify (easiest, and the contact form works):** drag this folder onto
[app.netlify.com/drop](https://app.netlify.com/drop), or connect this repo.
Form submissions land under *Site configuration → Forms*.

**GitHub Pages:** repo *Settings → Pages → Deploy from a branch*, pick this
branch and the `/ (root)` folder. The form will fall back to opening an email.

**Your own domain or a SERHANT. subdomain:** upload the whole folder to any
static host. It's plain files — nothing to compile.

## Notes on the build

- **Responsive** from 320 px phones up to wide desktop.
- **Accessible**: skip link, semantic landmarks, real tab/panel ARIA with
  arrow-key support, visible focus rings, and full `prefers-reduced-motion`
  support.
- **Print-ready**: `Cmd/Ctrl + P` produces a clean black-on-white leave-behind
  with both the buyer and seller sections expanded.
- **Fast**: one stylesheet, one script, one webfont. No trackers.
- **Deep links**: `#sellers` and `#buyers` open the matching panel directly —
  handy for texting a prospect straight to their side of the page.

## Brand note

The design follows SERHANT.'s public visual language — monochrome, heavy
grotesque type, hairline rules, editorial spacing. Run the finished page past
SERHANT. marketing/compliance before pointing a public domain at it, and use
the official logotype files in place of the type-set wordmark if the brand
team provides them.
