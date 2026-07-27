# TokenShade site

The production landing page for TokenShade. It keeps the Sites Vinext build for
local previews and uses a native Next.js static export on Vercel.

It is intentionally one route, has no backend or runtime data calls, uses
system fonts, and reserves explicit dimensions for its imagery. The page is
designed for 320px mobile viewports through wide desktop screens.

```text
npm ci
npm run dev
npm test
npm run build:vercel
npm run build:pages
```
