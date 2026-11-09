import type { Metadata } from "next";
import { RequireRole } from "@/app/components/ui/RouteGuards";

export const metadata: Metadata = {
  title: "My Applications",
  description: "Track the status of your job applications.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RequireRole allow={["TALENT"]}>{children}</RequireRole>;
}
