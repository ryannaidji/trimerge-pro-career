import { useState } from "react";

type VerifyPayload = {
  email: string;
  otp: string;
};

export const useVerifyEmail = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verify = async (data: VerifyPayload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://trimerge-pro-career.onrender.com/api/v1/onboarding/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Verification failed");
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

  return { verify, loading, error, setError } as const;
};
