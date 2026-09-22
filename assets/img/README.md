# Images

`logo-navy.png` and `logo-white.png` are knockouts generated from the logo you
supplied — navy for light backgrounds, white for dark. `team/` holds the four
headshots.

The headshots came from screenshots, so they top out around 500px wide. They're
sharp at the size the cards use, but if you have the original files, drop them in
at the same names for better quality on large screens.

`listings/` holds the featured property. Each photo exists twice: `name.jpg` at
full size for the lightbox, and `name-sm.jpg` for the thumbnail grid.

Those files still carry the `©2026 MOREMLS` watermark. Replace them with the
unwatermarked originals before the site goes public.

To add another property, copy the `<article class="feature">` block in
`index.html`, point its images at new files here, and add the full-size paths to
the `GALLERY` array near the bottom of `assets/js/main.js`. Export at
1600 × 1200 or larger, JPEG 70–80%, under ~400KB each.

For link previews when the site is shared, add `og-cover.jpg` at 1200 × 630.
