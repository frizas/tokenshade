# TokenShade site

The production landing page for TokenShade. It keeps the Sites Vinext build for
local previews and uses a native Next.js static export on Vercel.

It is intentionally one route, has no backend, uses system fonts, and reserves
explicit dimensions for its imagery. Google Analytics loads only after a
visitor opts in; events contain fixed interaction names rather than user
content. The page is designed for 320px mobile viewports through wide desktop
screens.

```text
npm ci
npm run dev
npm test
npm run build:vercel
npm run build:pages
```
