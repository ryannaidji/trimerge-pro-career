import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Employer Registration",
  description: "Complete your employer profile.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
