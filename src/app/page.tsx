"use client";

import { useMemo, useState } from "react";
import {
  demoEmails,
  demoDigest,
  demoStats,
  demoDrafts,
  demoTasks,
  demoReviewQueue,
} from "@/lib/demo-data";
import type {
  EmailThread,
  TriageCategory,
  PriorityLevel,
  SortKey,
  SortDirection,
  DailyDigest,
  DashboardStats,
  ReviewQueueItem,
} from "@/lib/types";

// ─────────────────────── Inline UI Components ───────────────────────

function Badge({
  label,
  variant = "default",
}: {
  label: string;
  variant?: "default" | "critical" | "high" | "medium" | "low" | "success";
}) {
  const colourMap: Record<string, string> = {
    default: "bg-slate-100 text-slate-700",
    critical: "bg-red-100 text-red-800",
    high: "bg-amber-100 text-amber-800",
    medium: "bg-blue-100 text-blue-800",
    low: "bg-slate-100 text-slate-600",
    success: "bg-emerald-100 text-emerald-800",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${colourMap[variant] ?? colourMap.default}`}
    >
      {label}
    </span>
  );
}

function StatusDot({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${active ? "bg-accent shadow-[0_0_6px_rgba(91,91,214,0.6)]" : "bg-slate-300"}`}
      aria-label={active ? "Unread" : "Read"}
    />
  );
}

