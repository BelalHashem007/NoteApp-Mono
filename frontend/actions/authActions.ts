"use server";
import { $ZodIssue } from "zod/v4/core";
import { SignUpSchema, LoginSchema } from "@/lib/zod";
import { signIn, signOut } from "@/auth";
import { AuthError, User } from "next-auth";
import { JWT } from "next-auth/jwt";

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
  } else {
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
  } else {
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
  console.log("iam in refreshaccesstoken");
  try {
    const result = await fetch("http://localhost:5001/api/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken: token.refreshToken }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (result.ok) {
      const body = await result.json();
      const data = body.data;
      const setCookieHeader = result.headers.get("set-cookie") ?? "";
      const rawToken = setCookieHeader.includes("=")
        ? setCookieHeader.substring(
            setCookieHeader.indexOf("=") + 1,
            setCookieHeader.indexOf(";"),
          )
        : "";
      const accessTokenExpires = data?.accessTokenExpirationDate;

      return {
        ...token,
        accessToken: data?.accessToken ?? token.accessToken,
        refreshToken: rawToken
          ? decodeURIComponent(rawToken)
          : token.refreshToken,
        accessTokenExpires,
      };
    } else {
      const body = await result.json();
      console.error("Error getting new refresh token", body);
      token.error = "RefreshTokenError";
      return token;
    }
  } catch (error) {
    console.error("Error refreshing access_token", error);
    token.error = "RefreshTokenError";
    return token;
  }
}

export async function loginExternal(req: Request): Promise<User | null> {
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
