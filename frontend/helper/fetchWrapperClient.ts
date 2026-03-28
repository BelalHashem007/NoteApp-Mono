"use client";

import { useRouter } from "next/navigation";
import { useAuthGuard } from "./useAuthGuard";
import { useCallback } from "react";

export function useFetchWrapperClient() {
  const session = useAuthGuard();
  const router = useRouter();

  const fetchWrapper = useCallback(async (url: string, options?: RequestInit): Promise<Response | null> => {
    if (!session?.accessToken) {
      router.push("/login?error=unauthorized");
      return null;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Authorization": `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
          ...options?.headers,
        },
      });

      if (response.status === 401) {
        router.push("/login?error=session_expired");
        return null;
      }

      return response;
    } catch (error) {
      router.push("/login?error=server_down");
      return null;
    }
  },[session, router]);

  return fetchWrapper;
}