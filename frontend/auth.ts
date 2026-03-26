import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { refreshAccessToken } from "./actions/authActions";
import { loginExternal } from "./actions/authActions";

interface AuthCredentials {
    email?: string;
    password?: string;
    fullname?: string;
    isSignUp?: boolean;
    isExternal?:boolean;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            name: "My Backend",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            authorize: async (credentials, req) => {
                const { email, fullname, password, isSignUp, isExternal } = credentials as AuthCredentials
                //external login e.g. google
                if (isExternal)
                    return await loginExternal(req);

                const endpoint = isSignUp ?
                    "http://localhost:5001/api/auth/register" : "http://localhost:5001/api/auth/login"

                const result = await fetch(endpoint, {
                    method: "POST",
                    body: JSON.stringify({ email, password, fullname }),
                    headers: {
                        "Content-Type": "application/json"
                    },
                })

                const body = await result.json()
                const data = body.data
                if (result.ok && data) {
                    const setCookieHeader = result.headers.getSetCookie?.()?.[0] ?? "";
                    const rawToken = setCookieHeader.includes("=")
                        ? setCookieHeader.substring(setCookieHeader.indexOf("=") + 1, setCookieHeader.indexOf(";"))
                        : "";
                    return {
                        accessToken: data.accessToken,
                        email: data.user.email,
                        id: data.user.id,
                        name: data.user.fullName,
                        refreshToken: decodeURIComponent(rawToken),
                        accessTokenExpirationDate: data.accessTokenExpirationDate,
                    };
                }

                return null;
            },
        })
    ],
    pages: {
        signIn: "/login"
    },
    session: {
        strategy: "jwt",
        maxAge: 10 * 24 * 60 * 60
    },
    callbacks: {
        jwt: async ({ token, user }) => {
            if (user) {
                token.accessToken = user.accessToken;
                token.refreshToken = user.refreshToken;
                token.accessTokenExpires = user.accessTokenExpirationDate;
            }
            if (token.accessTokenExpires && Date.now() < new Date(token.accessTokenExpires.toString()).getTime() - 10000) {
                return token;
            }

            if (!token.refreshToken) throw new Error("Missing Refresh Token");
            return await refreshAccessToken(token);
        },
        session: ({ session, token }) => {
            session.accessToken = token.accessToken ?? undefined;
            session.refreshToken = token.refreshToken ?? undefined;
            session.error = token.error;
            return session;
        }
    }
})