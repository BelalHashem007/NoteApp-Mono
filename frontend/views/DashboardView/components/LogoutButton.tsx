import { LogOut } from "lucide-react"
import { handleLogout } from "@/actions/authActions"

export default function LogoutButton() {
    return (
        <form action={handleLogout}>
            <button
                type="submit"
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-foreground/70 hover:bg-background hover:text-foreground transition-colors text-sm"
            >
                <LogOut className="w-4 h-4" />
                Log Out
            </button>
        </form>
    )
}