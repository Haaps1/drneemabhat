# Dr. Neema Bhat — Website

Static homepage for Dr. Neema Bhat, Hematologist & Pediatric Oncologist, Bangalore.
No build step: open `index.html` or serve the folder with any static host.

```
index.html              Homepage (semantic HTML, SEO meta, Physician JSON-LD)
assets/css/styles.css   Design tokens, layout, responsive rules, motion
assets/js/main.js       Interactions (cell canvas, reveals, tabs, BMT dial, journey, form)
assets/images/          Portrait (2 sizes), logo, logo mark (favicon)
assets/fonts/           Self-hosted Poppins & Inter (SIL Open Font License)
```

## Updating content

- **Contact details** live in the `CONFIG` object at the top of `assets/js/main.js`
  (phone, WhatsApp, location). The same values are also in `index.html` as the no-JavaScript fallback.
- **Portrait**: `assets/images/dr-neema-bhat.webp` (1200w) and `dr-neema-bhat-720.webp` (720w),
  a transparent cut-out that sits in front of the hero arch. To swap it, replace both files with the same names.

## Notes

- Motion respects `prefers-reduced-motion`; canvases pause when off-screen.
- The appointment form has no backend: it opens WhatsApp with a pre-filled message.
- The hero animation uses fewer cells and runs at 30fps on phones, pauses in background tabs, and halves itself automatically on slow devices.
- FAQ answers are general information; review them with Dr. Bhat before launch.
