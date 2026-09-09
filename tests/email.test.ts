import { describe, it, expect } from "vitest";
import {
  demoEmails,
  demoDrafts,
  demoTasks,
  demoDigest,
  demoStats,
  demoReviewQueue,
  demoDraftApprovalSummary,
  demoConfidenceAnalysis,
} from "@/lib/demo-data";
import type {
  TriageCategory,
  PriorityLevel,
} from "@/lib/types";
import { formatSecurityBoundary } from "@/lib/types";

// ---------------------------------------------------------------------------
// 1. Data volume
// ---------------------------------------------------------------------------
describe("Demo data", () => {
  it("contains exactly 14 email threads", () => {
    expect(demoEmails).toHaveLength(14);
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
// 9. Draft commitment review gates
// ---------------------------------------------------------------------------
describe("Draft commitment review gates", () => {
  const reviewLocksByEmailId = new Map(
    demoReviewQueue
      .filter((item) => item.autoSendBlocked)
      .map((item) => [item.emailId, item]),
  );
  const emailsById = new Map(demoEmails.map((email) => [email.id, email]));

  it("keeps incident, legal, and healthcare commitment drafts behind review locks", () => {
    const sensitiveCommitmentSignals =
      /(\bRCA\b|root cause|\bETA\b|\bDSAR\b|\bGDPR\b|solicitor|\bHIPAA\b|board meeting|compliance checklist)/i;
    const sensitiveDrafts = demoDrafts.filter((draft) => {
      const email = emailsById.get(draft.emailId);
      const sourceText = `${email?.subject ?? ""} ${email?.body ?? ""} ${email?.aiSummary ?? ""} ${draft.body}`;

      return sensitiveCommitmentSignals.test(sourceText);
    });

    expect(sensitiveDrafts.length).toBeGreaterThan(0);
    sensitiveDrafts.forEach((draft) => {
      const reviewLock = reviewLocksByEmailId.get(draft.emailId);

      expect(reviewLock).toBeDefined();
      expect(reviewLock?.autoSendBlocked).toBe(true);
      expect(reviewLock?.evidenceQuotes.length).toBeGreaterThan(0);
    });
  });

  it("ties blocked commitment drafts to owned approval or verification steps", () => {
    const blockedDrafts = demoDrafts.filter((draft) =>
      reviewLocksByEmailId.has(draft.emailId),
    );

    expect(blockedDrafts.length).toBeGreaterThan(0);
    blockedDrafts.forEach((draft) => {
      const reviewLock = reviewLocksByEmailId.get(draft.emailId);
      const releaseCopy = `${reviewLock?.reviewerAction ?? ""} ${reviewLock?.verificationChecklist.join(" ") ?? ""}`;

      expect(releaseCopy).toMatch(/\b(approve|approval|verify|confirm)\b/i);
      expect(reviewLock?.approvalOwner.trim().length).toBeGreaterThan(3);
      expect(reviewLock?.reviewSlaHours).toBeGreaterThan(0);
    });
  });
});

// ---------------------------------------------------------------------------
// 10. Escalation readiness
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

// ---------------------------------------------------------------------------
// 11. Prompt-injection quarantine
// ---------------------------------------------------------------------------
describe("Prompt-injection quarantine", () => {
  const injectionFindings = demoEmails.flatMap((email) =>
    (email.securityFindings ?? [])
      .filter((finding) => finding.type === "prompt-injection")
      .map((finding) => ({ email, finding })),
  );

  it("quarantines detected prompt injection before AI actions are created", () => {
    expect(injectionFindings.length).toBeGreaterThan(0);

    injectionFindings.forEach(({ email, finding }) => {
      expect(finding.disposition).toBe("quarantine");
      expect(finding.location).toBe("hidden-body-text");
      expect(email.category).toBe("spam");
      expect(email.draftResponse).toBeNull();
      expect(email.extractedTasks).toHaveLength(0);
    });
  });

  it("blocks quarantined content at ingress before model context assembly", () => {
    injectionFindings.forEach(({ finding }) => {
      expect(finding.controlPoint).toBe("email-ingress");
      expect(finding.modelContextAccess).toBe("blocked");
    });
  });

  it("makes the quarantine reason visible in the AI summary", () => {
    injectionFindings.forEach(({ email, finding }) => {
      expect(finding.detail.trim().length).toBeGreaterThan(20);
      expect(email.aiSummary).toMatch(/prompt-injection.*quarantined/i);
    });
  });
});

// ---------------------------------------------------------------------------
// 12. Financial commitment review gates
// ---------------------------------------------------------------------------
describe("Financial commitment review gates", () => {
  const emailsById = new Map(demoEmails.map((email) => [email.id, email]));
  const reviewLocksByEmailId = new Map(
    demoReviewQueue
      .filter((item) => item.autoSendBlocked)
      .map((item) => [item.emailId, item]),
  );

  it("holds invoice drafts that claim payment, approval, or forwarding actions", () => {
    const financialCommitmentDrafts = demoDrafts.filter((draft) => {
      const sourceEmail = emailsById.get(draft.emailId);
      return (
        sourceEmail?.category === "invoice" &&
        /\b(payment|approved|forwarded)\b/i.test(draft.body)
      );
    });

    expect(financialCommitmentDrafts.length).toBeGreaterThanOrEqual(2);
    financialCommitmentDrafts.forEach((draft) => {
      const reviewLock = reviewLocksByEmailId.get(draft.emailId);
      expect(reviewLock?.reason).toBe("financial-risk");
      expect(reviewLock?.autoSendBlocked).toBe(true);
      expect(reviewLock?.approvalOwner.trim().length).toBeGreaterThan(3);
    });
  });

  it("requires trusted finance evidence before releasing financial drafts", () => {
    const financialReviewLocks = demoReviewQueue.filter(
      (item) => item.reason === "financial-risk",
    );

    expect(financialReviewLocks.length).toBeGreaterThanOrEqual(2);
    financialReviewLocks.forEach((item) => {
      const checklistText = item.verificationChecklist.join(" ");
      expect(item.evidenceQuotes.length).toBeGreaterThan(0);
      expect(checklistText).toMatch(/\b(verify|confirm)\b/i);
      expect(checklistText).toMatch(
        /\b(vendor record|trusted channel|finance system|purchase order)\b/i,
      );
    });
  });
});

// ---------------------------------------------------------------------------
// 13. Prompt-injection analyst triage metadata
// ---------------------------------------------------------------------------
describe("Prompt-injection analyst triage metadata", () => {
  const injectionFindings = demoEmails.flatMap((email) =>
    (email.securityFindings ?? []).filter(
      (finding) => finding.type === "prompt-injection",
    ),
  );

  it("records the phishing verdict and detection technology for every finding", () => {
    expect(injectionFindings.length).toBeGreaterThan(0);

    injectionFindings.forEach((finding) => {
      expect(finding.verdict).toBe("high-confidence-phish");
      expect(finding.detectionTechnology).toBe(
        "prompt-injection-protection",
      );
    });
  });
});

// ---------------------------------------------------------------------------
// 14. Prompt-injection defense-in-depth containment
// ---------------------------------------------------------------------------
describe("Prompt-injection defense-in-depth containment", () => {
  const injectionFindings = demoEmails.flatMap((email) =>
    (email.securityFindings ?? []).filter(
      (finding) => finding.type === "prompt-injection",
    ),
  );

  it("marks quarantined findings for information-flow isolation", () => {
    expect(injectionFindings.length).toBeGreaterThan(0);

    injectionFindings.forEach((finding) => {
      expect(finding.isolationPolicy).toBe("information-flow-control");
    });
  });

  it("blocks downstream tool access for isolated email content", () => {
    injectionFindings.forEach((finding) => {
      expect(finding.downstreamToolAccess).toBe("blocked");
    });
  });
});

// ---------------------------------------------------------------------------
// 15. Independent financial verification status
// ---------------------------------------------------------------------------
describe("Financial review verification status", () => {
  const financialReviewLocks = demoReviewQueue.filter(
    (item) => item.reason === "financial-risk",
  );

  it("keeps financial drafts blocked while trusted-channel verification is pending", () => {
    expect(financialReviewLocks.length).toBeGreaterThanOrEqual(2);

    financialReviewLocks.forEach((item) => {
      expect(item.financialVerification).toBeDefined();
      expect(item.financialVerification?.trustedChannelStatus).toBe("pending");
      expect(item.autoSendBlocked).toBe(true);
    });
  });

  it("requires finance-system confirmation before generated claims can be released", () => {
    financialReviewLocks.forEach((item) => {
      expect(item.financialVerification?.financeSystemStatus).toBe("pending");
      expect(item.financialVerification?.generatedClaimsAllowed).toBe(false);
    });
  });

  it("uses vendor-master contact details instead of the payment-request email", () => {
    financialReviewLocks.forEach((item) => {
      expect(item.financialVerification?.trustedChannelOrigin).toBe(
        "vendor-master-record",
      );
      expect(item.financialVerification?.emailThreadContactAllowed).toBe(false);
    });
  });
});

// ---------------------------------------------------------------------------
// 16. Draft expiration staleness gates
// ---------------------------------------------------------------------------
describe("Draft expiration staleness gates", () => {
  const draftsByEmailId = new Map(demoDrafts.map((draft) => [draft.emailId, draft]));

  it("assigns expiration windows to critical incident and legal-risk drafts", () => {
    const criticalAndLegal = demoReviewQueue.filter((item) =>
      ["critical-client", "legal-risk"].includes(item.reason),
    );

    expect(criticalAndLegal.length).toBeGreaterThanOrEqual(2);
    criticalAndLegal.forEach((item) => {
      expect(item.draftExpirationHours).toBeDefined();
      expect(item.draftExpirationHours).toBeGreaterThan(0);
      expect(item.draftExpirationHours).toBeLessThanOrEqual(24);
    });
  });

  it("prevents stale drafts from auto-sending without explicit re-approval", () => {
    const withExpiration = demoReviewQueue.filter(
      (item) => item.draftExpirationHours !== undefined,
    );

    withExpiration.forEach((item) => {
      const draft = draftsByEmailId.get(item.emailId);

      if (draft) {
        // Stale drafts remain blocked until operator re-approves after expiration window
        expect(item.autoSendBlocked).toBe(true);
        expect(item.draftExpirationHours).toBeGreaterThan(0);
      }
    });
  });

  it("uses short expiration windows for production-incident and legal responses", () => {
    const criticalIncident = demoReviewQueue.find((item) => item.id === "rq-001");
    const legalDsar = demoReviewQueue.find((item) => item.id === "rq-002");

    expect(criticalIncident?.draftExpirationHours).toBe(2);
    expect(legalDsar?.draftExpirationHours).toBe(3);
  });

  it("allows longer expiration windows for lower-urgency proposal drafts", () => {
    const proposalDraft = demoReviewQueue.find((item) => item.id === "rq-003");

    expect(proposalDraft?.draftExpirationHours).toBe(24);
    expect(proposalDraft?.reason).toBe("low-confidence");
  });
});

// ---------------------------------------------------------------------------
// 7. Confidence analysis — false-positive risk tracking
// ---------------------------------------------------------------------------
describe("Confidence analysis", () => {
  it("totals high/borderline/low confidence counts correctly", () => {
    const { highConfidenceCount, borderlineConfidenceCount, lowConfidenceCount, totalEmails } =
      demoConfidenceAnalysis;
    expect(highConfidenceCount + borderlineConfidenceCount + lowConfidenceCount).toBe(
      totalEmails,
    );
  });

  it("identifies borderline confidence emails (0.80–0.89) that warrant human review", () => {
    const borderlineEmails = demoEmails.filter(
      (e) => e.confidence >= 0.8 && e.confidence < 0.9,
    );
    expect(demoConfidenceAnalysis.borderlineConfidenceCount).toBe(borderlineEmails.length);
  });

  it("calculates average confidence within expected range (0–1)", () => {
    const { averageConfidence } = demoConfidenceAnalysis;
    expect(averageConfidence).toBeGreaterThan(0);
    expect(averageConfidence).toBeLessThanOrEqual(1);
  });

  it("computes per-category average confidence correctly", () => {
    const { categoryAverageConfidence } = demoConfidenceAnalysis;
    for (const category of Object.keys(categoryAverageConfidence)) {
      const categoryEmails = demoEmails.filter((e) => e.category === category);
      if (categoryEmails.length > 0) {
        const expectedAvg =
          Math.round(
            (categoryEmails.reduce((sum, e) => sum + e.confidence, 0) / categoryEmails.length) *
              10000,
          ) / 10000;
        expect(categoryAverageConfidence[category as TriageCategory]).toBe(expectedAvg);
      }
    }
  });

  it("calculates alert-fatigue risk percentage (emails below 0.90 confidence)", () => {
    const { riskOfAlertFatiguePercentage, totalEmails, borderlineConfidenceCount, lowConfidenceCount } =
      demoConfidenceAnalysis;
    const expectedPercentage = Math.round(
      ((borderlineConfidenceCount + lowConfidenceCount) / totalEmails) * 100,
    );
    expect(riskOfAlertFatiguePercentage).toBe(expectedPercentage);
  });

  it("shows all 6 categories in confidence distribution", () => {
    const { categoryAverageConfidence } = demoConfidenceAnalysis;
    const categories = ["urgent-client", "proposal-request", "invoice", "meeting-follow-up", "spam", "internal"];
    categories.forEach((cat) => {
      expect(categoryAverageConfidence).toHaveProperty(cat);
    });
  });
});

// ---------------------------------------------------------------------------
// 18. Display-name spoofing detection (executive impersonation)
// ---------------------------------------------------------------------------
describe("Display-name spoofing detection", () => {
  const spoofFindings = demoEmails.flatMap((email) =>
    (email.securityFindings ?? []).flatMap((finding) =>
      finding.type === "display-name-spoofing" ? [{ email, finding }] : [],
    ),
  );

  it("flags senders whose display name matches an executive but whose domain is unregistered", () => {
    expect(spoofFindings.length).toBeGreaterThan(0);

    spoofFindings.forEach(({ finding }) => {
      expect(finding.verdict).toBe("display-name-domain-mismatch");
      expect(finding.location).toBe("sender-identity");
      expect(finding.claimedIdentity.trim().length).toBeGreaterThan(10);
      expect(finding.senderDomain).not.toBe(finding.expectedDomain);
    });
  });

  it("surfaces spoofed senders for human review instead of auto-quarantining them", () => {
    spoofFindings.forEach(({ finding }) => {
      expect(finding.disposition).toBe("review");
      expect(finding.detectionTechnology).toBe("display-name-reputation-check");
    });
  });

  it("keeps spoofed-sender content out of model context and tool access", () => {
    spoofFindings.forEach(({ finding }) => {
      expect(finding.controlPoint).toBe("email-ingress");
      expect(finding.modelContextAccess).toBe("blocked");
      expect(finding.isolationPolicy).toBe("information-flow-control");
      expect(finding.downstreamToolAccess).toBe("blocked");
    });
  });

  it("generates no draft or tasks from a flagged impersonation email", () => {
    spoofFindings.forEach(({ email }) => {
      expect(email.draftResponse).toBeNull();
      expect(email.extractedTasks).toHaveLength(0);
    });
  });

  it("holds impersonation wire-change requests behind a financial-risk review lock", () => {
    const spoofedEmailIds = new Set(spoofFindings.map(({ email }) => email.id));
    const reviewLocks = demoReviewQueue.filter(
      (item) =>
        spoofedEmailIds.has(item.emailId) && item.reason === "financial-risk",
    );

    expect(reviewLocks.length).toBeGreaterThan(0);
    reviewLocks.forEach((lock) => {
      expect(lock.autoSendBlocked).toBe(true);
      expect(lock.financialVerification?.trustedChannelStatus).toBe("pending");
      expect(lock.financialVerification?.emailThreadContactAllowed).toBe(false);
      const checklistText = lock.verificationChecklist.join(" ");
      expect(checklistText).toMatch(/\b(sender identity|independent callback)\b/i);
    });
  });
});

// ---------------------------------------------------------------------------
// 19. Thread hijack detection (reply-chain intrusion)
// ---------------------------------------------------------------------------
describe("Thread hijack detection", () => {
  const hijackFindings = demoEmails.flatMap((email) =>
    (email.securityFindings ?? []).flatMap((finding) =>
      finding.type === "thread-hijack" ? [{ email, finding }] : [],
    ),
  );

  it("flags messages that claim an existing thread from a domain outside its participant history", () => {
    expect(hijackFindings.length).toBeGreaterThan(0);

    hijackFindings.forEach(({ finding }) => {
      expect(finding.verdict).toBe("non-participant-thread-intrusion");
      expect(finding.location).toBe("conversation-thread");
      expect(finding.claimedThreadSubject.trim().length).toBeGreaterThan(0);
      expect(finding.knownParticipantDomains).not.toContain(finding.senderDomain);
    });
  });

  it("surfaces hijacked threads for human review instead of auto-quarantining them", () => {
    hijackFindings.forEach(({ finding }) => {
      expect(finding.disposition).toBe("review");
      expect(finding.detectionTechnology).toBe("thread-participant-history-check");
    });
  });

  it("keeps hijacked-thread content out of model context and tool access", () => {
    hijackFindings.forEach(({ finding }) => {
      expect(finding.controlPoint).toBe("email-ingress");
      expect(finding.modelContextAccess).toBe("blocked");
      expect(finding.isolationPolicy).toBe("information-flow-control");
      expect(finding.downstreamToolAccess).toBe("blocked");
    });
  });

  it("generates no draft or tasks from a hijacked-thread message", () => {
    hijackFindings.forEach(({ email }) => {
      expect(email.draftResponse).toBeNull();
      expect(email.extractedTasks).toHaveLength(0);
    });
  });

  it("holds hijacked payment-redirect replies behind a financial-risk review lock", () => {
    const hijackedEmailIds = new Set(hijackFindings.map(({ email }) => email.id));
    const reviewLocks = demoReviewQueue.filter(
      (item) =>
        hijackedEmailIds.has(item.emailId) && item.reason === "financial-risk",
    );

    expect(reviewLocks.length).toBeGreaterThan(0);
    reviewLocks.forEach((lock) => {
      expect(lock.autoSendBlocked).toBe(true);
      expect(lock.financialVerification?.trustedChannelStatus).toBe("pending");
      expect(lock.financialVerification?.emailThreadContactAllowed).toBe(false);
      const checklistText = lock.verificationChecklist.join(" ");
      expect(checklistText).toMatch(
        /\b(thread participant|independent callback|vendor-master)\b/i,
      );
    });
  });
});

// ---------------------------------------------------------------------------
// 20. Payment-request pressure cues
// ---------------------------------------------------------------------------
describe("Payment-request pressure cues", () => {
  const pressureLocks = demoReviewQueue.filter(
    (item) =>
      item.reason === "financial-risk" &&
      (item.financialVerification?.pressureSignals.length ?? 0) > 0,
  );

  it("preserves deadline and secrecy cues from high-risk payment requests", () => {
    const wireChange = demoReviewQueue.find((item) => item.emailId === "e-013");
    const hijackedReply = demoReviewQueue.find((item) => item.emailId === "e-014");

    expect(wireChange?.financialVerification?.pressureSignals).toEqual(
      expect.arrayContaining(["deadline-pressure", "secrecy-request"]),
    );
    expect(hijackedReply?.financialVerification?.pressureSignals).toContain(
      "deadline-pressure",
    );
  });

  it("keeps pressure-marked requests blocked instead of treating pressure as proof", () => {
    expect(pressureLocks.length).toBeGreaterThan(0);

    pressureLocks.forEach((item) => {
      expect(item.autoSendBlocked).toBe(true);
      expect(item.financialVerification?.generatedClaimsAllowed).toBe(false);
    });
  });
});

// ---------------------------------------------------------------------------
// 21. Active content output containment
// ---------------------------------------------------------------------------
describe("Active content output containment", () => {
  const securityFindings = demoEmails.flatMap((email) =>
    (email.securityFindings ?? []).map((finding) => ({ email, finding })),
  );

  it("blocks active links and images from every untrusted email finding", () => {
    expect(securityFindings.length).toBeGreaterThan(0);

    securityFindings.forEach(({ finding }) => {
      expect(finding.activeContentHandling).toBe("blocked");
      expect(finding.attachmentHandling).toBe("blocked");
    });
  });

  it("keeps output containment paired with pre-model and tool boundaries", () => {
    securityFindings.forEach(({ finding }) => {
      expect(finding.modelContextAccess).toBe("blocked");
      expect(finding.downstreamToolAccess).toBe("blocked");
    });
  });
});

// ---------------------------------------------------------------------------
// 22. Security boundary summaries
// ---------------------------------------------------------------------------
describe("Security boundary summaries", () => {
  const securityFindings = demoEmails.flatMap((email) =>
    (email.securityFindings ?? []).map((finding) => ({ email, finding })),
  );

  it("surfaces every enforced boundary in the finding summary", () => {
    expect(securityFindings.length).toBeGreaterThan(0);

    securityFindings.forEach(({ finding }) => {
      const summary = formatSecurityBoundary(finding);

      expect(summary).toContain("Control point: email ingress");
      expect(summary).toContain("Model context blocked");
      expect(summary).toContain("Active links/images blocked");
      expect(summary).toContain("Attachments blocked");
      expect(summary).toContain("Isolation: information flow control");
      expect(summary).toContain("Downstream tools blocked");
    });
  });
});

// ---------------------------------------------------------------------------
// 23. Pre-match content normalization
// ---------------------------------------------------------------------------
describe("Pre-match content normalization", () => {
  const securityFindings = demoEmails.flatMap((email) =>
    (email.securityFindings ?? []).map((finding) => ({ email, finding })),
  );

  it("strips invisible content before security matching", () => {
    expect(securityFindings.length).toBeGreaterThan(0);

    securityFindings.forEach(({ finding }) => {
      expect(finding.normalizationPolicy).toBe(
        "strip-invisible-before-matching",
      );
    });
  });

  it("includes normalization in the visible security boundary summary", () => {
    securityFindings.forEach(({ finding }) => {
      expect(formatSecurityBoundary(finding)).toContain(
        "Content normalization: strip invisible before matching",
      );
    });
  });
});
