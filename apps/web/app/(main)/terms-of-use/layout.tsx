import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms and conditions for using the TriMergePRO Careers platform.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
