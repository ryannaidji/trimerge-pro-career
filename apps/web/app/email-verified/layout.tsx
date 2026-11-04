import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Email Verified",
  description: "Your email address has been verified.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
