import { describe, it, expect } from "vitest";
import {
  demoEmails,
  demoDrafts,
  demoTasks,
  demoDigest,
  demoStats,
  demoReviewQueue,
  demoDraftApprovalSummary,
} from "@/lib/demo-data";
import type {
  TriageCategory,
  PriorityLevel,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// 1. Data volume
// ---------------------------------------------------------------------------
describe("Demo data", () => {
  it("contains exactly 12 email threads", () => {
    expect(demoEmails).toHaveLength(12);
  });

  it("covers all 6 triage categories at least once", () => {
    const categories = new Set(demoEmails.map((e) => e.category));
    const expected: TriageCategory[] = [
      "urgent-client",
      "proposal-request",
      "invoice",
      "meeting-follow-up",
      "spam",
      "internal",
    ];
    expected.forEach((cat) => {
      expect(categories.has(cat)).toBe(true);
    });
  });

  it("covers all 4 priority levels at least once", () => {
    const levels = new Set(demoEmails.map((e) => e.priority));
    const expected: PriorityLevel[] = ["critical", "high", "medium", "low"];
    expected.forEach((lvl) => {
      expect(levels.has(lvl)).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// 2. Type integrity
// ---------------------------------------------------------------------------
describe("Email type integrity", () => {
  it("every email has a non-empty id, subject, and aiSummary", () => {
    demoEmails.forEach((e) => {
      expect(e.id).toBeTruthy();
      expect(e.subject.length).toBeGreaterThan(0);
      expect(e.aiSummary.length).toBeGreaterThan(0);
    });
  });

  it("every email has a valid ISO receivedAt", () => {
    demoEmails.forEach((e) => {
      const d = new Date(e.receivedAt);
      expect(d.getTime()).toBeGreaterThan(0);
      expect(d.toISOString()).toBe(e.receivedAt);
    });
  });

  it("draft responses link back to existing emails", () => {
    const emailIds = new Set(demoEmails.map((e) => e.id));
    demoDrafts.forEach((draft) => {
      expect(emailIds.has(draft.emailId)).toBe(true);
    });
  });

  it("extracted tasks link back to existing emails", () => {
    const emailIds = new Set(demoEmails.map((e) => e.id));
    demoTasks.forEach((task) => {
      expect(emailIds.has(task.emailId)).toBe(true);
    });
  });

  it("every task has a non-empty source quote", () => {
    demoTasks.forEach((task) => {
      expect(task.sourceQuote.length).toBeGreaterThan(0);
    });
  });
});

// ---------------------------------------------------------------------------
// 3. Stats correctness
// ---------------------------------------------------------------------------
describe("Dashboard stats", () => {
  it("unread count matches number of emails with isRead=false", () => {
    const actual = demoEmails.filter((e) => !e.isRead).length;
    expect(demoStats.unread).toBe(actual);
  });

  it("triaged count excludes spam", () => {
    const actual = demoEmails.filter((e) => e.category !== "spam").length;
    expect(demoStats.triaged).toBe(actual);
  });

  it("drafted count matches demoDrafts length", () => {
    expect(demoStats.drafted).toBe(demoDrafts.length);
  });

  it("tasksExtracted count matches demoTasks length", () => {
    expect(demoStats.tasksExtracted).toBe(demoTasks.length);
  });

  it("criticalCount matches number of emails with priority=critical", () => {
    const actual = demoEmails.filter((e) => e.priority === "critical").length;
    expect(demoStats.criticalCount).toBe(actual);
  });
});

// ---------------------------------------------------------------------------
// 4. Digest correctness
// ---------------------------------------------------------------------------
describe("Daily digest", () => {
  it("category breakdown sums to total received", () => {
    const sum = (Object.values(demoDigest.categoryBreakdown) as number[]).reduce(
      (a, b) => a + b,
      0,
    );
    expect(sum).toBe(demoDigest.totalReceived);
  });

  it("contains today's date", () => {
    const today = new Date().toISOString().slice(0, 10);
    expect(demoDigest.date).toBe(today);
  });

  it("has at least 3 highlights", () => {
    expect(demoDigest.highlights.length).toBeGreaterThanOrEqual(3);
  });

  it("criticalCount + highCount do not exceed totalReceived", () => {
    const sum = demoDigest.criticalCount + demoDigest.highCount;
    expect(sum).toBeLessThanOrEqual(demoDigest.totalReceived);
  });
});

// ---------------------------------------------------------------------------
// 5. Spam filtering
// ---------------------------------------------------------------------------
describe("Spam filtering", () => {
  it("spam emails have no draft responses", () => {
    const spam = demoEmails.filter((e) => e.category === "spam");
    spam.forEach((e) => {
      expect(e.draftResponse).toBeNull();
    });
  });

  it("spam emails have no extracted tasks", () => {
    const spam = demoEmails.filter((e) => e.category === "spam");
    spam.forEach((e) => {
      expect(e.extractedTasks).toHaveLength(0);
    });
  });

  it("spam emails are low priority", () => {
    const spam = demoEmails.filter((e) => e.category === "spam");
    spam.forEach((e) => {
      expect(e.priority).toBe("low");
    });
  });
});

// ---------------------------------------------------------------------------
// 7. Classification confidence
// ---------------------------------------------------------------------------
describe("Classification confidence", () => {
  it("every email has confidence between 0 and 1", () => {
    demoEmails.forEach((e) => {
      expect(e.confidence).toBeGreaterThanOrEqual(0);
      expect(e.confidence).toBeLessThanOrEqual(1);
    });
  });

  it("at least one email has borderline confidence below 0.90", () => {
    const borderline = demoEmails.filter((e) => e.confidence < 0.9);
    expect(borderline.length).toBeGreaterThanOrEqual(1);
  });

  it("at least one email has high confidence above 0.95", () => {
    const highConf = demoEmails.filter((e) => e.confidence > 0.95);
    expect(highConf.length).toBeGreaterThanOrEqual(1);
  });

  it("spam classifications have confidence above 0.95", () => {
    const spam = demoEmails.filter((e) => e.category === "spam");
    expect(spam.length).toBeGreaterThan(0);
    spam.forEach((e) => {
      expect(e.confidence).toBeGreaterThan(0.95);
    });
  });

  it("at least one non-spam classification has confidence below 0.90 to demonstrate review-worthy cases", () => {
    const reviewWorthy = demoEmails.filter(
      (e) => e.category !== "spam" && e.confidence < 0.9,
    );
    expect(reviewWorthy.length).toBeGreaterThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// 8. Human review safeguards
// ---------------------------------------------------------------------------
describe("Human review queue", () => {
  const emailsById = new Map(demoEmails.map((e) => [e.id, e]));

  it("blocks auto-send for every queued item", () => {
    expect(demoReviewQueue.length).toBeGreaterThan(0);
    demoReviewQueue.forEach((item) => {
      expect(item.autoSendBlocked).toBe(true);
      expect(item.reviewerAction.length).toBeGreaterThan(0);
      expect(item.riskNote.length).toBeGreaterThan(0);
    });
  });

  it("includes source evidence quotes for every queued item", () => {
    demoReviewQueue.forEach((item) => {
      expect(item.evidenceQuotes.length).toBeGreaterThan(0);
      item.evidenceQuotes.forEach((quote) => {
        expect(quote.trim().length).toBeGreaterThan(10);
      });
    });
  });

  it("grounds every evidence quote in the source email", () => {
    demoReviewQueue.forEach((item) => {
      const email = emailsById.get(item.emailId);
      expect(email).toBeDefined();
      const sourceText = `${email?.subject} ${email?.preview} ${email?.body} ${email?.aiSummary}`;

      item.evidenceQuotes.forEach((quote) => {
        expect(sourceText).toContain(quote);
      });
    });
  });

  it("requires concrete source-check and approval steps before release", () => {
    demoReviewQueue.forEach((item) => {
      expect(item.verificationChecklist.length).toBeGreaterThanOrEqual(2);

      const checklistText = item.verificationChecklist.join(" ");
      expect(checklistText).toMatch(/\b(confirm|verify|validate)\b/i);
      expect(checklistText).toMatch(/\b(approve|approval|approving)\b/i);
    });
  });

  it("assigns every review gate to a human owner with a time-bound SLA", () => {
    demoReviewQueue.forEach((item) => {
      expect(item.approvalOwner.trim().length).toBeGreaterThan(3);
      expect(Number.isFinite(item.reviewSlaHours)).toBe(true);
      expect(item.reviewSlaHours).toBeGreaterThan(0);
    });
  });

  it("keeps legal and critical-client draft reviews on an urgent SLA", () => {
    const highRiskItems = demoReviewQueue.filter((item) =>
      ["critical-client", "legal-risk"].includes(item.reason),
    );

    expect(highRiskItems.length).toBeGreaterThan(0);
    highRiskItems.forEach((item) => {
      expect(item.reviewSlaHours).toBeLessThanOrEqual(4);
    });
  });

  it("only references existing emails", () => {
    demoReviewQueue.forEach((item) => {
      expect(emailsById.has(item.emailId)).toBe(true);
    });
  });

  it("queues every non-spam low-confidence email for human review", () => {
    const queuedEmailIds = new Set(demoReviewQueue.map((item) => item.emailId));
    const lowConfidenceNonSpam = demoEmails.filter(
      (email) => email.category !== "spam" && email.confidence < 0.9,
    );

    expect(lowConfidenceNonSpam.length).toBeGreaterThan(0);
    lowConfidenceNonSpam.forEach((email) => {
      expect(queuedEmailIds.has(email.id)).toBe(true);
    });
  });

  it("legal-risk queue items reference legal or compliance signals", () => {
    const legalRiskItems = demoReviewQueue.filter(
      (item) => item.reason === "legal-risk",
    );

    expect(legalRiskItems.length).toBeGreaterThan(0);
    legalRiskItems.forEach((item) => {
      const email = emailsById.get(item.emailId);
      expect(`${email?.subject} ${email?.body} ${email?.aiSummary}`).toMatch(
        /\b(GDPR|DSAR|solicitor|regulator|compliance|HIPAA)\b/i,
      );
    });
  });

  it("counts review-locked drafts separately from ready-to-send drafts", () => {
    const blockedEmailIds = new Set(
      demoReviewQueue
        .filter((item) => item.autoSendBlocked)
        .map((item) => item.emailId),
    );
    const heldDrafts = demoDrafts.filter((draft) =>
      blockedEmailIds.has(draft.emailId),
    );

    expect(heldDrafts.length).toBeGreaterThan(0);
    expect(demoDraftApprovalSummary.totalDrafts).toBe(demoDrafts.length);
    expect(demoDraftApprovalSummary.heldForHumanApproval).toBe(heldDrafts.length);
    expect(demoDraftApprovalSummary.readyToSend).toBe(
      demoDrafts.length - heldDrafts.length,
    );
  });

  it("requires every held draft to expose evidence, owner, and reviewer action", () => {
    const reviewItemsByEmailId = new Map(
      demoReviewQueue.map((item) => [item.emailId, item]),
    );
    const heldDrafts = demoDrafts.filter((draft) =>
      reviewItemsByEmailId.get(draft.emailId)?.autoSendBlocked,
    );

    expect(heldDrafts.length).toBeGreaterThan(0);
    heldDrafts.forEach((draft) => {
      const reviewItem = reviewItemsByEmailId.get(draft.emailId);
      expect(reviewItem).toBeDefined();
      expect(reviewItem?.evidenceQuotes.length).toBeGreaterThan(0);
      expect(reviewItem?.approvalOwner.trim().length).toBeGreaterThan(3);
      expect(reviewItem?.reviewerAction).toMatch(/\b(approve|confirm|verify)\b/i);
    });
  });
});

// ---------------------------------------------------------------------------
// 9. Escalation readiness
// ---------------------------------------------------------------------------
describe("Escalation readiness", () => {
  it("critical client emails preserve deadline or exposure signals in summaries", () => {
    const criticalClientEmails = demoEmails.filter(
      (e) => e.category === "urgent-client" && e.priority === "critical",
    );

    criticalClientEmails.forEach((email) => {
      expect(email.aiSummary).toMatch(
        /\b(\d+\s?(hours?|days?)|today|overdue|lost|fine|deadline|escalation|RCA)\b/i,
      );
    });
  });

  it("critical client emails have at least one time-bound extracted task", () => {
    const criticalClientEmails = demoEmails.filter(
      (e) => e.category === "urgent-client" && e.priority === "critical",
    );

    criticalClientEmails.forEach((email) => {
      expect(email.extractedTasks.some((task) => task.dueDate !== null)).toBe(true);
    });
  });

  it("critical client draft responses acknowledge urgency with a concrete next step", () => {
    const criticalClientEmails = demoEmails.filter(
      (e) => e.category === "urgent-client" && e.priority === "critical",
    );

    criticalClientEmails.forEach((email) => {
      expect(email.draftResponse).not.toBeNull();
      expect(email.draftResponse?.body).toMatch(
        /\b(ETA|within|today|EOD|updates?|estimates?|delivery)\b/i,
      );
    });
  });
});
