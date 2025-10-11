"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Atom } from "react-loading-indicators";

export default function ProtectedPage({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]); // <-- include router

  if (loading) return <Atom color="#32cd32" size="medium" text="" textColor="" />;
  if (!user) return null; // prevent flash

  return <>{children}</>;
}
