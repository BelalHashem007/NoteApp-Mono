"use server"
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import * as z from "zod";
import type { $ZodIssue } from "zod/v4/core";

const SignUpSchema = z.object({
    fullname: z.string().min(2, "Name must be at least 2 characters"),
    email: z.email("Invalid email address"),
    password: z
        .string()
        .min(6, "Password must be at least 6 characters")
        .regex(/[a-z]/, "Must contain at least one lowercase letter")
        .regex(/[A-Z]/, "Must contain at least one uppercase letter")
        .regex(/[0-9]/, "Must contain at least one number")
        .regex(/[^a-zA-Z0-9]/, "Must contain at least one special character (@, #, etc.)"),
    confirmPassword: z.string(),
})
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"]
    });

const LoginSchema = z.object({
    email: z.email("Invalid email address"),
    password: z.string()
})

type AuthErrors = {
    validationErrors?: $ZodIssue[],
    serverErrors?: { message: string }
}

export async function createAccount(_prevState: unknown, formData: FormData): Promise<AuthErrors> {
    await new Promise(resolve => setTimeout(() => {
        resolve("test")
    }, 2000));
    let success = false;
    const data = SignUpSchema.safeParse(Object.fromEntries(formData.entries()))

    if (!data.success) {
        console.log(data.error?.issues)
        return { validationErrors: data.error?.issues }
    }
    else {
        try {
            const result = await fetch("http://localhost:5262/auth/signup", {
                method: "POST",
                body: JSON.stringify(data.data),
                headers: {
                    "Content-Type": "application/json"
                }
            })

            if (!result.ok) {
                const body = await result.json()
                console.log(body)
                return { serverErrors: { message: body.message ?? "Server error occurred." } }
            }

            success = true;

        } catch (e) {
            console.error(e)
            return { serverErrors: { message: "Network error: check your connection." } };
        }
        if (success)
            redirect("/login")
        return {};
    }
}

export async function LoginUser(_prevState: unknown, formData: FormData): Promise<AuthErrors> {
    await new Promise(resolve => setTimeout(() => {
        resolve("test")
    }, 2000));

    let success = false;
    const data = LoginSchema.safeParse(Object.fromEntries(formData.entries()))

    if (!data.success) {
        console.log(data.error?.issues)
        return { validationErrors: data.error?.issues }
    }
    else {
        try {
            console.log(data.data)
            const result = await fetch("http://localhost:5262/auth/login", {
                method: "POST",
                body: JSON.stringify(data.data),
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            })

            if (!result.ok) {
                const body = await result.json()
                console.log(body)
                return { serverErrors: { message: body.errors ?? "Server error occurred." } }
            }
            const body = await result.json()
            console.log(body);
            (await cookies()).set("accessToken", body.data.accessToken, { httpOnly: true, secure: false, maxAge: 30 * 60 })
            success = true;

        } catch (e) {
            console.error(e)
            return { serverErrors: { message: "Network error: check your connection." } };
        }
        if (success)
            redirect("/")
        return {};
    }
}

