import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verification Expired",
  description: "Your verification code has expired.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
