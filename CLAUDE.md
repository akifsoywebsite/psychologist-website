@AGENTS.md

# Murad Akifsoy — project guide

## Next.js version warning
- This is Next.js 16 (App Router) with React 19, which has breaking changes from older versions. Read the relevant guide in `node_modules/next/dist/docs/` before writing code, and heed deprecation notices.
- Route `params` are a Promise: `const { slug } = await params;`.

## 1. Project overview
- A Next.js (App Router) + TypeScript + Tailwind v4 website for Murad Akifsoy, a child and teen psychologist (uşaq və yeniyetmə psixoloqu).
- The site is in Azerbaijani (`<html lang="az">`, OG locale `az_AZ`).
- Live at https://www.akifsoy.com (`SITE_URL` in `src/lib/site.ts`).
- A single admin edits all content from the `/idare` dashboard.

## 2. Tech stack and hosting
- Firebase (Firestore, Storage, Auth) is initialized in `src/lib/firebase.ts`, which exports `db`, `storage` and `auth`. The config comes from `NEXT_PUBLIC_FIREBASE_*` env vars.
- Public pages are async server components that read Firestore directly. Dashboard pages are client components.
- Hosted on Vercel and deployed from `main`: every push to `main` goes live.
- Rich text editing uses Tiptap (`src/components/dashboard/rich-text-editor.tsx`).
- Rich content is rendered with `sanitize-html`. Do NOT use `isomorphic-dompurify`, because it crashes on Vercel.
- Icons: `react-icons` for social brand icons, `lucide-react` for everything else.
- `browser-image-compression` handles client-side image compression. `next/image` allows `firebasestorage.googleapis.com` (`next.config.ts`).
- Site icons are `src/app/icon.png`, `src/app/apple-icon.png` and `src/app/favicon.ico`, which Next.js picks up automatically. Don't hardcode icon links.

## 3. Routes
Public (wrapped in Header/Footer by `SiteChrome`, which hides them on `/idare*`):
- `/`: home with hero, services carousel, latest blogs carousel and contact CTA.
- `/haqqimda`: about page (rich bio, skills, image).
- `/xidmetler`: list of services.
- `/xidmetler/[slug]`: one service (rich description).
- `/bloq`: blog listing with category pills and "Daha Çox Göstər" (6 at a time).
- `/bloq/[slug]`: blog post with prev/next and Article JSON-LD.
- `/xeberler`: news listing (same UI as the blog, uses the news collections).
- `/xeberler/[slug]`: news item with prev/next and Article JSON-LD.
- `/elaqe`: contact info, social links and map.
- `sitemap.ts`: static pages plus all published services, blogs and news.
- `robots.ts`: allows `/`, disallows `/idare`, points to the sitemap.

Dashboard (`src/app/idare/layout.tsx` redirects users who aren't logged in to `/idare/login`):
- `/idare/login`: email/password login with a client-side lockout.
- `/idare`: welcome screen and editor for the homepage hero texts.
- `/idare/xidmetler`: create, edit and delete services.
- `/idare/bloqlar`: create, edit and delete blog posts.
- `/idare/kateqoriyalar`: blog categories (won't delete a category that blogs still use).
- `/idare/xeberler`: create, edit and delete news items.
- `/idare/xeber-kateqoriyalari`: news categories (won't delete a category that news items still use).
- `/idare/mezmun`: About page content and contact info/social links (`siteContent/about`, `siteContent/contact`).

## 4. Firestore data model
Types live in `src/lib/types.ts`. Document IDs equal the slug. `status` is `"draft" | "published"`.
- `services`: title, slug, summary, description (HTML), icon, order, imageUrl?, status.
- `blogs`: title, slug, excerpt, content (HTML), category (category slug), coverImage, createdAt (Timestamp), status.
- `categories`: name, slug (blog categories).
- `news`: same fields as `blogs` (`NewsItem` = `Blog`).
- `newsCategories`: name, slug (`NewsCategory` = `Category`), separate from blog categories.
- `siteContent/hero`: eyebrow, fullName, bio, ctaPrimaryText, ctaSecondaryText, marqueeItems[], imageUrl.
- `siteContent/contact`: phone, email, address, workingHours, optional instagram/facebook/linkedin/tiktok/whatsapp/youtube URLs, mapQuery, homeCta* texts.
- `siteContent/about`: eyebrow, heading, bio (HTML), imageUrl, skills[].
- Convert Firestore `Timestamp` to `Date` (`.toDate()`) on the server before passing data to client components.

## 5. Conventions
- **Drafts:** filter with `status !== "draft"` (a missing status counts as published) everywhere content is shown publicly: listings, home sections, prev/next and the sitemap. Direct URLs of draft items must call `notFound()`. In editors, new items default to `"draft"`, and existing items fall back to `status ?? "published"`.
- **Theme:** use only the CSS-variable Tailwind classes (`bg-background`, `text-foreground`, `bg-primary`, `text-muted-foreground`, `border-border`, `bg-card`, `rounded-[var(--radius)]`, etc.). Never use hardcoded hex colors. Tokens are defined in `src/app/globals.css`, and the dashboard overrides them with the `.dashboard-theme` class.
- **Fonts:** Montserrat (`font-sans`, the default) and Lora (`font-serif`, for headings).
- **Rich content:** stored as HTML, sanitized with `sanitize-html` (allowing `img`, `h2` and `h3`), and rendered in a `div` with `className="blog-content"` (styles are in `globals.css`).
- **Images:** upload only through the shared `ImageUpload` (`src/components/dashboard/image-upload.tsx`, which takes a `storagePath`) and `RichTextEditor`. Both compress images first with `src/lib/compress-image.ts`.
- **Slugs:** generated with `src/lib/slugify.ts` and editable in the form.
- **Blogs vs news:** separate sections with separate collections and categories. Both share `BlogCard` and `BlogList` (`src/components/blog/`) through the `basePath` / `emptyMessage` props.
- **Social links** are optional: `SocialLinks` (`src/components/shared/social-links.tsx`) hides platforms with empty URLs.
- **Mobile-first** layouts. All user-facing text is in Azerbaijani.

## 6. Commands
- `npm run dev`: dev server.
- `npm run build`: production build (run it before every push).
- `npx tsc --noEmit`: type check.
- `npm run lint`: ESLint.

## 7. Scripts
- `scripts/seed.ts` (services, categories, blogs) and `scripts/seed-site-content.ts` (siteContent) are one-time Firestore seed scripts, run with `tsx`.
- They contain `ADMIN_EMAIL` and `ADMIN_PASSWORD` constants that must stay EMPTY (`""`) in the repo. Never commit real credentials.

## 8. Security
- `.env.local` holds the Firebase config and is gitignored (`.env*`).
- The repo is PUBLIC: never write secrets, passwords or email addresses into any file.
- The `/idare` login has a client-side lockout after repeated failed attempts (stored in `sessionStorage`).
- Firestore and Storage rules (managed in the Firebase console, not in this repo) allow public read and authenticated-only write.

## 9. Deployment
- Pushing to `main` deploys to Vercel automatically.
- Run `npm run build` before pushing to catch errors.
- The Vercel Hobby plan blocks deployments from private repos with non-owner commit authors, so keep the repo public.
