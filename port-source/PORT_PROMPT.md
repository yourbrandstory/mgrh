# Port all 9 pages from the readable design source

WHY THE PAGES DON'T MATCH: the files in public/site/*.html are compressed bundles that can't be read, so the pages were rebuilt from guesswork (invented sections, invented text). This folder has the READABLE source of every approved page. Port from these ONLY.

## What's here
- `pages/<page>.dc.html`: one file per page (home, about, facilities, doctors, programmes, events, support, contact, emergency). Each file has three parts:
  1. **Template**: everything between `<x-dc>` and `</x-dc>`. Plain HTML with inline styles. This is the page layout.
  2. **Logic**: the `<script type="text/x-dc" data-dc-script>` block, holding `class Component`. `renderVals()` returns ALL the data the template shows (lists of doctors, facilities, FAQs, contacts, steps, footer columns, nav items, etc.).
  3. **Holes**: `{{ name }}` in the template is filled from `renderVals()`. `<sc-for list="{{ items }}" as="x">` = `items.map(x => ...)`. `<sc-if value="{{ flag }}">` = `{flag && ...}`.
- `images/`: every image the pages use. Copy ALL of them into `public/images/`. In the source, `assets/foo.png` becomes `/images/foo.png`.

## How to port each page (mechanical; no redesign)
1. Template → JSX, element by element, in the same order:
   - `style="a: b; c: d"` → `style={{ a: 'b', c: 'd' }}`, keeping every value exactly.
   - `class` → className, `for` → htmlFor, close void tags.
   - `style-hover="..."` / `style-focus` → a CSS module class with `:hover` / `:focus` and the same values.
   - `<image-slot src="X" ...>` → `<img src="/images/X" style={{ width:'100%', height:'100%', objectFit:'cover' }} />` (keep its alt / object-position).
   - `<helmet>` `@keyframes` → app/globals.css (copy verbatim).
2. Logic → a client component:
   - `state = {...}` → useState; `componentDidMount` → useEffect; `this.setState` → setters.
   - Copy every array in `renderVals()` VERBATIM into a data file next to the page (e.g. `emergency/data.ts`). Text stays word-for-word.
   - `React.createElement('svg', ...)` icons → equivalent inline JSX `<svg>` with the same paths.
3. The shared top band + header + footer + floating button already live in the layout. SKIP those blocks in each page's template (they are identical to the layout). Port everything from the hero down to just before the footer.
4. Doctors / Facilities / Events: port the design exactly, then replace the hard-coded list with Supabase published rows mapped to the SAME fields (keep the hard-coded list as the fallback if a query returns 0 rows).

## Order
Do one page at a time, in this order: emergency, contact, facilities, home, about, doctors, programmes, events, support.
For each page:
- Delete the current src/app/(site)/<page>/page.tsx content and port it fresh from pages/<page>.dc.html. Don't patch the old version.
- Compare it with the reference in the browser: open pages/<page>.dc.html directly (double-click; it renders) next to localhost:3000/<route> at 1440px wide.
- List every visible difference, fix it, and compare again before moving on.

## Do NOT
- invent sections, headings, steps, FAQs or numbers that aren't in the source
- use Tailwind approximations of the inline values
- shorten or reword copy
- change the admin (/admin)

## Report
For each page: "matches" or a list of remaining differences.
