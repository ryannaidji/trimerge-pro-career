import { useState } from "react";

type ResendPayload = {
  email: string;
};

export const useResendEmail = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resend = async (data: ResendPayload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/.netlify/functions/resendEmail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error || "Could not resend verification email");
      }

      return result;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { resend, loading, error } as const;
};
