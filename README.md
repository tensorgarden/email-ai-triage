# Email AI Triage

**Smart Inbox & Auto-Drafting** — An AI-powered email dashboard that categorises, prioritises, and drafts responses to incoming emails. Extracts admin tasks, surfaces proposal opportunities, and generates a daily digest — all from your inbox.

---

## The Problem

Knowledge workers spend an average of **28% of their workweek on email** — reading, sorting, replying, and extracting action items (McKinsey Global Institute, 2022). For client-facing teams (consultants, agencies, legal, support), that number climbs higher when you layer on proposal requests, invoice follow-ups, compliance deadlines, and internal coordination.

The real cost is not time spent in the inbox — it is **what falls through the cracks**:

- A DSAR deadline missed by 3 days triggers a GDPR fine
- An RFP sitting unread for 48 hours loses a $180k deal
- A production incident buried in 200 unread messages costs $4,000/hour
- Administrative tasks scattered across email threads go untracked

**Email AI Triage** solves this by acting as an intelligent layer between the inbox and the human, using AI to classify, summarise, prioritise, and even draft responses — turning email from a source of chaos into a structured workflow.

---

## Features

### Smart Inbox Dashboard
- **AI Categorisation** — Every incoming email is automatically classified into one of six categories: Urgent Client, Proposal Request, Invoice, Meeting Follow-up, Spam, or Internal
- **Priority Scoring** — Each email receives a critical / high / medium / low priority rating
- **Filter & Sort** — Filter by category, sort by time received, priority, or sender
- **AI Summaries** — A one-sentence AI summary is shown for every email, reducing time-to-comprehension

### Auto-Drafting
- **AI-Generated Responses** — Draft replies in professional, friendly, or concise tone
- **Send / Edit / Discard** — One-click review pipeline for every AI draft
- **Context-Aware** — Drafts pull from email content, category, and sender context

### Admin Task Extraction
- **Tasks from Emails** — AI extracts actionable tasks from email bodies along with source quotes
- **Due Date Tracking** — Tasks carry deadlines, with visual overdue indicators
- **Task Panel** — All extracted tasks in one view, sorted by urgency

### Daily Digest
- **At-a-Glance Summary** — Total received, triaged, critical items, tasks extracted, drafts ready
- **Category Breakdown Chart** — Visual progress bars showing email distribution across categories
- **AI Highlights** — Auto-generated bullet points summarising the day's key events

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS 3 |
| Testing | Vitest |
| Linting | ESLint (next/core-web-vitals) |
| AI Provider | Pluggable — defaults to mock; ready for OpenAI / Anthropic |
| Database | Supabase (optional, for persistence) |

---

## Architecture

```
email-ai-triage/
├── src/
│   ├── app/
│   │   ├── globals.css          # Tailwind base + global styles
│   │   ├── layout.tsx           # Root layout with metadata
│   │   └── page.tsx             # Main dashboard (single page)
│   └── lib/
│       ├── types.ts             # TypeScript interfaces and type definitions
│       └── demo-data.ts         # 12 fictional emails, drafts, tasks, digest
├── tests/
│   └── email.test.ts            # 15 unit tests covering data integrity and logic
├── public/                      # Static assets
└── ...config files              # Next, Tailwind, ESLint, Vitest, PostCSS
```

### Component Architecture

The dashboard is a single-page app built with inline components for zero external dependencies:

- **HeroStats** — Five stat cards across the top: unread, triaged, drafts, tasks, AI accuracy
- **EmailList** — Sortable, filterable inbox with expandable email rows
- **EmailRow** — Expandable row showing AI summary, full body, draft response, and extracted tasks
- **DraftPanel** — Sidebar widget listing all AI-generated drafts ready to send
- **TasksPanel** — Sidebar widget with all extracted admin tasks, sorted by due date
- **DailyDigestPanel** — Today's highlights and key metrics in a single card
- **CategoryBreakdown** — Visual progress bar chart of email distribution

### Data Flow

```
Email Inbox ──► AI Classifier ──► Categorised + Prioritised Email
                      │
                      ├──► AI Summariser ──► One-line summary per email
                      ├──► AI Drafter ──► Draft response (send/edit/discard)
                      ├──► Task Extractor ──► Admin tasks with due dates + source quotes
                      └──► Digest Generator ──► Daily summary with highlights
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
# Open http://localhost:3000

# Run tests
npm test

# Type check
npm run typecheck

# Lint
npm run lint

# Production build
npm run build
```

---

## Demo Data

The dashboard ships with **12 fictional but realistic email threads** across all six categories:

| Category | Count | Examples |
|----------|-------|----------|
| Urgent Client | 2 | Production outage, GDPR DSAR deadline |
| Proposal Request | 2 | $180k chatbot RFP, analytics dashboard scope |
| Invoice | 2 | Payment reminder, Q2 retainer approval |
| Meeting Follow-up | 2 | Q3 roadmap actions, client kickoff summary |
| Spam | 2 | LinkedIn growth scam, domain expiry phishing |
| Internal | 2 | New starter onboarding, engineering survey |

This produces:
- **7 AI-generated draft responses** across three tones
- **13 extracted administrative tasks**, 10 with due dates
- **1 daily digest** with 5 AI-generated highlights

---

## Safety & Guardrails

### Data Handling
- All demo data is **fully fictional** — names, companies, email addresses, and dollar amounts are synthetic and do not correspond to real entities
- No real PII, credentials, or API keys are included in the repository
- The `.env.example` file documents required environment variables without exposing secrets

### AI Actions
- The `ENABLE_REAL_OUTBOUND_ACTIONS` flag defaults to `false` — all "Send" buttons are no-ops in demo mode
- AI provider defaults to `mock` — no external API calls are made without explicit configuration
- Draft responses are clearly labelled "AI-Generated" to prevent accidental sending of un-reviewed content

### Repository Hygiene
- `.gitignore` excludes `.env`, `.env.local`, build artifacts (`.next/`), and generated files (`.generated/`)
- TypeScript strict mode catches type-level errors at build time
- ESLint `max-warnings=0` enforces a zero-warning policy
- `vitest run` validates data integrity before any build or deploy

---

## Roadmap

- [ ] Real AI provider integration (OpenAI / Anthropic) with streaming responses
- [ ] Supabase persistence layer for emails, drafts, tasks
- [ ] Playwright E2E screenshot tests
- [ ] Dark mode support
- [ ] Multi-inbox / multi-user support
- [ ] Email ingestion via IMAP or webhook
- [ ] Proposal document generation from email content

---

## License

This is a portfolio demonstration project. All rights reserved.

---

Built by [TensorGarden](https://github.com/tensorgarden) — showcasing AI-augmented workflows for client-facing teams.
