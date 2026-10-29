# Lumora: Build With AI Hackathon 2026 submission

**Lumora** is a skincare companion for people who buy skincare without knowing whether it suits their skin. It answers one question well: *"Is this product right for me, today?"* Every answer comes from explainable rules, and each one shows the data it used.

| | |
| --- | --- |
| Participant | Anshika Gupta |
| Projects | `lumora-app/` (Expo React Native), `lumora-backend/` (Express 5 + Prisma + Postgres), and this workspace (docs, cross-project AI rules and agents, website). Three git repos: [lumora-app](https://github.com/anshikagupta5451/lumora-app), [lumora-backend](https://github.com/anshikagupta5451/lumora-backend), [lumora-workspace](https://github.com/anshikagupta5451/lumora-workspace) |
| Demo login | `demo@demo.lumora.app` / `Demo@1234` (demo data, see [Run it](#8-run-it)) |
| Live | Website https://getlumora.site · Android beta APK https://getlumora.site/lumora-beta.apk |
| Demo video | TODO(you): link |

---

## 1. Problem

Skincare shoppers in India choose products from ads, influencer posts and marketing labels. Three problems follow:

- **Wrong products.** Ingredient lists are unreadable, so people buy things that clash with their sensitivities or skin type.
- **Wasted money.** Products clash with what's already on the shelf (retinol + AHA), duplicate it, or expire half-used.
- **No context.** Advice ignores today's UV index, air quality and humidity, and how your skin has been this week.

**Who it's for:** people aged 18–35 building a routine on a monthly budget (₹1,000–3,000), who want reasons, not just recommendations.

## 2. The core journey

The demo follows one primary journey:

1. **Onboarding:** skin type, concerns, sensitivities, goals and monthly budget. This becomes the skin profile every rule reads.
2. **Today's brief (Home):** a headline and up to 4 tips. Each tip cites its data: UV 9, AQI 140, humidity 80%, "your niacinamide expires in 5 days", average mood from recent check-ins. It ends with one product pick that respects budget, sensitivities and "Not for me".
3. **"Is this right for me?"**: scan a barcode, or photograph the front of a pack (on-device OCR matched against the catalog and Open Beauty Facts). The verdict checks sensitivities, skin type, concerns, clashes and duplicates with your shelf, budget, and reviews from people with your skin type.
4. **Daily check-in and streak:** mood, note and photos. A nightly 8 pm reminder protects the streak.
5. **Community:** reviews filtered by skin type, a feed, and "Popular in the community".

Supporting features: face scan (Gemini vision with a non-AI heuristic fallback), AM/PM routines, a "My Products" shelf with expiry and low-stock tracking, an ingredient glossary, bounties, admin catalog tools, and three themes.

## 3. Pre-existing work (disclosure)

Lumora existed before the hackathon. Git history (dates are commit dates):

| Period | What git shows |
| --- | --- |
| 24 Jul – 28 Sep 2026 (before the hackathon) | App and backend created. Auth, onboarding, skin profile, weather, community feed/posts/comments/images, check-ins and streaks, routines, shelf, reviews, face scan, and the backend rule engines (`dailyBrief.ts`, `productVerdict.ts`, `ingredientRules.ts`, `scanSuggestions.ts`). 7 app + 9 backend commits, 28 of the 29 database migrations |
| 1 – 30 Oct 2026 (hackathon) | Photo product scanner with on-device OCR + catalog/Open Beauty Facts matching (`productMatch.ts`, `product-scanner.tsx`, `ProductMatchSheet`). "Is this right for me?" screens (`product-check.tsx`, `ProductVerdict`). Daily brief and scan-suggestion UI. Admin catalog screens. Google sign-in. Forgot/reset password. Removal of Expo template leftovers. **All AI context engineering** (AGENTS.md hierarchy, subagents, skills, STATUS.md). **All tests and the bug fixes they led to.** Token refresh. Demo data. Security clean-up. This document |

The first `lumora-app` commit (24 Jul, "Initial commit") is the unmodified `create-expo-app` template.

TODO(you): check this table, and add anything from October that git doesn't show clearly (the October commits are large and have generic messages).

## 4. Architecture

```
┌──────────── lumora-app (Expo SDK 54, RN 0.81) ────────────┐
│ app/          expo-router screens (auth, onboarding, tabs) │
│ src/api/*.ts  one typed module per backend resource        │
│ src/api/client.ts  apiFetch: auth header, 401 → refresh    │
│                    → retry, { error } unwrapping           │
│ zustand + expo-secure-store (tokens), NativeWind, ML Kit   │
└──────────────────────────┬─────────────────────────────────┘
                           │ REST + JSON, Bearer JWT
┌──────────────────────────┴─────────────────────────────────┐
│ lumora-backend (Express 5, TypeScript via tsx)             │
│ src/routes/   thin handlers, requireAuth / requireAdmin    │
│ src/lib/      the product: rule engines (brief, verdict,   │
│               ingredients, matching, suggestions), Gemini  │
│               + heuristic fallback, external clients       │
│ src/jobs/     node-cron streak reminder (Expo push)        │
└───────┬───────────────┬───────────────┬────────────────────┘
   Prisma 6        Open-Meteo,      Gemini (optional),
   Neon Postgres   Open Beauty      Supabase Storage,
                   Facts            Resend (optional)
```

Deeper docs: [lumora-app/docs/ARCHITECTURE.md](lumora-app/docs/ARCHITECTURE.md), [lumora-backend/README.md](lumora-backend/README.md) (routes, env vars, where the logic lives).

### Key decisions and trade-offs

| Decision | Why | Cost |
| --- | --- | --- |
| **Rules over AI for every recommendation** | Skincare advice must be explainable and must not make things up. Each tip and verdict check shows the number or ingredient behind it, and rules can be unit-tested | Less flexible than an LLM; the rule lists need curating |
| **AI only where rules can't see:** face scan, "from the web" suggestions | Pixels and open-web search need a model | Each AI path needs a non-AI fallback, or the feature is hidden when `GEMINI_API_KEY` is missing or quota runs out. Model output is validated and clamped before it is stored |
| **No shared code between app and backend** | Two separate repos with a simple REST contract | Types are duplicated by hand; the `api-contract-checker` agent audits them |
| **Stateless JWT:** 15-minute access token, 30-day refresh token | Simple, no session store | Logout can't revoke a refresh token on the server (listed under limitations) |
| **No build step (`tsx`), Node's built-in test runner** | Fewer moving parts; no new dependencies for tests | `tsx` must be available in production |
| **Hosted Postgres (Neon) from day one** | Same database for development and the beta APK | Destructive commands are banned for agents (see guardrails) |

### Security

- Secrets only in `.env` (git-ignored). `.env.example` lists every variable without values. AI keys exist only on the backend; the app gets no `EXPO_PUBLIC_` AI key.
- bcrypt password hashes. JWT auth on every user route. Writes are scoped to `req.userId`, so users can't touch each other's rows. Admin is an email allowlist.
- Google sign-in verifies the ID token's audience, and refuses unverified emails before linking to an existing account.
- Public user objects only expose `id`/`name`. Password-reset codes are hashed and expire.
- AI output is treated as untrusted input: scores are coerced and clamped to 0–100, boxes to 0–1000, text is length-capped, and `detected` is derived from the score.

## 5. How I used AI

AI tool: **Claude Code** (CLI and VS Code extension). TODO(you): add any other tools you used (Cursor, ChatGPT, Gemini, …) and what for.

AI was used at every stage:

| Stage | How |
| --- | --- |
| Define | Turned the idea into the "one question" scope and the rule lists (sensitivity → ingredient groups, active clashes) |
| Design | Explored data models and the API shape; decided rules vs AI per feature |
| Build | Implemented screens and routes under the AGENTS.md rules |
| Test | Two agents wrote 136 unit tests in parallel (section 6) |
| Review | Reviewer subagents (`app-reviewer`, `backend-reviewer`, `api-contract-checker`) check changes against house rules |
| Document | READMEs, ARCHITECTURE.md, STATUS.md, and this file. The AI drafted them; I edited and checked them against the code |
| Debug | Environment failures (section 7) |

### Context engineering

The AI gets the same layered context every session:

| File | What it gives the AI |
| --- | --- |
| [AGENTS.md](AGENTS.md) (root) | Workspace layout, **cross-project contracts** (endpoint shapes, `{ error }` format, auth header, Google client ID parity), product principle "rules over AI", secrets policy, verification commands |
| [lumora-app/AGENTS.md](lumora-app/AGENTS.md), [lumora-backend/AGENTS.md](lumora-backend/AGENTS.md) | Stack versions (Expo 54, Express **5**, Prisma **6**), conventions (thin routes, ownership scoping, error copy written for users, theming), do-nots |
| `CLAUDE.md` (each level) | Just `@AGENTS.md`, so Claude Code and other agents (Codex, Cursor) read one source |
| [STATUS.md](STATUS.md) | What's done and open, so the AI doesn't rebuild or contradict finished work |
| `.claude/agents/*.md` | Three focused reviewer subagents |
| `lumora-backend/.agents/skills/` | Prisma skills pinned in `skills-lock.json`. I removed the irrelevant ones (MongoDB, Prisma Compute) so they don't distract the model |
| `lumora-app/.claude/settings.json` | Official Expo plugin |

**How the context evolved:** each time the AI got something wrong, the rule went into AGENTS.md. Examples:
- "Express 5: don't wrap handlers in try/catch"
- "never `new PrismaClient()` outside `src/lib/prisma.ts`"
- "write `{ error }`, never `{ message }`"
- "update the matching AGENTS.md when you change a convention"
- "add a test when you change a rule in `src/lib`" (added after the bugs in section 6)

### Guardrails

- **Database:** agents may never run `prisma migrate reset`, `db push --force-reset`, `DROP`/`TRUNCATE`, or a seed against the hosted database without explicit permission. The demo seed only touches `@demo.lumora.app` users and is reversible (`unseed:demo`).
- **Secrets:** agents must never read out, print, commit or edit `.env`, keystores or `google-services.json`. Only variable *names* are inspected.
- **AI features:** no new model calls unless asked; every model call needs a fallback; model output must be validated.
- **Git:** the AI never commits or pushes without asking me. Claude Code's permission system blocked an AI attempt to rewrite git remote URLs (section 7), so that change stays with a human.
- **Verification:** an agent may not claim a change works on a device unless it ran there. It must report exactly which commands it ran.

## 6. AI-assisted QA

**Approach.** The rule engines in `lumora-backend/src/lib` are the product, and they are pure functions, so they get unit tests.
- I briefed two Claude Code agents in parallel with separate modules: (1) verdict, ingredient rules, product matching; (2) daily brief, scan suggestions, heuristic face analysis, Gemini output validation.
- The brief required behaviour, edge and negative tests, no database or network (Gemini is tested through a `fetch` stub), and inputs passed explicitly so tests don't depend on the date.
- Agents were not allowed to change `src/`. Suspected bugs had to be written as *skipped* tests with a `BUG:` reason.

**Result:** 136 tests in 7 files (`lumora-backend/test/`), run with `npm test` (Node's built-in `node:test`, no new dependencies).

**Human validation.** For each reported bug, I (with the AI) read the code, confirmed the bug, fixed it, removed the `skip` and re-ran the suite. **The tests found 10 real bugs. All are fixed, and the suite ends at 136 pass, 0 fail, 0 skipped.**

| # | Bug the tests found | Fix |
| --- | --- | --- |
| 1–4 | **Heuristic face scan measured the whole photo, not face regions.** sharp's `stats()` ignores `extract()`/`convolve()`, so dark circles and oiliness always scored 0, dryness was really overall brightness, and a red background counted as acne | Render each region to raw pixels before taking stats (`faceAnalysis.ts`) |
| 5 | A non-numeric Gemini score (`"high"`) became `NaN` and reached the database | Coerce to a number, default 0, clamp 0–100 |
| 6 | Gemini detection boxes weren't type-checked or clamped | Require numbers, clamp to 0–1000 |
| 7 | The model's `detected` flag was trusted, even when it contradicted the score | Derive it from the clamped score |
| 8 | `ethanol` matched inside **tri*ethanol*amine**, so alcohol-sensitive users were told to avoid products with no drying alcohol | Ingredient names must start a word (also stops "oat" matching "coat") |
| 9 | With no ingredients, price or reviews, the verdict still said "Good fit" | Returns "Not enough info to judge this one yet" |
| 10 | The daily brief could pick a product you **own** but marked "Not for me", or that contains your sensitivity | Same filters as catalog picks |

**Other checks run:** `tsc --noEmit` (app and backend, clean), ESLint (0 errors), and a curl smoke test as the demo user: login, token refresh (valid, garbage, and access-token-as-refresh), streak, feed, popular, shelf, routines, bounties and daily brief.

**Not covered:** route handlers, and the app (no automated UI tests). The face-scan tests use synthetic images, so they check behaviour, not accuracy.

## 7. Learning from AI failures

| What went wrong | What I learned / changed |
| --- | --- |
| The AI wrote a heuristic face analyser that **looked right, passed review and typechecked, but measured the wrong pixels** (sharp `stats()` semantics). Nobody noticed for weeks | Code review isn't enough for numeric code. Tests with synthetic images caught it. New rule in AGENTS.md: changes to `src/lib` rules need a test |
| Bundling failed with `Unable to resolve "react-native-svg"`. The AI first blamed the Metro cache, partly because its file search skipped `node_modules` and it concluded the package wasn't installed | Make the AI check the actual files before guessing. The real cause: the package folder was missing `src/`, which the `react-native` entry points to. Reinstalling that package fixed it |
| The backend crashed: the Prisma client had been generated on Linux (`node_modules` copied between machines) | Added `postinstall: prisma generate`, so every install builds the engine for its own OS |
| The "8 pm" streak reminder used the server clock; on a UTC cloud host it would fire at 1:30 am IST | Pinned the cron to `Asia/Kolkata` and documented `TZ` |
| Settings showed three notification toggles the AI had generated as UI but never wired up | Removed them; Settings now describes only the reminder that exists. Built UI is not a built feature |
| While preparing this submission, the AI found my **GitHub token embedded in the git remote URLs**. Claude Code's permission guard stopped the AI from changing remotes on its own | TODO(you): confirm once done: "I revoked the token and fixed the remotes by hand." Secrets can hide in `.git/config`, not just `.env` |
| Access tokens expired after 15 minutes and nothing used the refresh token, so the app quietly broke mid-session | Added `/auth/refresh`, plus refresh-and-retry in `apiFetch` with a single shared in-flight refresh |

## 8. Run it

```bash
# backend
cd lumora-backend
cp .env.example .env          # fill in DATABASE_URL, JWT secrets
npm install                   # also generates the Prisma client
npx prisma migrate deploy
npm run seed && npm run seed:bounties && npm run seed:demo
npm test                      # 136 tests
npm run dev                   # http://localhost:4000/health

# app
cd ../lumora-app
cp .env.example .env          # EXPO_PUBLIC_API_URL = http://<your PC's Wi-Fi IP>:4000
npm install
npx expo start -c             # dev build: npx expo run:android
```

Log in as `demo@demo.lumora.app` / `Demo@1234`. The account has an 11-day check-in run ending yesterday, so checking in during the demo shows the streak. It also has a shelf with a serum expiring in 5 days, two routines, reviews, posts and bookmarks. Remove all demo data with `npm run unseed:demo`.

TODO(you): deployment link, if you deploy the backend (it is ready: `npm start`, set the env vars and `TZ=Asia/Kolkata`).

## 9. Limitations and next steps

- Backend runs locally; not yet deployed.
- No automated tests for routes or the app.
- Refresh tokens can't be revoked server-side.
- Heuristic face-scan ranges need retuning against real selfies now that the region bug is fixed.
- Premium has a flag but no purchase flow. Shared routines have a database column but no screen.
- Push notifications: only the streak reminder exists.
- Store launch blockers: placeholder Android package name, and the Play signing SHA-1 for Google sign-in.

## 10. Dependencies

Main runtime dependencies: Expo SDK 54, React Native 0.81, expo-router 6, NativeWind 4, zustand 5, expo-camera, ML Kit text recognition, expo-notifications, expo-secure-store / Express 5, Prisma 6, jsonwebtoken, bcrypt, google-auth-library, sharp, node-cron, expo-server-sdk, Supabase JS, Resend.

External services: Neon Postgres, Open-Meteo (no key), Open Beauty Facts (no key), Google Gemini (optional), Supabase Storage, Resend (optional), Expo push.
