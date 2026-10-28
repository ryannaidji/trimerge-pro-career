import { useState } from 'react';

type StepThreePayload = {
  skills: string[];
  professionalSummary: string;
};

export const useCandidateOnboardingStepThree = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (data: StepThreePayload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://trimerge-pro-career.onrender.com/api/v1/onboarding/candidate/step-3`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${localStorage.getItem("tm_token")}`,
            'Content-Type': 'application/json',
          },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.message || result?.error || 'Could not complete onboarding step 3');
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

  return { submit, loading, error } as const;
};
