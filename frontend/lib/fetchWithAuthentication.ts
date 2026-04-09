"use client";

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  let res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      ...options.headers,
    },
  });

  // If expired → refresh
  if (res.status === 401) {
    console.log("iam gonna hit refresh");
    const refreshRes = await fetch("http://localhost:3000/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });
    console.log(refreshRes);
    if (!refreshRes.ok) {
      window.location.href = "login";
    }

    res = await fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        ...options.headers,
      },
    });
  }

  return res;
}
