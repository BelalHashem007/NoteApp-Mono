"use client";
import FormInput from "../components/FormInput";
import FormButton from "../components/FormButton";
import Link from "next/link";
import { createAccount } from "@/actions/authActions";
import { useActionState } from "react";

export default function SignUpForm() {
  const [state, formAction, isPending] = useActionState(createAccount, null);
  return (
    <>
      <form action={formAction} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm">
            Full Name
          </label>
          <FormInput type="text" id="name" name="fullname" />
          {state?.validationErrors?.map(
            (err, i) =>
              err.path[0] === "fullname" && (
                <div key={i} className="text-red-500 text-sm">
                  {err.message}
                </div>
              ),
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm">
            Email Address
          </label>
          <FormInput type="email" id="email" name="email" />
          {state?.validationErrors?.map(
            (err, i) =>
              err.path[0] === "email" && (
                <div key={i} className="text-red-500 text-sm">
                  {err.message}
                </div>
              ),
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm">
            Password
          </label>
          <FormInput type="password" id="password" name="password" />
          {state?.validationErrors?.map(
            (err, i) =>
              err.path[0] === "password" && (
                <div key={i} className="text-red-500 text-sm">
                  {err.message}
                </div>
              ),
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm">
            Confirm Password
          </label>
          <FormInput
            type="password"
            id="confirmPassword"
            name="confirmPassword"
          />
          {state?.validationErrors?.map(
            (err, i) =>
              err.path[0] === "confirmPassword" && (
                <div key={i} className="text-red-500 text-sm">
                  {err.message}
                </div>
              ),
          )}
        </div>

        {state?.serverErrors && (
          <div className="text-red-500 text-sm">
            {state.serverErrors.message}
          </div>
        )}
        <FormButton disabled={isPending}>Create Account</FormButton>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary hover:text-primary/80 transition-colors underline font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </>
  );
}
