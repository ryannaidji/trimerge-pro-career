import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Jobs",
  description: "Search open positions in government and commercial contracting and apply online.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
