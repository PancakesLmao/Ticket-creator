# Icon Representation Rule — Lucide Icons Only

1. Always use `@lucide/vue` icon components for all UI controls, status indicators, badges, and decorative ticket emblems across the entire development lifecycle.
2. Never use Unicode emojis (such as rainbow, palette, sparkles, ticket, checkmarks, etc.) anywhere in Vue templates (`.vue`), JavaScript (`.js`), or CSS (`.css`).
3. Never add ad-hoc decorative inline `<svg>` elements when representing icons or emblems; import and render `@lucide/vue` components instead.
4. Exception: Functional scannable data-matrix graphics (1D Barcode bar patterns and 2D QR Code matrices) are permitted as `<svg>` elements.
