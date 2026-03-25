"use client"

import { useSession } from "next-auth/react"
import { signOut } from "next-auth/react";
import { useEffect } from "react";

export function useAuthGuard() {
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === "loading")
            return;

        if (!session || session.error === "RefreshTokenError")
            signOut({ redirectTo: "/login" })
    }, [session, status])

    return session;
}