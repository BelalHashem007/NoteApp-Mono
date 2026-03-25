"use server"
import type { $ZodIssue } from "zod/v4/core";
import { SignUpSchema, LoginSchema } from "@/lib/zod";
import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { JWT } from "next-auth/jwt";

type AuthenticationErrors = {
    validationErrors?: $ZodIssue[],
    serverErrors?: { message: string }
}

export async function createAccount(_prevState: unknown, formData: FormData): Promise<AuthenticationErrors | undefined> {
    await new Promise(resolve => setTimeout(() => {
        resolve("test")
    }, 2000));
    const data = SignUpSchema.safeParse(Object.fromEntries(formData.entries()))

    if (!data.success) {
        console.log(data.error?.issues)
        return { validationErrors: data.error?.issues }
    }
    else {
        try {
            await signIn("credentials", {
                ...Object.fromEntries(formData),
                isSignUp: true,
                redirectTo: "/dashboard",
            });
        } catch (error) {
            if (error instanceof AuthError) {
                return { serverErrors: { message: "Invalid credentials" } };
            }
            throw error;
        }
    }
}

export async function LoginUser(_prevState: unknown, formData: FormData): Promise<AuthenticationErrors | undefined> {
    await new Promise(resolve => setTimeout(() => {
        resolve("test")
    }, 2000));

    const data = LoginSchema.safeParse(Object.fromEntries(formData.entries()))

    if (!data.success) {
        console.log(data.error?.issues)
        return { validationErrors: data.error?.issues }
    }
    else {
        try {
            await signIn("credentials", {
                ...Object.fromEntries(formData),
                redirectTo: "/dashboard",
            });
        } catch (error) {
            if (error instanceof AuthError) {
                return { serverErrors: { message: "Invalid credentials" } };
            }
            throw error;
        }
    }
}

export async function handleLogout() {
    await signOut({ redirectTo: "/login" });
}


export async function refreshAccessToken(token: JWT) {

    try {
        console.log(`in refresh function access token is ${JSON.stringify(token.refreshToken)}`)
        const result = await fetch("http://localhost:5001/api/auth/refresh", {
            method: "POST",
            body: JSON.stringify({ refreshToken: token.refreshToken }),
            headers: {
                "Content-Type": "application/json"
            },
        })

        if (result.ok) {
            const body = await result.json();
            const data = body.data;
            const setCookieHeader = result.headers.get("set-cookie") ?? "";
            const rawToken = setCookieHeader.includes("=")
                ? setCookieHeader.substring(setCookieHeader.indexOf("=") + 1, setCookieHeader.indexOf(";"))
                : "";
            console.log("Body from refresh",body)
            const accessTokenExpires = data?.accessTokenExpirationDate;

            return {
                ...token,
                accessToken: data?.accessToken ?? token.accessToken,
                refreshToken: rawToken ? decodeURIComponent(rawToken) : token.refreshToken,
                accessTokenExpires,
            };
        } else {
            const body = await result.json();
            console.error("Error getting new refresh token", body);
            token.error = "RefreshTokenError"
            return token;
        }

    } catch (error) {
        console.error("Error refreshing access_token", error)
        token.error = "RefreshTokenError"
        return token;
    }

}