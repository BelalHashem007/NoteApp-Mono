"use server";
import { $ZodIssue } from "zod/v4/core";
import { SignUpSchema, LoginSchema } from "@/lib/zod";
import { cookies } from "next/headers";
import { toMaxAge } from "@/lib/utils";
import { redirect } from "next/navigation";

export type ActionError = {
  validationErrors?: $ZodIssue[];
  serverErrors?: { message: string };
  status?: "running" | "failed" | "success";
  enteredValues?: { email: string };
};

export async function createAccount(
  _prevState: unknown,
  formData: FormData,
): Promise<ActionError | undefined> {
  const data = SignUpSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!data.success) {
    console.log(data.error?.issues);
    return { validationErrors: data.error?.issues };
  }

  let success = false;
  try {
    const response = await fetch("http://localhost:5001/api/Auth/register", {
      method: "POST",
      body: JSON.stringify(data.data),
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok)
      return { serverErrors: { message: "Failed to create account" } };

    const body: ApiResponse<LoginResponse> = await response.json();

    // Set the cookies manually
    const cookieStore = await cookies();

    if (!body.data)
      return { serverErrors: { message: "Failed to create account" } };

    cookieStore.set("accessToken", body.data?.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: toMaxAge(body.data?.accessTokenExpirationDate) - 10,
      path: "/",
    });

    cookieStore.set("refreshToken", body.data?.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: toMaxAge(body.data?.refreshTokenExpiration) - 10,
    });

    success = true;
  } catch (error) {
    console.error(error);
    return { serverErrors: { message: "Something went wrong" } };
  }
  if (success) redirect("dashboard");
}

export async function LoginUser(
  _prevState: unknown,
  formData: FormData,
): Promise<ActionError | undefined> {
  const data = LoginSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!data.success) {
    console.log(data.error?.issues);
    return {
      validationErrors: data.error?.issues,
      enteredValues: { email: formData.get("email")?.toString() ?? "" },
    };
  }
  let success = false;
  try {
    const response = await fetch("http://localhost:5001/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data.data),
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok)
      return { serverErrors: { message: "Invalid credentials" } };

    const body: ApiResponse<LoginResponse> = await response.json();

    // Set the cookies manually
    const cookieStore = await cookies();

    if (!body.data) return { serverErrors: { message: "Invalid credentials" } };

    console.log(body);
    cookieStore.set("accessToken", body.data?.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: toMaxAge(body.data?.accessTokenExpirationDate) - 10,
      path: "/",
    });

    cookieStore.set("refreshToken", body.data?.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: toMaxAge(body.data?.refreshTokenExpiration) - 10,
    });

    success = true;
  } catch (error) {
    console.error(error);
    return { serverErrors: { message: "Something went wrong" } };
  }

  if (success) redirect("dashboard");
}

export async function loginExternal(req: Request) {
  console.log("test");
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return null;

  const response = await fetch("http://localhost:5001/api/auth/refresh", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader ?? "",
    },
  });
  console.log(response);
  if (!response.ok) return null;

  const body = await response.json();
  console.log(body);

  const setCookieHeader = response.headers.getSetCookie?.()?.[0] ?? "";
  const rawToken = setCookieHeader.includes("=")
    ? setCookieHeader.substring(
        setCookieHeader.indexOf("=") + 1,
        setCookieHeader.indexOf(";"),
      )
    : "";
  console.log(rawToken);
  return {
    id: body.data.user.id,
    email: body.data.user.email,
    name: body.data.user.fullName,
    accessToken: body.data.accessToken,
    refreshToken: decodeURIComponent(rawToken),
    accessTokenExpirationDate: body.data.accessTokenExpirationDate,
  };
}
