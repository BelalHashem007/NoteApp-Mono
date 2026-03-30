"use client";

import { useRouter } from "next/navigation";
import { useAuthGuard } from "./useAuthGuard";
import { useCallback } from "react";
import { useSession } from "next-auth/react";

export function useFetchWrapperClient() {
  const {data:session, status} = useSession();
  const router = useRouter();

  const fetchWrapper = useCallback(async (url: string, options?: RequestInit) => {
    if (status !== 'loading' && !session?.accessToken) {
      router.push("/login?error=unauthorized");
      throw new Error("Unauthorized"); 
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Authorization": `Bearer ${session?.accessToken}`,
          "Content-Type": "application/json",
          ...options?.headers,
        },
      });

      if (!response.ok) throw response;
      return await response.json();    
    } catch (error) {
      if (error instanceof Response) throw error; 
      router.push("/login?error=server_down");
      throw error;
    }
  },[session, router]);

  return fetchWrapper;
}