import { useState } from "react";

type ResetPasswordPayload = {
  email: string;
  otp: string;
  newPassword: string;
};

export const useResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const reset = async (payload: ResetPasswordPayload) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`https://trimerge-pro-career.onrender.com/api/v1/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error || result?.message || "Could not reset password");
      }

      setSuccess(result?.message || "Password reset successfully");
      return result;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { reset, loading, error, success } as const;
};
