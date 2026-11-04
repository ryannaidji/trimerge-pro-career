import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find Talent",
  description: "Search candidate profiles by keywords, skills and location.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