function StatCard({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: number | string;
  sublabel?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-3xl font-bold tracking-tight text-ink">
        {value}
      </p>
      {sublabel && (
        <p className="mt-1 text-xs text-slate-400">{sublabel}</p>
      )}
    </div>
  );
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

function ProgressBar({
  value,
  max,
  colour = "bg-accent",
}: {
  value: number;
  max: number;
  colour?: string;
}) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className={`h-full rounded-full transition-all duration-500 ${colour}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ─────────────────────── Helpers ───────────────────────

const CATEGORY_LABELS: Record<TriageCategory, string> = {
  "urgent-client": "Urgent Client",
  "proposal-request": "Proposal Request",
  invoice: "Invoice",
  "meeting-follow-up": "Meeting Follow-up",
  spam: "Spam",
  internal: "Internal",
};

const CATEGORY_COLOURS: Record<TriageCategory, string> = {
  "urgent-client": "bg-red-500",
  "proposal-request": "bg-amber-500",
  invoice: "bg-blue-500",
  "meeting-follow-up": "bg-violet-500",
  spam: "bg-slate-400",
  internal: "bg-emerald-500",
};

const PRIORITY_BADGE: Record<PriorityLevel, "critical" | "high" | "medium" | "low"> = {
  critical: "critical",
  high: "high",
  medium: "medium",
  low: "low",
};

const REVIEW_REASON_LABELS: Record<ReviewQueueItem["reason"], string> = {
  "low-confidence": "Low confidence",
  "critical-client": "Critical client",
  "legal-risk": "Legal risk",
};

const REVIEW_LOCKS_BY_EMAIL_ID = new Map(
  demoReviewQueue
    .filter((item) => item.autoSendBlocked)
    .map((item) => [item.emailId, item]),
);

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function formatDueDate(iso: string | null): string {
  if (!iso) return "No deadline";
  const due = new Date(iso);
  const now = new Date();
  const diffMs = due.getTime() - now.getTime();
  const diffHrs = Math.round(diffMs / 3600_000);
  if (diffHrs < 0) return `Overdue by ${Math.abs(diffHrs)}h`;
  if (diffHrs < 24) return `Due in ${diffHrs}h`;
  const diffDays = Math.round(diffHrs / 24);
  return `Due in ${diffDays}d`;
}

// ─────────────────────── Sections ───────────────────────

function HeroStats({ stats }: { stats: DashboardStats }) {
  return (
    <section className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-5">
      <StatCard label="Unread" value={stats.unread} sublabel="awaiting review" />
      <StatCard
        label="Triaged"
        value={stats.triaged}
        sublabel={`${stats.criticalCount} critical`}
      />
      <StatCard label="Drafts Ready" value={stats.drafted} sublabel="AI-generated" />
      <StatCard
        label="Tasks Extracted"
        value={stats.tasksExtracted}
        sublabel="from emails"
      />
      <StatCard
        label="AI Accuracy"
        value="92%"
        sublabel="category match"
      />
    </section>
  );
}

function CategoryBreakdown({ digest }: { digest: DailyDigest }) {
  const categories = Object.entries(digest.categoryBreakdown) as [
    TriageCategory,
    number,
  ][];
  const max = Math.max(...categories.map(([, n]) => n), 1);

  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Category Breakdown
      </h3>
      <div className="space-y-3">
        {categories.map(([cat, count]) => (
          <div key={cat}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-ink">
                {CATEGORY_LABELS[cat]}
              </span>
              <span className="text-slate-500">{count}</span>
            </div>
            <ProgressBar
              value={count}
              max={max}
              colour={CATEGORY_COLOURS[cat]}
            />
          </div>
        ))}
      </div>
    </Card>
  );
}

function DailyDigestPanel({ digest }: { digest: DailyDigest }) {
  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Daily Digest — {digest.date}
      </h3>
      <ul className="space-y-2">
        {digest.highlights.map((h, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
            <span className="mt-0.5 shrink-0 text-accent">&#9679;</span>
            {h}
          </li>
        ))}
      </ul>
    </Card>
  );
}

function ReviewQueuePanel() {
  const reviewItems = demoReviewQueue.map((item) => ({
    item,
    email: demoEmails.find((email) => email.id === item.emailId),
  }));

  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Human Review Queue ({demoReviewQueue.length})
      </h3>
      <div className="space-y-3">
        {reviewItems.map(({ item, email }) => (
          <div key={item.id} className="rounded-lg border border-amber-100 bg-amber-50/50 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">
                  {email?.subject ?? "Unknown email"}
                </p>
                <p className="mt-0.5 text-xs text-amber-700">
                  {REVIEW_REASON_LABELS[item.reason]} &middot; Auto-send blocked
                </p>
                <p className="mt-0.5 text-xs text-amber-700">
                  Owner: {item.approvalOwner} &middot; SLA: {item.reviewSlaHours}h
                </p>
              </div>
              <Badge label="Review" variant="high" />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              {item.riskNote}
            </p>
            {item.evidenceQuotes.length > 0 && (
              <div className="mt-2 rounded-md border border-amber-200 bg-white/70 p-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                  Evidence to verify
                </p>
                <ul className="mt-1 space-y-1">
                  {item.evidenceQuotes.map((quote) => (
                    <li
                      key={quote}
                      className="text-xs italic leading-relaxed text-slate-600"
                    >
                      &ldquo;{quote}&rdquo;
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {item.verificationChecklist.length > 0 && (
              <div className="mt-2 rounded-md border border-slate-200 bg-white/70 p-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Verification checklist
                </p>
                <ul className="mt-1 space-y-1">
                  {item.verificationChecklist.map((step) => (
                    <li
                      key={step}
                      className="flex gap-1 text-xs leading-relaxed text-slate-600"
                    >
                      <span aria-hidden="true" className="mt-0.5 text-amber-600">
                        ✓
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p className="mt-2 text-xs font-medium text-slate-700">
              Next: {item.reviewerAction}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function EmailRow({ email }: { email: EmailThread }) {
  const [expanded, setExpanded] = useState(false);
  const reviewLock = REVIEW_LOCKS_BY_EMAIL_ID.get(email.id);

  return (
    <div className="border-b border-slate-100 last:border-b-0">
      <button
        type="button"
        className="flex w-full items-center gap-3 px-1 py-3 text-left transition-colors hover:bg-slate-50"
        onClick={() => setExpanded((p) => !p)}
        aria-expanded={expanded}
      >
        <StatusDot active={!email.isRead} />
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
          {email.sender.avatarInitials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`truncate text-sm ${email.isRead ? "font-normal text-slate-600" : "font-semibold text-ink"}`}
            >
              {email.subject}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-2">
            <span className="text-xs text-slate-400">
              {email.sender.name} &middot; {formatRelativeTime(email.receivedAt)}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge label={CATEGORY_LABELS[email.category]} />
          <Badge label={email.priority} variant={PRIORITY_BADGE[email.priority]} />
        </div>
        <span className="text-xs text-slate-400">
          {expanded ? "▲" : "▼"}
        </span>
      </button>

      {expanded && (
        <div className="space-y-3 border-t border-slate-100 bg-slate-50/50 px-4 py-4">
          {/* AI Summary */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-accent">
              AI Summary
            </span>
            <p className="mt-1 text-sm leading-relaxed text-slate-700">
              {email.aiSummary}
            </p>
          </div>

          {/* Email body preview */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Email Body
            </span>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-600 line-clamp-6">
              {email.body}
            </p>
          </div>

          {/* Draft response */}
          {email.draftResponse && (
            <div className="rounded-lg border border-accent/20 bg-accent/5 p-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-accent">
                AI Draft Response &middot; {email.draftResponse.tone}
              </span>
              <p className="mt-1 text-xs text-slate-500">
                Subject: {email.draftResponse.subject}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {email.draftResponse.body}
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  disabled={Boolean(reviewLock)}
                  aria-describedby={reviewLock ? `${email.id}-review-lock` : undefined}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                    reviewLock
                      ? "cursor-not-allowed bg-amber-200 text-amber-900"
                      : "bg-accent text-white hover:bg-accent/90"
                  }`}
                >
                  {reviewLock ? "Review required" : "Send"}
                </button>
                <button
                  type="button"
                  className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                >
                  Discard
                </button>
              </div>
              {reviewLock && (
                <p
                  id={`${email.id}-review-lock`}
                  className="mt-2 text-xs font-medium text-amber-700"
                >
                  Review before send: {reviewLock.reviewerAction} &middot; Owner: {reviewLock.approvalOwner}
                </p>
              )}
            </div>
          )}

          {/* Extracted tasks */}
          {email.extractedTasks.length > 0 && (
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                Extracted Tasks ({email.extractedTasks.length})
              </span>
              <ul className="mt-2 space-y-2">
                {email.extractedTasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-start justify-between rounded-lg border border-slate-200 bg-white p-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink">
                        {task.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {task.description}
                      </p>
                      <p className="mt-1 text-xs italic text-slate-400">
                        &ldquo;{task.sourceQuote}&rdquo;
                      </p>
                    </div>
                    <span
                      className={`ml-4 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                        task.dueDate && new Date(task.dueDate).getTime() < Date.now()
                          ? "bg-red-50 text-red-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {formatDueDate(task.dueDate)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DraftPanel() {
  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
        AI Drafts Ready ({demoDrafts.length})
      </h3>
      <div className="max-h-96 space-y-3 overflow-y-auto">
        {demoDrafts.map((draft) => {
          const email = demoEmails.find((e) => e.id === draft.emailId);
          const reviewLock = REVIEW_LOCKS_BY_EMAIL_ID.get(draft.emailId);
          return (
            <div
              key={draft.id}
              className="rounded-lg border border-slate-200 p-3 transition-colors hover:border-accent/30"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink">
                  {email?.sender.name ?? "Unknown"}
                </span>
                <Badge label={draft.tone} variant="success" />
              </div>
              <p className="mt-1 text-sm font-medium text-ink">
                {draft.subject}
              </p>
              <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                {draft.body}
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  disabled={Boolean(reviewLock)}
                  aria-label={
                    reviewLock
                      ? `Review required before sending draft for ${email?.subject ?? draft.subject}`
                      : `Send draft for ${email?.subject ?? draft.subject}`
                  }
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    reviewLock
                      ? "cursor-not-allowed bg-amber-200 text-amber-900"
                      : "bg-accent text-white hover:bg-accent/90"
                  }`}
                >
                  {reviewLock ? "Review required" : "Send"}
                </button>
                <button
                  type="button"
                  className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                >
                  Edit
                </button>
              </div>
              {reviewLock && (
                <p className="mt-2 text-[11px] font-medium text-amber-700">
                  Review gate: {reviewLock.reviewerAction} &middot; Owner: {reviewLock.approvalOwner}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function TasksPanel() {
  const sorted = useMemo(
    () =>
      [...demoTasks].sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }),
    [],
  );

  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Extracted Tasks ({demoTasks.length})
      </h3>
      <div className="max-h-96 space-y-2 overflow-y-auto">
        {sorted.map((task) => {
          const email = demoEmails.find((e) => e.id === task.emailId);
          return (
            <div
              key={task.id}
              className="flex items-start justify-between rounded-lg border border-slate-100 p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink">{task.title}</p>
                <p className="mt-0.5 text-xs text-slate-400">
                  From: {email?.subject ?? "Unknown"}
                </p>
              </div>
              <span
                className={`ml-4 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                  task.dueDate &&
                  new Date(task.dueDate).getTime() < Date.now()
                    ? "bg-red-50 text-red-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {formatDueDate(task.dueDate)}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function EmailList() {
  const [sortKey, setSortKey] = useState<SortKey>("receivedAt");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");
  const [filter, setFilter] = useState<TriageCategory | "all">("all");

  const sorted = useMemo(() => {
    const filtered =
      filter === "all" ? demoEmails : demoEmails.filter((e) => e.category === filter);
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "receivedAt") {
        cmp = new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime();
      } else if (sortKey === "priority") {
        const order: Record<PriorityLevel, number> = {
          critical: 0,
          high: 1,
          medium: 2,
          low: 3,
        };
        cmp = order[a.priority] - order[b.priority];
      } else if (sortKey === "sender") {
        cmp = a.sender.name.localeCompare(b.sender.name);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filter, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sortArrow = (key: SortKey) => {
    if (sortKey !== key) return "";
    return sortDir === "asc" ? " ↑" : " ↓";
  };

  return (
    <Card className="overflow-hidden p-0">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-5 py-3">
        <span className="text-sm font-semibold text-ink">Inbox</span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {/* Category filter */}
          <select
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700"
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value as TriageCategory | "all")
            }
            aria-label="Filter by category"
          >
            <option value="all">All Categories</option>
            {(Object.keys(CATEGORY_LABELS) as TriageCategory[]).map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_LABELS[cat]}
              </option>
            ))}
          </select>

          {/* Sort controls */}
          <button
            type="button"
            className="rounded-md px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-slate-100"
            onClick={() => toggleSort("receivedAt")}
          >
            Time{sortArrow("receivedAt")}
          </button>
          <button
            type="button"
            className="rounded-md px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-slate-100"
            onClick={() => toggleSort("priority")}
          >
            Priority{sortArrow("priority")}
          </button>
          <button
            type="button"
            className="rounded-md px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-slate-100"
            onClick={() => toggleSort("sender")}
          >
            Sender{sortArrow("sender")}
          </button>
        </div>
      </div>

      {/* Email rows */}
      <div className="divide-y divide-slate-100">
        {sorted.map((email) => (
          <EmailRow key={email.id} email={email} />
        ))}
        {sorted.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-slate-400">
            No emails in this category.
          </p>
        )}
      </div>
    </Card>
  );
}

// ─────────────────────── Page ───────────────────────

export default function DashboardPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 md:px-6">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-ink">
          Email AI Triage
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Smart inbox with AI-powered categorisation, prioritisation, and
          auto-drafting
        </p>
      </header>

      {/* Stats row */}
      <HeroStats stats={demoStats} />

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Inbox (takes 2 columns on large screens) */}
        <div className="lg:col-span-2">
          <EmailList />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <DailyDigestPanel digest={demoDigest} />
          <CategoryBreakdown digest={demoDigest} />
          <ReviewQueuePanel />
          <DraftPanel />
          <TasksPanel />
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
        Email AI Triage &middot; Portfolio Demo &middot;{" "}
        {new Date().getFullYear()}
      </footer>
    </main>
  );
}
