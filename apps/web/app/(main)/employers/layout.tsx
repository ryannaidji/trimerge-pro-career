import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "For Employers",
  description: "Post jobs, review applicants and build your talent pipeline with TriMergePRO Careers.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
