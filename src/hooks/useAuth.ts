"use client";

import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { loginThunk, logout as logoutAction } from "../../lib/store/authSlice";
import { useRouter } from "next/navigation";

export const useAuth = () => {
  // Typed dispatch is required for thunk `.unwrap()` support.
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  const login = async (email: string, password: string) => {
    try {
      // loginThunk updates Redux token/user and handles persistence.
      const data = await dispatch(loginThunk({ email, password })).unwrap();
      // Keep a local copy of user profile for non-Redux consumers.
      localStorage.setItem("user", JSON.stringify(data.user));
      // Legacy consumers expect a dashboard push from this hook.
      router.push("/dashboard");
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const logout = () => {
    // Slice logout clears token + auth state.
    dispatch(logoutAction());
    // Clear extra user cache used by existing UI code.
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  return {
    // Expose raw auth slice fields plus convenience methods/derived loading state.
    ...auth,
    login,
    logout,
    isLoading: auth.status === "loading",
  };
};
