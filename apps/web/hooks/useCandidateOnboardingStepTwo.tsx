import { useUser } from "@/contexts/userContext/userContext";
import { useState } from "react";

type StepTwoPayload = {
  phoneNumber: string;
  location: string;
  jobTitleOrDesiredRole: string;
  yearsOfExperience: number | string;
  linkedinUrl?: string;
  resumeUrl?: string;
};

type SubmitArg = StepTwoPayload | FormData;

export const useCandidateOnboardingStepTwo = () => {
  const {state} = useUser()
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (data: SubmitArg) => {
    setLoading(true);
    setError(null);

    try {
      let response: Response;
      if (data instanceof FormData) {
        response = await fetch(`https://trimerge-pro-career.onrender.com/api/v1/onboarding/candidate/step-2`, {
            headers:{
                Authorization: `Bearer ${localStorage.getItem("tm_token")}`
            },
          method: "POST",
          body: data, // browser sets multipart/form-data boundary
        });
      } else {
        response = await fetch(`https://trimerge-pro-career.onrender.com/api/v1/onboarding/candidate/step-2`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.message || result?.error || "Could not complete onboarding step 2");
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
