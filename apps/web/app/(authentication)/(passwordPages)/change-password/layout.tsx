import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Change Password",
  description: "Update your account password.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
