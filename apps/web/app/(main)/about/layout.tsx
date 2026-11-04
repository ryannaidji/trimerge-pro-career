import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Learn how TriMergePRO Careers connects qualified professionals with government and commercial contracting opportunities.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
