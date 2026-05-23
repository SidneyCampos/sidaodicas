<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know
This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# PROJECT CONTEXT
Name: Sidão Dicas
Type: High-Conversion Affiliate Marketing Portal & PWA (Progressive Web App).
Goal: Drive massive mobile traffic from short videos to a storefront, applying heavy psychological sales triggers, and funneling users to WhatsApp VIP Groups or direct affiliate links.

# STACK
- Frontend: Next.js (App Router), React, Tailwind CSS.
- Icons: Lucide React.
- Architecture: API-ready (currently using mock data, but structure must allow seamless REST/GraphQL API integration later).

# PSYCHOLOGICAL UI/UX & SALES RULES (NON-NEGOTIABLE)
1. **Color Palette:** Dark Mode by default (Bg: `#0f172a` or similar). Primary accent is High-Energy Yellow (`bg-yellow-400`, text-black). Trust/Action color is WhatsApp Green (`bg-[#25D366]`).
2. **Visual Hierarchy & FOMO:** Every product MUST display a slashed original price (gray/red) and a massive highlighted discount price. Use visual triggers like "Achado do Dia", "Esgotando", or "🔥".
3. **Mobile-First Extremism:** The thumb zone is sacred. CTAs (Call to Action buttons) must be massive, easy to tap, and sticky when possible. Desktop view is secondary but must scale gracefully to a grid.
4. **Cognitive Ease:** Minimum reading, maximum visual impact. Use clear typography (sans-serif, bold for prices).

# ARCHITECTURE & CLEAN CODE RULES
1. **Componentization:** Break UIs down. Do not write a 500-line `page.js`. Create a `src/components/` folder for reusable parts (e.g., `ProductCard.jsx`, `Header.jsx`).
2. **Naming Conventions:** 
   - Folders/Routes: `kebab-case` (e.g., `app/ofertas-do-dia`).
   - Components: `PascalCase` (e.g., `ProductCard.jsx`).
   - Functions/Hooks: `camelCase`.
3. **SEO Mastery:** Use semantic HTML (`<article>`, `<section>`, `<nav>`). Always utilize Next.js Metadata API for dynamic titles, descriptions, and OpenGraph tags to ensure links look perfect when shared on WhatsApp.
4. **API Readiness:** Isolate data fetching. Create a separate file or function for mock data (e.g., `src/data/mockProducts.js`) so it can be swapped for a real `fetch()` to a backend/API later without touching the UI components.
5. **No Placeholders:** Generate complete, functional code blocks. Do not use `// ... rest of the code`.