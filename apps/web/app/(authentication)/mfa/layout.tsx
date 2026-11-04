import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Two-Factor Authentication",
  description: "Verify your identity to continue.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
