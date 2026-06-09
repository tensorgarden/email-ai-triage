export type TriageCategory =
  | "urgent-client"
  | "proposal-request"
  | "invoice"
  | "meeting-follow-up"
  | "spam"
  | "internal";

export type PriorityLevel = "critical" | "high" | "medium" | "low";

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
