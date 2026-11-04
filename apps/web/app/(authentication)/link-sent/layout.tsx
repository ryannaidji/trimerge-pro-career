import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Link Sent",
  description: "Check your inbox to continue.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
