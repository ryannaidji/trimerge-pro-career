import { redirect } from "next/navigation";

// The change-password form now lives on the Settings page (#57)
export default function ChangePasswordPage() {
  redirect("/settings");
}
