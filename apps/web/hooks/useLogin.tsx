import { useState, useCallback } from "react";
import { useUser } from '@/contexts/userContext/userContext';

type LoginPayload = { email: string, password: string };
type LoginResponse = unknown;

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUser } = useUser();

  const login = useCallback(async (payload: LoginPayload): Promise<LoginResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("https://trimerge-pro-career.onrender.com/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json()
      console.log("Login response:", data);
      
      if (!res.ok) {
        const msg = data?.message || data?.error || "Login failed";
        setError(msg);
        return null;
      }

      // Persist entire auth response into UserContext so tokens are saved
      // (setUser accepts either the full Response or a plain User)
      try {
        setUser(data);
      } catch (e) {
        // if setUser fails, still return data but surface a warning
        console.warn('Failed to set user in context:', e);
      }

      return data;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error");
      return null;
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  return { login, loading, error, setError };
};