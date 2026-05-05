"use client";
import { LogOut, User } from "lucide-react";
import { useTapsContext } from "@/app/dashboard/providers";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";
import { useUser } from "@/hooks/useUser";
import {
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@radix-ui/react-dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";

type AccountComponentProps = {
  triggerClassName?: string;
};

export default function AccountComponent({
  triggerClassName,
}: AccountComponentProps) {
  const queryClient = useQueryClient();
  const { setOpenedNotes } = useTapsContext();
  const router = useRouter();
  const { user } = useUser();
  console.log(user);

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
      queryClient.clear();
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
        className="flex flex-col gap-0.5 p-2"
      >
        <DropdownMenuGroup>
          {user && (
            <DropdownMenuLabel className="text-xs text-muted-foreground max-w-25 truncate">
              Hello, <strong>{user?.fullName}</strong>
            </DropdownMenuLabel>
          )}
          <DropdownMenuItem
            onSelect={(e) => e.preventDefault()}
            className="flex w-full focus:ring-0 focus:bg-transparent focus:text-transparent dark:focus:bg-transparent"
          >
            <ThemeToggle />
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            className="flex w-full cursor-pointer items-center gap-3 rounded-full text-sm text-foreground/70 transition-colors hover:bg-background hover:text-foreground"
            onSelect={onLogout}
          >
            <LogOut className="size-4" />
            Log Out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
