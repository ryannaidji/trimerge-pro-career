import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Profile",
  description: "View and update your candidate profile and resume.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
