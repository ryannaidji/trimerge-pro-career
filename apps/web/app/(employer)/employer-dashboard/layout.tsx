import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Employer Dashboard",
  description: "Manage job postings and applicants.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
