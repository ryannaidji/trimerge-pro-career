import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Password Updated",
  description: "Your password has been updated.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
