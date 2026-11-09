import type { Metadata } from "next";
import { RequireRole } from "@/app/components/ui/RouteGuards";

export const metadata: Metadata = {
  title: "Employer Dashboard",
  description: "Manage job postings and applicants.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RequireRole allow={["EMPLOYER"]}>{children}</RequireRole>;
}
