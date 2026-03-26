'use client';
import { signIn } from "next-auth/react";
import { useEffect } from "react";

export default function AuthCallback() {
  useEffect(() => {
    signIn("credentials", { 
      isExternal: true, 
      redirect: true, 
      redirectTo: "/dashboard" 
    });
  }, []);

  return <div>Completing login...</div>;
}