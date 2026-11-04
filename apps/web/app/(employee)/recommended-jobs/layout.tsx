import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recommended Jobs",
  description: "Open jobs that match your profile.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
