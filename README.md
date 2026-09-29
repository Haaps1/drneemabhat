# Dr. Neema Bhat — Website

Static homepage for Dr. Neema Bhat, Hematologist & Pediatric Oncologist, Bangalore.
No build step: open `index.html` or serve the folder with any static host.

```
index.html              Homepage (semantic HTML, SEO meta, Physician JSON-LD)
assets/css/styles.css   Design tokens, layout, responsive rules, motion
assets/js/main.js       Interactions (cell canvas, reveals, tabs, BMT dial, journey, form)
assets/images/          Logo (transparent), logo mark (favicon)
```

## Before going live

1. **Portrait** — add Dr. Bhat's professional photo as `assets/images/dr-neema-bhat.webp`
   (portrait orientation, ~800×1000). Until it exists, the hero shows the logo mark instead.
2. **Contact details** — set the phone / WhatsApp number and location in the `CONFIG`
   object at the top of `assets/js/main.js` and replace the `+91 00000 00000` placeholders in `index.html`
   (they're the no-JavaScript fallback).
3. **Verify content** — confirm credentials, hospital affiliation, transplant numbers and
   consultation languages (English, Kannada, Hindi) with Dr. Bhat.

## Notes

- Motion respects `prefers-reduced-motion`; canvases pause when off-screen.
- The appointment form has no backend: it opens WhatsApp with a pre-filled message.
