import type { Metadata } from "next";
import { GuestOnly } from "@/app/components/ui/RouteGuards";

export const metadata: Metadata = {
  title: "Join Now",
  description: "Create a free TriMergePRO Careers account as a candidate or an employer.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <GuestOnly>{children}</GuestOnly>;
}
