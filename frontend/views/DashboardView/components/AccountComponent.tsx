"use client";
import { LogOut, User } from "lucide-react";
import { handleLogout } from "@/actions/authActions";
import { useTapsContext } from "@/app/dashboard/providers";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export default function AccountComponent() {
  const { setOpenedNotes } = useTapsContext();
  const onLogout = async () => {
    localStorage.removeItem("openNotes");
    setOpenedNotes([]);

    await handleLogout();
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors mb-1 ${
            false
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          title="Account"
        >
          <User className="w-5 h-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="right">
        <DropdownMenuItem
          variant="destructive"
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-foreground/70 hover:bg-background hover:text-foreground transition-colors text-sm"
          onSelect={onLogout}
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
