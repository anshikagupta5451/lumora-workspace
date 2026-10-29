# Lumora

A skincare companion: a React Native app, the REST API behind it, and a static download site.

```
lumora/                this folder: the lumora-workspace repo
├── lumora-app/        Expo SDK 54 app (its own git repo)
├── lumora-backend/    Express 5 + Prisma API (its own git repo)
├── lumora-website/    static landing, download and privacy pages
├── STATUS.md          what's done and what's open, across all three
├── HACKATHON.md       the hackathon submission write-up
├── AGENTS.md          rules for AI coding agents (CLAUDE.md points here)
└── .claude/agents/    workspace-level Claude Code subagents
```

| Repository | Holds |
| --- | --- |
| [lumora-workspace](https://github.com/anshikagupta5451/lumora-workspace) | This folder: workspace docs, cross-project AI rules and agents, the website |
| [lumora-app](https://github.com/anshikagupta5451/lumora-app) | The Android app |
| [lumora-backend](https://github.com/anshikagupta5451/lumora-backend) | The REST API |

To work on everything locally, clone the workspace, then clone the app and backend inside it (they are git-ignored here).

## Start here

| I want to… | Read |
| --- | --- |
| Judge the hackathon submission | [HACKATHON.md](HACKATHON.md) |
| Run the app | [lumora-app/README.md](lumora-app/README.md) |
| Run the API | [lumora-backend/README.md](lumora-backend/README.md) |
| Publish the website | [lumora-website/README.md](lumora-website/README.md) |
| Understand the app's code | [lumora-app/docs/ARCHITECTURE.md](lumora-app/docs/ARCHITECTURE.md) |
| See project status | [STATUS.md](STATUS.md) |
| Contribute | [lumora-app/CONTRIBUTING.md](lumora-app/CONTRIBUTING.md) |

Local development: start the backend (`npm run dev` on port 4000), then set `EXPO_PUBLIC_API_URL` in `lumora-app/.env` to your machine's LAN IP and run `npm run android`.

## Working with AI agents

Instructions are layered. An agent reads the root [AGENTS.md](AGENTS.md) for cross-project rules, then the AGENTS.md of the project it is changing. Each `CLAUDE.md` contains only `@AGENTS.md`, so Claude Code and other agents follow the same rules.

Subagents (in Claude Code, ask for one by name, e.g. "use the app-reviewer agent"):

| Agent | Where | Use it for |
| --- | --- | --- |
| `api-contract-checker` | `.claude/agents/` | checking that app API calls match backend routes after an endpoint change |
| `app-reviewer` | `lumora-app/.claude/agents/` | reviewing app changes against the house rules (Text import, theming, apiFetch, …) |
| `backend-reviewer` | `lumora-backend/.claude/agents/` | reviewing route, Prisma and migration changes |

Recommended loop for a feature: tell the agent which project it touches → let it make the change → run the project's checks (see AGENTS.md §5) → run the matching reviewer agent → update STATUS.md if a checklist item changed.
