import type { Metadata } from "next";
import { RequireRole } from "@/app/components/ui/RouteGuards";

export const metadata: Metadata = {
  title: "Find Talent",
  description: "Search candidate profiles by keywords, skills and location.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RequireRole allow={["EMPLOYER", "ADMIN"]}>{children}</RequireRole>;
}
