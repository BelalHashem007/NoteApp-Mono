import { auth } from "@/auth";
import { redirect } from "next/navigation";


export async function requireAuth(){
    const session = await auth();

    if (!session || session.error === "RefreshTokenError")
        return redirect("/login?forceLogout=true");
    
    return session;
}