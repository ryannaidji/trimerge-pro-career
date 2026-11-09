import type { Metadata } from "next";
import { RequireRole } from "@/app/components/ui/RouteGuards";

export const metadata: Metadata = {
  title: "Settings",
  description: "Change your password or delete your account.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RequireRole allow={["TALENT", "EMPLOYER", "ADMIN"]}>{children}</RequireRole>;
}
