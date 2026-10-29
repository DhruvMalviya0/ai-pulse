# AI Pulse

AI Pulse helps a company understand how well its people use AI at work, team by team.

- **Employees** sign in, pick their organization, and take a short diagnostic that adapts to their job role and seniority. One open-ended answer is scored by an LLM.
- **Each employee** gets a private report: maturity level, risks, what the AI said about their written answer, a policy reality check, and next steps for their role. They can delete their data at any time.
- **Company admins** see a dashboard of AI maturity by team, top risks, and how well the AI policy is actually landing. No group smaller than 5 respondents is ever shown.
- Some users (consultants, group-company HR) belong to **more than one organization** and choose one after login.

> **Assessment submission.** This repo was inherited from a developer who left. The original history is kept; my work is on top of it, one branch per unit of work, each merged with `--no-ff` (`git log --graph --oneline`).

---

## What to expect

| Area | In short | Details |
|---|---|---|
| **Security and correctness fixes** | 26 bugs found in the inherited code (V1–V26), plus 7 from a second review (V27–V33). The worst: any admin could read any company's dashboard, the signing key was committed to git, and AI replies were stored without any checks. | [`docs/SECURITY_AUDIT.md`](docs/SECURITY_AUDIT.md) |
| **Tests** | 8 tests (1 failing) became **95 passing**. Every fix has a test that fails on the original code. | [`docs/SUBMISSION_DETAILS.md`](docs/SUBMISSION_DETAILS.md#what-i-fixed) |
| **Trustworthy AI scoring** | Model replies are validated, never repaired. Anything off-contract becomes `needs_review` and counts towards nothing. The model can't invent risk labels about people. | [`docs/SUBMISSION_DETAILS.md`](docs/SUBMISSION_DETAILS.md#making-the-ai-trustworthy) |
| **Client request 1** | No team under 5 respondents is shown on its own. Small teams are pooled into "Other teams", or left out of every number. | [`docs/SUBMISSION_DETAILS.md`](docs/SUBMISSION_DETAILS.md#the-clients-request) |
| **Client request 2** | Employees can delete their own data, and it disappears from every dashboard immediately. | [`docs/SUBMISSION_DETAILS.md`](docs/SUBMISSION_DETAILS.md#the-clients-request) |
| **My feature** | Policy reality check: compares what people say about the AI policy with how they actually handle data. | [`docs/SUBMISSION_DETAILS.md`](docs/SUBMISSION_DETAILS.md#my-feature-policy-reality-check) |
| **Known gaps** | The leaked key must be rotated. The live AI model, Docker and CI have not been verified. | [`docs/SUBMISSION_DETAILS.md`](docs/SUBMISSION_DETAILS.md#what-i-deliberately-left) |

### Docs

- [`docs/SUBMISSION_DETAILS.md`](docs/SUBMISSION_DETAILS.md): the full write-up (findings, fixes, AI scoring, client requests, my feature, what was left, how I used AI tools)
- [`docs/CODE_WALKTHROUGH.md`](docs/CODE_WALKTHROUGH.md): every file and function, with the broken code next to the repaired code
- [`docs/SECURITY_AUDIT.md`](docs/SECURITY_AUDIT.md): all 33 findings with evidence and severity
- [`docs/PLAN.md`](docs/PLAN.md): how I prioritised the work
- [`docs/DEMO.md`](docs/DEMO.md): recording walkthrough

---

## Run it

Needs Python 3.12+ and Node 20+.

```bash
# Backend
cd backend
cp .env.example .env              # APP_ENV=dev; never commit .env
python -m venv .venv
source .venv/Scripts/activate     # Windows Git Bash (PowerShell: .venv\Scripts\Activate.ps1; macOS/Linux: source .venv/bin/activate)
pip install -r requirements-dev.txt
python -m app.seed                # demo data, password for everyone: pulse123
uvicorn app.main:app --reload     # http://localhost:8000/docs

# Frontend (second terminal)
cd frontend
npm install
npm run dev                       # http://localhost:5173

# Tests
cd backend
python -m pytest                  # 95 tests, ~6s
python -m app.eval                # AI scoring evaluation
```

Docker alternative: `docker compose up --build` gives the app on http://localhost:8080 and the API on :8000 (not yet verified).

If the backend says `SECRET_KEY must be set`, run `cp .env.example .env`. If you pulled over an older checkout, re-run `python -m app.seed`, because the database schema changed.

### Demo accounts (password `pulse123`)

| Email | Organization(s) | What to look at |
|---|---|---|
| asha@northwind.test | Northwind (admin) | Full dashboard: Sales and Support shown, Engineering + HR pooled into "Other teams" |
| meera@bluepeak.test | Bluepeak (admin) | Only 2 respondents, so the dashboard shows **no** scores or risks |
| ravi@consult.test | Northwind employee, Bluepeak admin | Multi-org: can't reach Northwind's dashboard from either login |
| neha@northwind.test | Northwind (Sales) | Report with a policy *gap* and the private evidence behind it |
| farah@northwind.test | Northwind (Sales) | Hasn't taken the diagnostic, so try the full flow |
| vikram@northwind.test | Northwind (Sales) | Delete their data and watch Sales drop below 5 and vanish from the dashboard |

### Configuration (`backend/.env`)

| Variable | Default | Notes |
|---|---|---|
| `APP_ENV` | `production` | Secure by default. `dev`/`test` allow seeding and an auto-generated secret. |
| `SECRET_KEY` | *(required in production)* | 32+ random chars. Production refuses to start without it. |
| `DATABASE_URL` | `sqlite:///./aipulse.db` | |
| `CORS_ORIGINS` | `http://localhost:5173` | Comma-separated. |
| `MIN_GROUP_SIZE` | `5` | Can be raised, never below 5. |
| `AI_MODE` | `mock` | `mock` = canned replies (they ignore what you wrote; labelled "demo mode" in the UI). `live` = `LLM_API_URL` / `LLM_API_KEY` / `LLM_MODEL` (OpenAI-compatible). Production refuses to start unless this is `live`. |

## Project layout

```
backend/app/        API: auth, config, routes (auth, diagnostic, reports, dashboard), services (questions, llm, scoring, aggregation, policy_check), seed, eval
backend/data/       question bank, canned AI replies, AI evaluation set
backend/tests/      95 tests
frontend/src/       React app: Login, OrgPicker, Diagnostic, Report, Dashboard
docs/               full write-up, code walkthrough, audit, plan, demo script
```
