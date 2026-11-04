import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log In",
  description: "Sign in to your TriMergePRO Careers account.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
