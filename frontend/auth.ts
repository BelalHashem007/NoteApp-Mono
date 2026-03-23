import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

interface AuthCredentials {
  email?: string;
  password?: string;
  fullname?: string;
  isSignUp?: boolean;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            name: "My Backend",
            credentials: {
                fullname: { label: "fullname", type: "text" },
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                const { email, fullname, password, isSignUp } = credentials as AuthCredentials

                const endpoint = isSignUp ? 
                "http://localhost:5262/auth/register" : "http://localhost:5262/auth/login"

            const result = await fetch(endpoint, {
                    method: "POST",
                    body: JSON.stringify({email, password, fullname}),
                    headers: {
                        "Content-Type": "application/json"
                    },
                })
                
                const body = await result.json()
                console.log(body);
                const user = body.data
                if (result.ok && user)
                    return user;

                return null;
            },
        })
    ],
    pages: {
        signIn: "/login"
    },
    session: {
        strategy: "jwt",
        maxAge: 30*60
    },
    callbacks: {
        jwt: async ({ token, user }) => {
            if (user) {
                token.accessToken = user.accessToken
            }
            return token;
        },
        session: ({ session, token }) => {
            session.accessToken = token.accessToken as string;
            return session;
        }
    }
})