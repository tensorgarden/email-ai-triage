export type TriageCategory =
  | "urgent-client"
  | "proposal-request"
  | "invoice"
  | "meeting-follow-up"
  | "spam"
  | "internal";

export type PriorityLevel = "critical" | "high" | "medium" | "low";

export type ReviewReason = "low-confidence" | "critical-client" | "legal-risk";

export interface EmailThread {
  id: string;
  subject: string;
  sender: {
    name: string;
    email: string;
    avatarInitials: string;
  };
  preview: string;
  body: string;
  receivedAt: string; // ISO timestamp
  category: TriageCategory;
  priority: PriorityLevel;
  /** AI classifier confidence (0–1). Values below 0.90 indicate borderline classifications that warrant human review. */
  confidence: number;
  isRead: boolean;
  aiSummary: string;
  draftResponse: DraftResponse | null;
  extractedTasks: AdminTask[];
}

export interface DraftResponse {
  id: string;
  emailId: string;
  subject: string;
  body: string;
  tone: "professional" | "friendly" | "concise";
  generatedAt: string;
}

export interface AdminTask {
  id: string;
  emailId: string;
  title: string;
  description: string;
  dueDate: string | null; // ISO date string or null
  sourceQuote: string; // relevant snippet from the email
}

export interface ReviewQueueItem {
  id: string;
  emailId: string;
  reason: ReviewReason;
  reviewerAction: string;
  riskNote: string;
  /** Source snippets the reviewer should verify before trusting the AI classification or draft. */
  evidenceQuotes: string[];
  /** Accountable human role required to approve or correct the AI output. */
  approvalOwner: string;
  /** Time budget, in hours from receipt, for completing human review before the queue item is escalated. */
  reviewSlaHours: number;
  /** Concrete steps a human must complete before approving the AI classification or draft. */
  verificationChecklist: string[];
  autoSendBlocked: boolean;
}

export interface DailyDigest {
  date: string;
  totalReceived: number;
  triaged: number;
  criticalCount: number;
  highCount: number;
  tasksExtracted: number;
  responsesDrafted: number;
  categoryBreakdown: Record<TriageCategory, number>;
  highlights: string[];
}

export interface DashboardStats {
  unread: number;
  triaged: number;
  drafted: number;
  tasksExtracted: number;
  criticalCount: number;
}

export type SortKey = "receivedAt" | "priority" | "sender";
export type SortDirection = "asc" | "desc";
