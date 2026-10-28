import { useState } from "react";


export const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (data: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    agreeToTerms: boolean;
    updates: boolean;
    role: 'Candidate' | 'Recruiter';
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      // Call the local Netlify function directly. In production on Netlify
      // the function is available at /.netlify/functions/registerCandidate
      const response = await fetch(`https://trimerge-pro-career.onrender.com/api/v1/onboarding/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const responseData = await response.json();

      if (!response.ok) {
        const message = responseData?.error || responseData?.message || "Registration failed";
        setError(message);
        return null;
      }

      return responseData;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return { register, loading, error, setError };
};