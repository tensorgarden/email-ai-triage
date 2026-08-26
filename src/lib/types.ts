export type TriageCategory =
  | "urgent-client"
  | "proposal-request"
  | "invoice"
  | "meeting-follow-up"
  | "spam"
  | "internal";

export type PriorityLevel = "critical" | "high" | "medium" | "low";

export type ReviewReason =
  | "low-confidence"
  | "critical-client"
  | "legal-risk"
  | "financial-risk";

export interface PromptInjectionFinding {
  type: "prompt-injection";
  location: "hidden-body-text";
  disposition: "quarantine";
  /** Mail-security verdict retained for analyst triage. */
  verdict: "high-confidence-phish";
  /** Scanner technology that produced the verdict. */
  detectionTechnology: "prompt-injection-protection";
  /** Earliest enforced boundary for isolating untrusted email instructions. */
  controlPoint: "email-ingress";
  /** Whether quarantined content may be assembled into an AI assistant's context. */
  modelContextAccess: "blocked";
  /** Policy layer that keeps untrusted content separated from critical inference. */
  isolationPolicy: "information-flow-control";
  /** Whether isolated content may trigger connected tools or external actions. */
  downstreamToolAccess: "blocked";
  /** Active links, images, and other externally fetched content from this email are not rendered automatically. */
  activeContentHandling: "blocked";
  detail: string;
}

export interface DisplayNameSpoofingFinding {
  type: "display-name-spoofing";
  /** Field where the identity mismatch was observed. */
  location: "sender-identity";
  /** Spoofed senders are surfaced for human review rather than auto-quarantined, because display-name matches can be false positives. */
  disposition: "review";
  /** Why the sender was flagged. */
  verdict: "display-name-domain-mismatch";
  /** Scanner technology that produced the verdict. */
  detectionTechnology: "display-name-reputation-check";
  /** Earliest enforced boundary for isolating untrusted sender context. */
  controlPoint: "email-ingress";
  /** Whether spoofed-sender content may be assembled into an AI assistant's context. */
  modelContextAccess: "blocked";
  /** Policy layer that keeps untrusted content separated from critical inference. */
  isolationPolicy: "information-flow-control";
  /** Whether spoofed-sender content may trigger connected tools or external actions. */
  downstreamToolAccess: "blocked";
  /** Active links, images, and other externally fetched content from this email are not rendered automatically. */
  activeContentHandling: "blocked";
  /** Identity the sender claims, including display name and role. */
  claimedIdentity: string;
  /** Domain the message was actually sent from. */
  senderDomain: string;
  /** Domain the identity directory associates with the claimed identity. */
  expectedDomain: string;
  detail: string;
}

export interface ThreadHijackFinding {
  type: "thread-hijack";
  /** Where the anomaly was observed. */
  location: "conversation-thread";
  /** Hijacked threads are surfaced for review, not auto-quarantined, because legitimate new participants can join existing threads. */
  disposition: "review";
  /** Why the message was flagged. */
  verdict: "non-participant-thread-intrusion";
  /** Scanner technology that produced the verdict. */
  detectionTechnology: "thread-participant-history-check";
  /** Earliest enforced boundary for isolating untrusted continuation content. */
  controlPoint: "email-ingress";
  /** Whether hijacked continuation content may be assembled into an AI assistant's context. */
  modelContextAccess: "blocked";
  /** Policy layer that keeps untrusted content separated from critical inference. */
  isolationPolicy: "information-flow-control";
  /** Whether hijacked-thread content may trigger connected tools or external actions. */
  downstreamToolAccess: "blocked";
  /** Active links, images, and other externally fetched content from this email are not rendered automatically. */
  activeContentHandling: "blocked";
  /** The existing conversation thread the message claims to continue. */
  claimedThreadSubject: string;
  /** Domains already established as participants in the thread history. */
  knownParticipantDomains: string[];
  /** The sender domain that is absent from the thread's participant history. */
  senderDomain: string;
  detail: string;
}

export type EmailSecurityFinding =
  | PromptInjectionFinding
  | DisplayNameSpoofingFinding
  | ThreadHijackFinding;

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
  /** Scanner findings that must be resolved before AI-generated actions are trusted. */
  securityFindings?: EmailSecurityFinding[];
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

export type FinancialPressureSignal = "deadline-pressure" | "secrecy-request";

export interface FinancialVerificationStatus {
  /** Independent callback or secondary-channel verification of the payment request. */
  trustedChannelStatus: "pending" | "verified";
  /** Contact source must be independent of the potentially compromised email thread. */
  trustedChannelOrigin: "vendor-master-record";
  /** Never use phone numbers or links supplied by the payment-request email itself. */
  emailThreadContactAllowed: false;
  /** Confirmation from the authoritative accounting or payment system. */
  financeSystemStatus: "pending" | "verified";
  /** Generated payment or approval claims stay blocked until both checks pass. */
  generatedClaimsAllowed: boolean;
  /** Social-engineering pressure cues preserved for analyst triage. */
  pressureSignals: FinancialPressureSignal[];
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
  /** Explicit operational proof state for finance-related drafts. */
  financialVerification?: FinancialVerificationStatus;
  /** Maximum age in hours that a draft response can remain unapproved before it becomes stale and auto-send must be re-approved. */
  draftExpirationHours?: number;
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

export interface DraftApprovalSummary {
  totalDrafts: number;
  readyToSend: number;
  heldForHumanApproval: number;
}

/** Confidence analysis to track false-positive risk and alert fatigue drivers. */
export interface ConfidenceAnalysis {
  /** Total emails analyzed in the time period. */
  totalEmails: number;
  /** Emails with confidence >= 0.90 (high confidence, lower false-positive risk). */
  highConfidenceCount: number;
  /** Emails with 0.80 <= confidence < 0.90 (borderline, requires human review to catch false positives). */
  borderlineConfidenceCount: number;
  /** Emails with confidence < 0.80 (low confidence, high false-positive risk, should be escalated). */
  lowConfidenceCount: number;
  /** Average confidence score across all emails (0-1). */
  averageConfidence: number;
  /** Confidence distribution by category to identify which triage categories most need model retraining. */
  categoryAverageConfidence: Record<TriageCategory, number>;
  /** Percentage of classifications below the 0.90 threshold that need analyst review. */
  riskOfAlertFatiguePercentage: number;
}

export type SortKey = "receivedAt" | "priority" | "sender";
export type SortDirection = "asc" | "desc";
