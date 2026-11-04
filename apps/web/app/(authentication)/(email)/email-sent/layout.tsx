import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Your Email",
  description: "Enter the verification code sent to your email.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
