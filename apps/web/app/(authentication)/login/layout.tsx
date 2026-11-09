import type { Metadata } from "next";
import { GuestOnly } from "@/app/components/ui/RouteGuards";

export const metadata: Metadata = {
  title: "Log In",
  description: "Sign in to your TriMergePRO Careers account.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <GuestOnly>{children}</GuestOnly>;
}
