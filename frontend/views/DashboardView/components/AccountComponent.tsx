"use client";
import { LogOut, User, Sun, Moon } from "lucide-react";
import { useTapsContext } from "@/app/dashboard/providers";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useTheme } from "@/app/providers";

export default function AccountComponent() {
  const [theme, setTheme] = useTheme();
  const { setOpenedNotes } = useTapsContext();
  const router = useRouter();

  const onLogout = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/auth/logout", {
        method: "POST",
      });
      if (!res.ok) {
        return toast.error("Failed to logout");
      }
      localStorage.removeItem("openNotes");
      setOpenedNotes([]);
      router.push("/login");
    } catch (error) {
      toast.error("Failed to logout");
      console.error(error);
    }
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors mb-1 ${
            false
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          title="Account"
        >
          <User className="w-5 h-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        side="right"
        className="flex flex-col gap-0.5"
      >
        <DropdownMenuItem
          variant="destructive"
          className="w-full cursor-pointer flex items-center gap-3 px-3 py-2 rounded-full text-foreground/70 hover:bg-background hover:text-foreground transition-colors text-sm"
          onSelect={onLogout}
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
          className="flex w-full focus:ring-0 focus:bg-transparent focus:text-transparent dark:focus:bg-transparent"
        >
          <label
            className="relative inline-block w-15 h-6 "
            title={
              theme === "light"
                ? "Switch to dark theme"
                : "Switch to light theme"
            }
          >
            <input
              type="checkbox"
              className="opacity-0 w-0 h-0 peer"
              checked={theme === "dark"}
              onChange={(e) => {
                setTheme(e.target.checked ? "dark" : "light");
              }}
            />
            <span
              className={`border ${theme === "dark" ? "border-neutral-600" : "border-neutral-400"} absolute inset-0 bg-neutral-200 rounded-full duration-400 cursor-pointer peer-checked:bg-neutral-700   peer-focus:shadow-[0_0_1px_#2196F3] overflow-hidden`}
            >
              <span
                className={`absolute inset-0 bg-[white] w-6 rounded-full duration-400 transition-all ${theme === "dark" && "translate-x-9 bg-neutral-950"}`}
              >
                {theme === "light" ? (
                  <Sun className="absolute top-1 left-1 size-3.5 text-neutral-700" />
                ) : (
                  <Moon className="absolute top-1 left-1 size-3.5 text-white" />
                )}
              </span>
            </span>
          </label>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
