"use client";

import React, { createContext, useContext, useEffect, useReducer } from "react";
import { useRouter } from "next/navigation";

// Types
type Profile = {
  firstName?: string;
  lastName?: string;
  [k: string]: unknown;
};
type Response = {
  user: User,
  accessToken: string,
  refreshToken: string,
  message: string
}

type User = {
  id: string;
  email: string;
  accountType?: string;
  isVerified?: boolean;
  status?: string;
  profile?: Profile;
  [k: string]: unknown;
};

type State = {
  user: User | null;
  loading: boolean;
  error?: string | null;
};

type Action =
  | { type: "RESTORE"; user: User | null }
  | { type: "LOGIN"; user: User }
  | { type: "LOGOUT" }
  | { type: "UPDATE"; user: Partial<User> }
  | { type: "ERROR"; error: string }
  | { type: "LOADING" }

  // New helper actions for external hooks
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "SET_USER"; user: User | null }

const initialState: State = {
  user: null,
  loading: false,
  error: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "RESTORE":
      return { ...state, user: action.user, loading: false };
    case "LOGIN":
      return { ...state, user: action.user, loading: false, error: null };
    case "LOGOUT":
      return { ...state, user: null, loading: false };
    case "UPDATE":
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.user } : null,
      };
    case "ERROR":
      return { ...state, error: action.error, loading: false };
    case "LOADING":
      return { ...state, loading: true, error: null };
    case "SET_LOADING":
      return { ...state, loading: action.loading };
    case "SET_ERROR":
      return { ...state, error: action.error, loading: false };
    case "SET_USER":
      return { ...state, user: action.user, loading: false, error: null };
    default:
      return state;
  }
}

// Context
type UserContextType = {
  state: State;
  logout: () => void;
  updateProfile: (patch: Partial<User>) => void;
  restoreSession: () => void;
  // Basic setters/clears so external hooks can control state directly
  // Accept either a full auth Response, a User object, or null
  setUser: (response: Response | User | null) => void;
  clearState: () => void;
  setLoadingFlag: (loading: boolean) => void;
  setError: (error: string | null) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  // Do not access localStorage synchronously to avoid SSR/runtime errors.
  // Restore session on the client inside useEffect below.
  const [state, dispatch] = useReducer(reducer, initialState);
  const router = useRouter();

  // Restore session from localStorage (simple example)
  useEffect(() => {
    const token = localStorage.getItem("tm_token");
    const raw = localStorage.getItem("tm_user");
    if (raw) {
      try {
        const user = JSON.parse(raw) as User;
        console.log("Restoring user from storage:", user);
        // If a token is present, attach token info; otherwise restore whatever user info we have
        if (token) {
          dispatch({ type: "RESTORE", user: { ...user, accessToken: token, refreshToken: localStorage.getItem('tm_refresh') || undefined } });
        } else {
          dispatch({ type: "RESTORE", user });
        }
      } catch (e) {
        console.warn("Failed to parse user from storage", e);
        dispatch({ type: "RESTORE", user: null });
      }
    } else {
      dispatch({ type: "RESTORE", user: null });
    }
  }, []);


  function logout() {
    localStorage.removeItem("tm_token");
    localStorage.removeItem("tm_user");
    localStorage.removeItem("tm_refresh");
    dispatch({ type: "LOGOUT" });
    router.push("/login");
  }

  function updateProfile(patch: Partial<User>) {
    if (!state.user) return;
    const updated = { ...state.user, ...patch };
    localStorage.setItem("tm_user", JSON.stringify({ id: updated.id, name: updated.name, email: updated.email }));
    dispatch({ type: "UPDATE", user: patch });
  }

  // Minimal, explicit setters for external hooks to call
  function setUser(response: Response | User | null) {
    if (!response) {
      localStorage.removeItem("tm_token");
      localStorage.removeItem("tm_refresh");
      localStorage.removeItem("tm_user");
      dispatch({ type: "SET_USER", user: null });
      return;
    }

    // If it's an auth Response (contains .user), extract tokens and user
    if ('user' in response) {
      const resp = response as Response;
      const user = resp.user;
      const access = typeof resp.accessToken === 'string' ? resp.accessToken : '';
      const refresh = typeof resp.refreshToken === 'string' ? resp.refreshToken : '';
      if (access) localStorage.setItem('tm_token', access);
      if (refresh) localStorage.setItem('tm_refresh', refresh);

      const safeUser = {
        id: user.id,
        email: user.email,
        accountType: 'accountType' in user ? (user as User).accountType : undefined,
        isVerified: 'isVerified' in user ? (user as User).isVerified : undefined,
        status: 'status' in user ? (user as User).status : undefined,
        profile: 'profile' in user ? (user as User).profile : undefined,
      };
      localStorage.setItem('tm_user', JSON.stringify(safeUser));
      dispatch({ type: 'SET_USER', user });
      return;
    }

    // Otherwise assume it's a plain User object
    const user = response as User;
    const safeUser = {
      id: user.id,
      email: user.email,
      accountType: user.accountType,
      isVerified: user.isVerified,
      status: user.status,
      profile: user.profile,
    };
    localStorage.setItem('tm_user', JSON.stringify(safeUser));
    dispatch({ type: 'SET_USER', user });
  }

  function clearState() {
    localStorage.removeItem("tm_token");
    localStorage.removeItem("tm_user");
    dispatch({ type: "SET_USER", user: null });
    dispatch({ type: "SET_ERROR", error: null });
    dispatch({ type: "SET_LOADING", loading: false });
  }

  function setLoadingFlag(loading: boolean) {
    dispatch({ type: "SET_LOADING", loading });
  }

  function setError(error: string | null) {
    dispatch({ type: "SET_ERROR", error });
  }

  function restoreSession() {
    const token = localStorage.getItem("tm_token");
    const raw = localStorage.getItem("tm_user");
    if (token && raw) {
      try {
        const user = JSON.parse(raw) as User;
        // rehydrate token fields
        const rehydrated = { ...user, accessToken: token, refreshToken: localStorage.getItem('tm_refresh') || undefined };
        dispatch({ type: "RESTORE", user: rehydrated });
      } catch {
          setUser(raw ? JSON.parse(raw) as User : null);
      }
    } else {
      dispatch({ type: "RESTORE", user: null });
    }
  }

  return (
    <UserContext.Provider value={{ state, logout, updateProfile, restoreSession, setUser, clearState, setLoadingFlag, setError }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
