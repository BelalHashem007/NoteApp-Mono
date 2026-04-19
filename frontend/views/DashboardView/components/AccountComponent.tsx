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
import { cn } from "@/lib/utils";

type AccountComponentProps = {
  triggerClassName?: string;
};

export default function AccountComponent({
  triggerClassName,
}: AccountComponentProps) {
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
          className={cn(
            "flex size-10 items-center justify-center rounded-full transition-colors text-muted-foreground hover:text-foreground",
            triggerClassName,
          )}
          title="Account"
        >
          <User className="size-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        side="right"
        className="flex flex-col gap-0.5"
      >
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
          className="flex w-full focus:ring-0 focus:bg-transparent focus:text-transparent dark:focus:bg-transparent"
        >
          <label
            className="relative inline-block h-6 w-15"
            title={
              theme === "light"
                ? "Switch to dark theme"
                : "Switch to light theme"
            }
          >
            <input
              type="checkbox"
              className="peer h-0 w-0 opacity-0"
              checked={theme === "dark"}
              onChange={(e) => {
                setTheme(e.target.checked ? "dark" : "light");
              }}
            />
            <span
              className={`absolute inset-0 cursor-pointer rounded-full border duration-400 ${theme === "dark" ? "border-neutral-600" : "border-neutral-400"} overflow-hidden bg-neutral-200 peer-checked:bg-neutral-700 peer-focus:shadow-[0_0_1px_#2196F3]`}
            >
              <span
                className={`absolute inset-0 w-6 rounded-full bg-[white] duration-400 transition-all ${theme === "dark" && "translate-x-9 bg-neutral-950"}`}
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
        <DropdownMenuItem
          variant="destructive"
          className="flex w-full cursor-pointer items-center gap-3 rounded-full px-3 py-2 text-sm text-foreground/70 transition-colors hover:bg-background hover:text-foreground"
          onSelect={onLogout}
        >
          <LogOut className="size-4" />
          Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
