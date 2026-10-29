# AGENTS.md

Instructions for AI coding agents working anywhere in this workspace. Each project has its own, more specific file. Read the one for the project you are changing **before** writing code:

| Project | What it is | Agent instructions |
| --- | --- | --- |
| `lumora-app/` | Expo SDK 54 React Native client | [lumora-app/AGENTS.md](lumora-app/AGENTS.md) |
| `lumora-backend/` | Express 5 + Prisma 6 REST API on Neon Postgres | [lumora-backend/AGENTS.md](lumora-backend/AGENTS.md) |
| `lumora-website/` | Static HTML/CSS/JS download site, no build step | [lumora-website/README.md](lumora-website/README.md) |

What's done and what's open across all three: [STATUS.md](STATUS.md).

## 1. Layout facts

- There are **three git repos**. This folder is the `lumora-workspace` repo: these docs, the shared `.claude/agents/` and `lumora-website/`. `lumora-app/` and `lumora-backend/` are **separate git repos**, ignored here by `.gitignore`. Run `git` inside the project you changed, and commit to each one separately.
- The app talks to the backend only over REST. They share no code, so types are duplicated by hand: backend route handlers ↔ `lumora-app/src/api/*.ts`.

## 2. Cross-project contracts

When you change one side of these, change the other side in the same task, or say clearly that you didn't:

| Contract | Backend side | App side |
| --- | --- | --- |
| Endpoint paths and response shapes | `lumora-backend/src/routes/*.ts` (mounted in `src/index.ts`) | `lumora-app/src/api/<resource>.ts` |
| Error shape `{ error: string }` | every `res.status(4xx/5xx).json({ error })` | `apiFetch` reads `data.error` and throws it |
| Auth | `Authorization: Bearer <access token>`, checked by `requireAuth` | added by `apiFetch` from `useAuthStore` |
| Google client ID | `GOOGLE_WEB_CLIENT_ID` | `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` (the values must be equal) |
| Android package | — | `app.json` `android.package` must match the Play URL `id=` in `lumora-website/site.js` |

Order of work for a new endpoint: backend route → app `src/api` function with an explicit response type → screen. The [api-contract-checker](.claude/agents/api-contract-checker.md) agent audits this.

## 3. Product principles for AI features

Lumora deliberately prefers **rule-based, explainable logic** over AI. The daily brief, product verdict and scan suggestions are all rules that cite their data.

- Don't add a new LLM or AI call unless the task asks for it. Extend the existing rules instead.
- The existing Gemini uses (face scan, "from the web" suggestions, identifying products missing from the catalog and Open Beauty Facts) live only in the backend (`src/lib/geminiVision.ts`, `webProductSearch.ts`, `aiProductLookup.ts`). The product lookup only supplies the product's name and ingredients; the verdict and match % stay rule-based. Each one **must keep working without `GEMINI_API_KEY`**, using the heuristic fallback or by hiding the feature. Never call an AI API from the app.
- AI keys stay in the backend `.env` and never get an `EXPO_PUBLIC_` variable.
- Treat AI output as untrusted input: validate and clamp it before storing or showing it.

## 4. Secrets and generated files

Never read out, print, commit or edit these unless that is the task: `**/.env`, `lumora-app/google-services.json`, keystores, `lumora-app/android/`, `lumora-app/.expo/`, `node_modules/`. The beta APK link https://getlumora.site/lumora-beta.apk is a Netlify redirect in `lumora-website/_redirects` to the current EAS preview build (same URL as `betaApkUrl` in `site.js`).

The database in `lumora-backend/.env` is a hosted Neon instance with real data. **Never** run `prisma migrate reset`, `prisma db push --force-reset` or destructive SQL without explicit permission.

## 5. Verification

| Project | Run |
| --- | --- |
| app | `cd lumora-app && npx tsc --noEmit && npm run lint` |
| backend | `cd lumora-backend && npx tsc --noEmit && npm test` |
| website | open the HTML files; there is nothing to build |

The backend has unit tests for `src/lib` (`npm test`); the app has none. Report exactly what you ran and what you didn't. Never claim a change works on a device unless you ran it there.

## 6. AI tooling in this workspace

| Path | Purpose |
| --- | --- |
| `AGENTS.md` (each level) | Instructions that any agent can read (Claude Code, Codex, Cursor, …) |
| `CLAUDE.md` (each level) | Just `@AGENTS.md`, so Claude Code loads the same instructions |
| `.claude/agents/` (each level) | Claude Code subagents for focused reviews |
| `lumora-backend/.agents/skills/` | Prisma skills pinned in `skills-lock.json`. `lumora-backend/.claude/skills` is a symlink to this folder |
| `lumora-app/.claude/settings.json` | Enables the official Expo plugin |

Keep these files short and current. When you change a convention, update the matching AGENTS.md in the same change.
