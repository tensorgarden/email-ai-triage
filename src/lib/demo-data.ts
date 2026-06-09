import type {
  EmailThread,
  DraftResponse,
  AdminTask,
  DailyDigest,
  DashboardStats,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Helper: ISO date relative to now
// ---------------------------------------------------------------------------
function ago(hours: number, minutes = 0): string {
  const d = new Date(Date.now() - (hours * 60 + minutes) * 60_000);
  return d.toISOString();
}

// ---------------------------------------------------------------------------
// Emails — 12 threads covering all 6 categories
// ---------------------------------------------------------------------------
export const demoEmails: EmailThread[] = [
  // ---- URGENT-CLIENT (2) ----
  {
    id: "e-001",
    subject: "Production down — checkout 500 error",
    sender: {
      name: "Marcus Webb",
      email: "marcus@acmecorp.com",
      avatarInitials: "MW",
    },
    preview:
      "We're seeing a 500 error on the checkout flow. Customers can't complete purchases. This is costing us roughly $4k/hour...",
    body: `Hi team,

We're seeing a 500 error across our entire checkout flow. Customers are hitting the payment step and getting a white screen. We've confirmed this affects both web and mobile.

Our engineering team traced it to what looks like a timeout in the payment-gateway integration you deployed last Thursday. Can you jump on this immediately? This is costing us roughly $4,000 per hour in lost revenue.

We need a root cause analysis within 2 hours.

Regards,
Marcus`,
    receivedAt: ago(0, 25),
    category: "urgent-client",
    priority: "critical",
    isRead: false,
    aiSummary:
      "Production checkout outage caused by payment-gateway timeout. Client losing ~$4k/hr. Needs RCA within 2 hours.",
    draftResponse: {
      id: "dr-001",
      emailId: "e-001",
      subject: "Re: Production down — checkout 500 error",
      body: `Hi Marcus,

We've identified the root cause: a connection-pool exhaustion in the payment-gateway adapter deployed Thursday. We're rolling back to the previous stable version now (ETA 12 minutes) and will follow up with a full RCA within the 2-hour window.

I've escalated to our on-call engineering lead and will send you live status updates every 15 minutes until resolved. Thank you for flagging this immediately.

Best,
Alex Chen
Solutions Architect`,
      tone: "professional",
      generatedAt: ago(0, 22),
    },
    extractedTasks: [
      {
        id: "t-001",
        emailId: "e-001",
        title: "Rollback payment-gateway adapter",
        description:
          "Revert last Thursday's payment-gateway deployment to the previous stable version.",
        dueDate: new Date(Date.now() + 30 * 60_000).toISOString(),
        sourceQuote:
          "Our engineering team traced it to what looks like a timeout in the payment-gateway integration you deployed last Thursday.",
      },
      {
        id: "t-002",
        emailId: "e-001",
        title: "Deliver RCA for checkout outage",
        description:
          "Prepare a root cause analysis covering connection-pool exhaustion, timeline, and prevention measures.",
        dueDate: new Date(Date.now() + 120 * 60_000).toISOString(),
        sourceQuote:
          "We need a root cause analysis within 2 hours.",
      },
    ],
  },
  {
    id: "e-002",
    subject: "Legal deadline missed — GDPR DSAR overdue",
    sender: {
      name: "Priya Kapoor",
      email: "priya@virtustream.io",
      avatarInitials: "PK",
    },
    preview:
      "Our Data Subject Access Request for user #88214 is now 3 days past the 30-day statutory deadline. We're exposed to a GDPR fine...",
    body: `Alex,

I just realised our Data Subject Access Request for user #88214 is now 3 days past the 30-day statutory deadline under Article 15 of GDPR. The regulator (ICO) was already copied on the original request, and the user's solicitor sent a follow-up this morning threatening to escalate.

We need the full data export generated today and a remediation plan for how we prevent this in future. This is our third overdue DSAR this quarter.

Priya
Head of Compliance`,
    receivedAt: ago(1, 10),
    category: "urgent-client",
    priority: "critical",
    isRead: false,
    aiSummary:
      "GDPR DSAR 3 days overdue; user's solicitor threatening escalation to ICO. Data export + remediation plan required today.",
    draftResponse: {
      id: "dr-002",
      emailId: "e-002",
      subject: "Re: Legal deadline missed — GDPR DSAR overdue",
      body: `Hi Priya,

I've expedited the data export for user #88214 — our engineering team estimates delivery within 3 hours. I've also drafted a holding response for the user's solicitor acknowledging the delay and committing to a delivery timeline before close of business today.

On the remediation front, I'm proposing an automated DSAR tracker with SLA alerts that fires at Day 20 and Day 25. I'll have a one-pager on your desk by EOD.

Please let me know if you'd like me to handle the solicitor comms directly.

Best,
Alex`,
      tone: "professional",
      generatedAt: ago(1, 5),
    },
    extractedTasks: [
      {
        id: "t-003",
        emailId: "e-002",
        title: "Generate GDPR data export for user #88214",
        description:
          "Run full data export for DSAR #88214 and deliver to compliance team.",
        dueDate: new Date(Date.now() + 6 * 3600_000).toISOString(),
        sourceQuote:
          "We need the full data export generated today",
      },
      {
        id: "t-004",
        emailId: "e-002",
        title: "Draft DSAR automation proposal",
        description:
          "Create a one-pager for an automated DSAR tracker with SLA alerts at Day 20 and Day 25.",
        dueDate: new Date(Date.now() + 24 * 3600_000).toISOString(),
        sourceQuote:
          "a remediation plan for how we prevent this in future",
      },
    ],
  },

  // ---- PROPOSAL-REQUEST (2) ----
  {
    id: "e-003",
    subject: "RFP: AI chatbot for customer support — $180k budget",
    sender: {
      name: "Derek Holt",
      email: "derek@brightpathventures.com",
      avatarInitials: "DH",
    },
    preview:
      "We're issuing an RFP for an AI-powered customer support chatbot. Budget is $180k for Phase 1. We'd like your proposal by Friday...",
    body: `Hello,

BrightPath Ventures is issuing an RFP for an AI-powered customer support chatbot to handle Tier-1 inquiries across web, mobile, and WhatsApp.

Scope:
- 50,000 conversations/month initially, scaling to 200k by Q3
- Integration with Zendesk and Salesforce
- Multi-language support (EN, ES, FR, DE)
- 95% deflection rate target for Tier-1

Budget: $180,000 for Phase 1 (design, build, deploy, 3 months post-launch support).

We're evaluating 4 vendors and would like your proposal by this Friday at 5pm PT. Can you confirm you'll be submitting?

Best,
Derek Holt
CTO, BrightPath Ventures`,
    receivedAt: ago(3, 45),
    category: "proposal-request",
    priority: "high",
    isRead: true,
    aiSummary:
      "RFP for customer support chatbot. $180k Phase 1, 50k convos/month. Due Friday 5pm PT. Zendesk + Salesforce integration, multi-language.",
    draftResponse: {
      id: "dr-003",
      emailId: "e-003",
      subject: "Re: RFP: AI chatbot for customer support — $180k budget",
      body: `Hi Derek,

Thank you for including us in the BrightPath RFP — we're excited about this opportunity and confirm we'll be submitting our proposal by Friday at 5pm PT.

I've reviewed the scope and we align well: we've delivered multi-channel AI chatbots at similar scale (our recent deployment for FinServCo handles 80k conversations/month across 5 languages with a 96% Tier-1 deflection rate).

I may have a few clarifying questions on the Salesforce integration depth and your preferred deployment model (cloud vs. hybrid). Would you have 15 minutes tomorrow or Thursday for a quick call?

Looking forward,
Alex Chen`,
      tone: "professional",
      generatedAt: ago(3, 40),
    },
    extractedTasks: [
      {
        id: "t-005",
        emailId: "e-003",
        title: "Submit BrightPath chatbot RFP proposal",
        description:
          "Prepare and submit the full proposal response for the BrightPath Ventures AI chatbot RFP.",
        dueDate: new Date(Date.now() + 5 * 24 * 3600_000).toISOString(),
        sourceQuote:
          "we'd like your proposal by this Friday at 5pm PT",
      },
    ],
  },
  {
    id: "e-004",
    subject: "Follow-up: Custom analytics dashboard proposal",
    sender: {
      name: "Sarah Chen",
      email: "sarah@meridianhealth.org",
      avatarInitials: "SC",
    },
    preview:
      "Following up on our call last week — have you had a chance to scope the custom analytics dashboard? Our board meeting is next Wednesday...",
    body: `Hi Alex,

Following up on our call last Tuesday about the custom analytics dashboard for our patient-outcomes programme. The board meeting is next Wednesday and I need at least a rough scope and budget estimate to present.

Key requirements we discussed:
- Real-time visualisation of 12 KPIs
- Role-based access (admin, clinician, board)
- Integration with our existing EHR system (Epic)
- HIPAA-compliant audit logging

Could you get me something by Monday so I can review before the board meeting?

Thanks,
Sarah`,
    receivedAt: ago(5, 0),
    category: "proposal-request",
    priority: "high",
    isRead: true,
    aiSummary:
      "Follow-up on analytics dashboard scope for Meridian Health board meeting. Needs budget estimate by Monday. Epic EHR integration, HIPAA compliance.",
    draftResponse: {
      id: "dr-004",
      emailId: "e-004",
      subject: "Re: Follow-up: Custom analytics dashboard proposal",
      body: `Hi Sarah,

Thanks for the nudge — I've been working on the scope and it's nearly complete. You'll have a detailed proposal with budget estimate and timeline in your inbox by Monday morning.

Quick preview: I'm ballparking 8-10 weeks for a Phase 1 that covers all 12 KPIs with role-based access and Epic integration, and I've already run the HIPAA compliance checklist against our standard deployment architecture (we pass clean).

Happy to walk you through it on Monday afternoon before your Wednesday board meeting.

Best,
Alex`,
      tone: "friendly",
      generatedAt: ago(4, 55),
    },
    extractedTasks: [
      {
        id: "t-006",
        emailId: "e-004",
        title: "Finalise Meridian Health dashboard proposal",
        description:
          "Complete scope, budget estimate, and timeline for the Meridian Health analytics dashboard proposal.",
        dueDate: new Date(Date.now() + 3 * 24 * 3600_000).toISOString(),
        sourceQuote:
          "Could you get me something by Monday",
      },
    ],
  },

  // ---- INVOICE (2) ----
  {
    id: "e-005",
    subject: "Invoice #INV-2025-04-012 — Payment reminder",
    sender: {
      name: "Billing Dept",
      email: "billing@cloudops.net",
      avatarInitials: "BD",
    },
    preview:
      "This is a reminder that invoice #INV-2025-04-012 for $14,200 is now 15 days past due. Please remit payment at your earliest convenience...",
    body: `Dear Valued Client,

This is a friendly reminder that invoice #INV-2025-04-012 in the amount of $14,200.00 remains unpaid and is now 15 days past due.

Invoice details:
- Invoice #: INV-2025-04-012
- Amount: $14,200.00
- Issue date: April 1, 2025
- Due date: April 30, 2025
- Services: Cloud infrastructure management — March 2025

Payment can be made via ACH or wire transfer. Banking details are attached.

If payment has already been made, please disregard this notice and accept our thanks.

Regards,
CloudOps Billing`,
    receivedAt: ago(8, 0),
    category: "invoice",
    priority: "medium",
    isRead: true,
    aiSummary:
      "CloudOps invoice #INV-2025-04-012 for $14,200 is 15 days past due. Payment reminder — ACH or wire transfer.",
    draftResponse: {
      id: "dr-005",
      emailId: "e-005",
      subject: "Re: Invoice #INV-2025-04-012 — Payment reminder",
      body: `Hello,

Apologies for the delay. I've checked with our finance team and can confirm that payment for invoice #INV-2025-04-012 ($14,200.00) was initiated via ACH on May 13 and should clear within 2-3 business days.

Our transaction reference is TRX-88291. Please let me know if you need any further documentation.

Best regards,
Alex Chen`,
      tone: "concise",
      generatedAt: ago(7, 55),
    },
    extractedTasks: [],
  },
  {
    id: "e-006",
    subject: "New invoice from DesignCrew — $3,800 for Q2 retainer",
    sender: {
      name: "Lena Ortiz",
      email: "lena@designcrew.co",
      avatarInitials: "LO",
    },
    preview:
      "Hi Alex, attached is our Q2 retainer invoice for the ongoing UI/UX work. Please approve and forward to AP...",
    body: `Hi Alex,

Attached is our Q2 retainer invoice for the ongoing UI/UX work on the admin dashboard redesign.

Amount: $3,800.00
Period: April — June 2025
Terms: Net 30

Could you approve and forward to AP for processing? Let me know if you need a breakdown by sprint.

Cheers,
Lena`,
    receivedAt: ago(12, 30),
    category: "invoice",
    priority: "medium",
    isRead: true,
    aiSummary:
      "DesignCrew Q2 retainer invoice for $3,800. UI/UX work on admin dashboard. Needs approval and AP forwarding.",
    draftResponse: {
      id: "dr-006",
      emailId: "e-006",
      subject: "Re: New invoice from DesignCrew — $3,800 for Q2 retainer",
      body: `Hi Lena,

Approved — I've forwarded the invoice to AP with a note to prioritise. You should see payment within the Net 30 window.

The sprint-level breakdown would actually be useful for our internal cost tracking. Would you mind sending that when you have a moment?

Thanks,
Alex`,
      tone: "friendly",
      generatedAt: ago(12, 25),
    },
    extractedTasks: [
      {
        id: "t-007",
        emailId: "e-006",
        title: "Forward DesignCrew Q2 invoice to AP",
        description:
          "Forward approved invoice to Accounts Payable for processing within Net 30 terms.",
        dueDate: null,
        sourceQuote:
          "Could you approve and forward to AP for processing?",
      },
    ],
  },

  // ---- MEETING-FOLLOW-UP (2) ----
  {
    id: "e-007",
    subject: "Meeting notes: Q3 roadmap planning session",
    sender: {
      name: "Jordan Miles",
      email: "jordan@acmecorp.com",
      avatarInitials: "JM",
    },
    preview:
      "Great session today. Here are my raw notes. Action items: AI triage POC by July, dashboard v2 wireframes by next sprint, client workshop scheduling...",
    body: `Team,

Great session today — we covered a lot of ground on Q3 priorities. Here are my raw notes and action items:

Decisions:
1. AI email triage POC to be production-ready by July 15 (Alex to lead)
2. Dashboard v2 wireframes to be reviewed in next sprint planning (Lena)
3. Client onboarding workshop to be scheduled for new enterprise accounts (Jordan)

Action items:
- Alex: Define scope doc for AI triage POC by EOW
- Lena: Wireframe 3 key dashboard views
- Jordan: Draft client workshop agenda and send calendar invites
- All: Review the Q3 budget draft in Notion by Thursday

I've attached the full Miro board export. Let me know if I missed anything.

Jordan`,
    receivedAt: ago(18, 0),
    category: "meeting-follow-up",
    priority: "medium",
    isRead: true,
    aiSummary:
      "Q3 roadmap session: AI triage POC by July 15, dashboard v2 wireframes, client workshop. Alex to deliver scope doc by EOW.",
    draftResponse: null,
    extractedTasks: [
      {
        id: "t-008",
        emailId: "e-007",
        title: "Define scope document for AI email triage POC",
        description:
          "Write a scope document covering requirements, architecture, timeline, and success criteria for the AI email triage proof-of-concept.",
        dueDate: new Date(Date.now() + 2 * 24 * 3600_000).toISOString(),
        sourceQuote:
          "Alex: Define scope doc for AI triage POC by EOW",
      },
      {
        id: "t-009",
        emailId: "e-007",
        title: "Review Q3 budget draft in Notion",
        description:
          "Review and provide feedback on the Q3 budget draft document in Notion.",
        dueDate: new Date(Date.now() + 1 * 24 * 3600_000).toISOString(),
        sourceQuote:
          "All: Review the Q3 budget draft in Notion by Thursday",
      },
    ],
  },
  {
    id: "e-008",
    subject: "Action items from client kickoff — VirtuStream",
    sender: {
      name: "Tanya Reeves",
      email: "tanya@virtustream.io",
      avatarInitials: "TR",
    },
    preview:
      "Thanks for a productive kickoff yesterday. Summarising our agreed next steps: technical discovery doc, staging environment setup, weekly sync starting Thursday...",
    body: `Alex,

Thanks for a productive kickoff yesterday. I wanted to summarise our agreed next steps so everything is in writing:

1. Technical discovery document — covering current architecture, pain points, and integration touchpoints. Target: end of next week.
2. Staging environment — we'll provision a dedicated environment for your team by Tuesday.
3. Weekly sync — Thursdays at 10am ET starting this week. I've sent the recurring invite.
4. Data access — we'll provide API keys and sample datasets by Wednesday COB.

Let me know if anything looks off. Really looking forward to working together on this.

Tanya`,
    receivedAt: ago(22, 0),
    category: "meeting-follow-up",
    priority: "medium",
    isRead: true,
    aiSummary:
      "VirtuStream kickoff action items: tech discovery doc due EOW, staging env by Tue, weekly sync Thursdays 10am ET.",
    draftResponse: {
      id: "dr-007",
      emailId: "e-008",
      subject: "Re: Action items from client kickoff — VirtuStream",
      body: `Hi Tanya,

This all looks spot-on — thanks for capturing everything so clearly. I've accepted the recurring invite and blocked out time on my calendar.

I'll start on the discovery doc tomorrow and may reach out with a few questions about the current integration layer. Looking forward to digging in.

Best,
Alex`,
      tone: "friendly",
      generatedAt: ago(21, 55),
    },
    extractedTasks: [
      {
        id: "t-010",
        emailId: "e-008",
        title: "Write VirtuStream technical discovery document",
        description:
          "Document current architecture, pain points, and integration touchpoints for VirtuStream engagement.",
        dueDate: new Date(Date.now() + 5 * 24 * 3600_000).toISOString(),
        sourceQuote:
          "Technical discovery document — covering current architecture, pain points, and integration touchpoints. Target: end of next week.",
      },
    ],
  },

  // ---- SPAM (2) ----
  {
    id: "e-009",
    subject: "🔥 Boost your LinkedIn followers by 10,000 in 30 days!",
    sender: {
      name: "GrowthHackr Pro",
      email: "noreply@growthhackr-pro.biz",
      avatarInitials: "GP",
    },
    preview:
      "Tired of low engagement? Our AI-powered growth engine guarantees 10,000 new followers in 30 days or your money back...",
    body: `Hi there,

Tired of low engagement on LinkedIn? Our AI-powered growth engine guarantees 10,000 new followers in 30 days — or your money back!

✦ Automated content scheduling
✦ AI-optimised hashtag recommendations
✦ Smart engagement pods with real users
✦ Weekly growth reports

~~$499/month~~ → $199/month (limited time offer)

Click here to claim your 7-day free trial: [suspicious link redacted]

Best,
The GrowthHackr Team`,
    receivedAt: ago(0, 45),
    category: "spam",
    priority: "low",
    isRead: false,
    aiSummary:
      "Unsolicited LinkedIn growth service. Auto-triaged to spam. No action needed.",
    draftResponse: null,
    extractedTasks: [],
  },
  {
    id: "e-010",
    subject: "RE: Your domain registration expires in 24 hours ⚠️",
    sender: {
      name: "Domain Services",
      email: "urgent@domain-renewal-scam.net",
      avatarInitials: "DS",
    },
    preview:
      "URGENT: Your domain registration is about to expire. Renew now to avoid losing your domain. Click here for instant renewal at a special rate...",
    body: `⚠️ URGENT: Your domain registration is about to expire!

Dear Domain Owner,

Our records indicate that your domain registration will expire within 24 hours. Failure to renew will result in permanent loss of your domain and all associated services.

To prevent this, click the link below for instant renewal at our special partner rate of $89/year (regularly $199):

[malicious link redacted]

This is an automated message. Please do not reply.

Domain Services Team`,
    receivedAt: ago(0, 50),
    category: "spam",
    priority: "low",
    isRead: false,
    aiSummary:
      "Phishing attempt disguised as domain expiry notice. Flagged as spam by content analysis. No legitimate domain referenced.",
    draftResponse: null,
    extractedTasks: [],
  },

  // ---- INTERNAL (2) ----
  {
    id: "e-011",
    subject: "New starter onboarding — Priya joins Monday",
    sender: {
      name: "HR Team",
      email: "hr@company.internal",
      avatarInitials: "HR",
    },
    preview:
      "Priya Nair joins as Senior Backend Engineer on Monday. Please ensure her accounts, repo access, and documentation are ready...",
    body: `Hi all,

Priya Nair joins the engineering team this Monday (June 15) as a Senior Backend Engineer. She'll be working primarily on the data pipeline and API layer.

Please ensure the following are ready by Friday COB:
- GitHub access (team: backend-eng, repos: data-pipeline, api-gateway, shared-libs)
- AWS IAM account with read access to dev/staging
- Slack channels: #eng-backend, #eng-general, #announcements
- Notion onboarding doc assigned
- Calendar invite for Monday 9am team intro

Her manager will be David Okonkwo. Please add David as approver on all access requests.

Thanks,
People Ops`,
    receivedAt: ago(24, 0),
    category: "internal",
    priority: "medium",
    isRead: true,
    aiSummary:
      "New Senior Backend Engineer Priya Nair starts Monday. GitHub, AWS, Slack, Notion access needed by Friday COB.",
    draftResponse: null,
    extractedTasks: [
      {
        id: "t-011",
        emailId: "e-011",
        title: "Provision GitHub access for Priya Nair",
        description:
          "Add Priya to backend-eng team with access to data-pipeline, api-gateway, and shared-libs repos.",
        dueDate: new Date(Date.now() + 1 * 24 * 3600_000).toISOString(),
        sourceQuote:
          "GitHub access (team: backend-eng, repos: data-pipeline, api-gateway, shared-libs)",
      },
      {
        id: "t-012",
        emailId: "e-011",
        title: "Create AWS IAM account for Priya Nair",
        description:
          "Provision AWS IAM user with read-only access to dev and staging environments.",
        dueDate: new Date(Date.now() + 1 * 24 * 3600_000).toISOString(),
        sourceQuote:
          "AWS IAM account with read access to dev/staging",
      },
    ],
  },
  {
    id: "e-012",
    subject: "Feedback requested: Engineering all-hands survey",
    sender: {
      name: "David Okonkwo",
      email: "david@company.internal",
      avatarInitials: "DO",
    },
    preview:
      "We're running the quarterly engineering satisfaction survey. Please take 5 minutes to fill it out before Friday. Your feedback directly shapes our priorities...",
    body: `Hey team,

We're running our quarterly engineering satisfaction survey and I'd really appreciate your honest feedback. It's anonymous and takes about 5 minutes.

This quarter we're especially interested in:
- How the new sprint structure is working for you
- Tooling and developer experience score
- Ideas for the Q3 hackathon theme

Survey link: https://surveys.company.internal/q2-2025-eng

Deadline: Friday 5pm. Results will be shared in the next all-hands.

Thanks for helping us make this a better place to build.

David
VP Engineering`,
    receivedAt: ago(48, 0),
    category: "internal",
    priority: "low",
    isRead: false,
    aiSummary:
      "Quarterly engineering satisfaction survey. Anonymous, 5 minutes. Due Friday. Topics: sprint structure, DX, Q3 hackathon ideas.",
    draftResponse: null,
    extractedTasks: [
      {
        id: "t-013",
        emailId: "e-012",
        title: "Complete Q2 engineering satisfaction survey",
        description:
          "Fill out the anonymous quarterly engineering survey covering sprint structure, developer experience, and hackathon themes.",
        dueDate: new Date(Date.now() + 2 * 24 * 3600_000).toISOString(),
        sourceQuote:
          "Please take 5 minutes to fill it out before Friday",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Draft Responses (precomputed reference)
// ---------------------------------------------------------------------------
export const demoDrafts: DraftResponse[] = demoEmails
  .filter((e) => e.draftResponse !== null)
  .map((e) => e.draftResponse!);

// ---------------------------------------------------------------------------
// Admin Tasks (precomputed reference)
// ---------------------------------------------------------------------------
export const demoTasks: AdminTask[] = demoEmails.flatMap((e) =>
  e.extractedTasks.map((t) => ({ ...t })),
);

// ---------------------------------------------------------------------------
// Daily Digest
// ---------------------------------------------------------------------------
export const demoDigest: DailyDigest = (() => {
  const today = new Date().toISOString().slice(0, 10);
  const categoryBreakdown: Record<string, number> = {};
  for (const e of demoEmails) {
    categoryBreakdown[e.category] = (categoryBreakdown[e.category] || 0) + 1;
  }
  return {
    date: today,
    totalReceived: demoEmails.length,
    triaged: demoEmails.filter((e) => e.category !== "spam").length,
    criticalCount: demoEmails.filter((e) => e.priority === "critical").length,
    highCount: demoEmails.filter((e) => e.priority === "high").length,
    tasksExtracted: demoTasks.length,
    responsesDrafted: demoDrafts.length,
    categoryBreakdown: categoryBreakdown as DailyDigest["categoryBreakdown"],
    highlights: [
      "2 critical production incidents detected and resolved — checkout outage and GDPR DSAR deadline",
      "3 high-priority proposals drafted (BrightPath $180k RFP, Meridian Health dashboard, VirtuStream discovery)",
      "13 administrative tasks extracted from email threads — 10 with due dates",
      "2 phishing/spam emails filtered (domain scam, LinkedIn growth spam)",
      "92% of inbound emails triaged to correct category by AI classifier",
    ],
  };
})();

// ---------------------------------------------------------------------------
// Dashboard Stats
// ---------------------------------------------------------------------------
export const demoStats: DashboardStats = {
  unread: demoEmails.filter((e) => !e.isRead).length,
  triaged: demoEmails.filter((e) => e.category !== "spam").length,
  drafted: demoDrafts.length,
  tasksExtracted: demoTasks.length,
  criticalCount: demoEmails.filter((e) => e.priority === "critical").length,
};
