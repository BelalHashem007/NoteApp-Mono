import { auth } from "@/auth";

export default async function UserProfile() {
    const session =  await auth();
    console.log(session)
    return (
        <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary to-accent flex items-center justify-center text-white">
                    AJ
                </div>
                <div className="flex-1 min-w-0">
                    <div className="truncate">{session?.user?.email ?? "Alex Johnson"}</div>
                    <div className="text-xs text-muted-foreground">Pro Plan</div>
                </div>
            </div>
        </div>
    )
}