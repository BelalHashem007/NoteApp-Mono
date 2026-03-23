"use server"
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { $ZodIssue } from "zod/v4/core";
import { SignUpSchema, LoginSchema } from "@/lib/zod";
import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";

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
                isSignUp:true,
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

export async function handleLogout(){
    await signOut({redirectTo:"/login"});
}