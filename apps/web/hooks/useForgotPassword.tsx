import { useState } from "react";

type ForgotPasswordPayload = {
  email: string;
};

export const useForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const send = async (payload: ForgotPasswordPayload) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`https://trimerge-pro-career.onrender.com/api/v1/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error || result?.message || "Could not send reset code");
      }

      setSuccess(result?.message || "Reset code sent successfully");
      return result;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { send, loading, error, success } as const;
};
