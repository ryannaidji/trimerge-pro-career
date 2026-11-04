import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Session Expired",
  description: "Your session has expired. Please sign in again.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
