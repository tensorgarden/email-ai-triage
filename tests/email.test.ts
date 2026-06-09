import { describe, it, expect } from "vitest";
import {
  demoEmails,
  demoDrafts,
  demoTasks,
  demoDigest,
  demoStats,
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
