import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Email AI Triage — Smart Inbox & Auto-Drafting",
  description:
    "An AI-powered email dashboard that categorises, prioritises, and drafts responses to incoming emails. Extract admin tasks, generate proposal documents, and get a daily digest — all from your inbox.",
  keywords: [
    "email triage",
    "AI inbox",
    "auto-drafting",
    "email automation",
    "smart inbox",
    "AI assistant",
  ],
  openGraph: {
    title: "Email AI Triage — Smart Inbox & Auto-Drafting",
    description:
      "AI-powered email triage and auto-drafting dashboard. Categorise, prioritise, and respond faster.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
