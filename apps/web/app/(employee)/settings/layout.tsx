import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Change your password or delete your account.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
