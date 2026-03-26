"use client"
import Link from "next/link"
import FormInput from "./FormInput"
import FormButton from "./FormButton"
import { useActionState } from "react"
import { LoginUser } from "@/actions/authActions"

export default function LoginForm() {
    const [state, formAction, isPending] = useActionState(LoginUser, null);
    console.log(state)
    return (
        <>
            <form action={formAction} className="space-y-6">
                <div className="space-y-2">
                    <label htmlFor="email" className="text-sm">Email Address</label>
                    <FormInput type="email" id="email" name="email" />
                    {state?.validationErrors?.map((err, i) =>
                        err.path[0] === "email" &&
                        <div key={i} className="text-red-500 text-sm">{err.message}</div>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label htmlFor="password" className="text-sm">Password</label>
                        <button
                            type="button"
                            className="text-sm text-primary hover:text-primary/80 transition-colors"
                        >
                            Forgot?
                        </button>
                    </div>
                    <FormInput type="password" id="password" name="password" />
                    {state?.validationErrors?.map((err, i) =>
                        err.path[0] === "password" &&
                        <div key={i} className="text-red-500 text-sm">{err.message}</div>
                    )}
                </div>
                {state?.serverErrors &&
                    <div className="text-red-500 text-sm">{state.serverErrors.message}</div>
                }
                <FormButton disabled={isPending}>Sign in</FormButton>
            </form>

            <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link href={"/signup"} className="text-primary hover:text-primary/80 transition-colors font-medium">
                        Create one now
                    </Link>
                </p>
            </div>

            <div className="flex justify-center items-center">
                <div className="border-t border-gray-400 grow"></div>
                <div className="text-gray-400">Or</div>
                <div className="border-t border-gray-400 grow"></div>
            </div>

            <Link href={"http://localhost:5001/api/auth/login/google?returnUrl=http://localhost:3000/auth/callback"}>Login with google</Link>
        </>
    )
}