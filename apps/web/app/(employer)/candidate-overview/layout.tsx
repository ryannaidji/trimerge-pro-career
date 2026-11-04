import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Candidate Overview",
  description: "Review candidate details and application history.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
