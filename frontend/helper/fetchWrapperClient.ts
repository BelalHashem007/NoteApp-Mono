"use client";
import { useSession } from "next-auth/react";

export function useFetchWrapperClient() {
  const { data: session, status } = useSession();

  const fetchWrapper = async (url: string, options?: RequestInit) => {
    if (status !== "loading" && !session?.accessToken) {
      // router.push("/login?error=unauthorized");
      throw new Error("Unauthorized");
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
          "Content-Type": "application/json",
          ...options?.headers,
        },
      });

      if (!response.ok) throw response;
      return response.json();
    } catch (error) {
      //  router.push("/login?error=server_down");
      throw error;
    }
  };
  return fetchWrapper;
}
