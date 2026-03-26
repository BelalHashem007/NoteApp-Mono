import { auth } from "@/auth"
import { NextResponse } from "next/server";

const protectedRoutes = ['/dashboard']
const publicRoutes = ['/login', '/signup', '/', '/external-login']

export const proxy = auth((req) => {
    
    const path = req.nextUrl.pathname
    const isLoggedIn = !!req.auth && !req.auth.error;
    const isProtectedRoute = protectedRoutes.includes(path)
    const isPublicRoute = publicRoutes.includes(path)

    if (isProtectedRoute && !isLoggedIn) {
        return NextResponse.redirect(new URL("/login", req.nextUrl));
    }

    if (isPublicRoute && isLoggedIn && !path.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
    }

    return NextResponse.next();
})

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}