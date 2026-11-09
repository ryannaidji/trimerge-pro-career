"use client";

// Page access by account type (#72-#80). This is navigation only: the API enforces permissions.
// - RequireRole: visitors go to /login, other account types go to their own home page.
// - GuestOnly: signed-in users skip the login and sign-up pages.
// Author: Ryan Naidji
import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

export type AccountType = "TALENT" | "EMPLOYER" | "ADMIN";
type Session = AccountType | "pending" | "visitor" | "unknown";

const HOME: Record<AccountType, string> = {
  TALENT: "/browse-jobs",
  EMPLOYER: "/employer-dashboard",
  ADMIN: "/admin",
};

// The guard only decides when a page is opened, so it never needs to re-read the session
const subscribe = () => () => {};
const pendingOnServer = (): Session => "pending";

function readSession(): Session {
  try {
    if (!localStorage.getItem("tm_token")) return "visitor";
    const { accountType } = JSON.parse(localStorage.getItem("tm_user") || "{}") as { accountType?: string };
    return accountType && accountType in HOME ? (accountType as AccountType) : "unknown";
  } catch {
    return "visitor";
  }
}

const useSession = () => useSyncExternalStore<Session>(subscribe, readSession, pendingOnServer);

function useRedirect(target: string | null) {
  const router = useRouter();
  useEffect(() => {
    if (target) router.replace(target);
  }, [target, router]);
}

export function RequireRole({ allow, children }: { allow: AccountType[]; children: React.ReactNode }) {
  const session = useSession();
  let target: string | null = null;
  if (session === "visitor") target = "/login";
  // A session without an account type is left to the API to accept or refuse
  else if (session !== "pending" && session !== "unknown" && !allow.includes(session)) target = HOME[session];
  useRedirect(target);

  // The page is not mounted until access is known, so it makes no API calls that would be refused
  return session === "pending" || target ? null : children;
}

export function GuestOnly({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const target = session === "TALENT" || session === "EMPLOYER" || session === "ADMIN" ? HOME[session] : null;
  useRedirect(target);

  // Public pages still render on the server for search engines
  return target ? null : children;
}
