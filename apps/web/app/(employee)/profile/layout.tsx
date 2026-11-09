import type { Metadata } from "next";
import { RequireRole } from "@/app/components/ui/RouteGuards";

export const metadata: Metadata = {
  title: "My Profile",
  description: "View and update your candidate profile and resume.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RequireRole allow={["TALENT"]}>{children}</RequireRole>;
}
