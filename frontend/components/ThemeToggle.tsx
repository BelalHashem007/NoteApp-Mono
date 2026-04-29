"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/app/providers";
import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  className?: string;
};

export default function ThemeToggle({ className }: ThemeToggleProps) {
  const [theme, setTheme] = useTheme();
  const isDark = theme === "dark";
  const title = isDark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <label
      className={cn(
        "relative inline-block h-6 w-15 shrink-0 focus:outline outline-neutral-600",
        className,
      )}
      title={title}
    >
      <input
        type="checkbox"
        aria-label={title}
        className="peer sr-only"
        checked={isDark}
        onChange={(e) => {
          setTheme(e.target.checked ? "dark" : "light");
        }}
      />
      <span
        className={cn(
          "absolute inset-0 overflow-hidden rounded-full border bg-neutral-200 duration-400 transition-colors",
          "peer-checked:bg-neutral-700 peer-focus-visible:ring-1 peer-focus-visible:ring-neutral-600 peer-focus-visible:ring-offset-1",
          isDark ? "border-neutral-600" : "border-neutral-400",
        )}
      >
        <span
          className={cn(
            "absolute inset-0 w-6 rounded-full bg-white duration-400 transition-all",
            isDark && "translate-x-9 bg-neutral-950",
          )}
        >
          {isDark ? (
            <Moon className="absolute left-1 top-1 size-3.5 text-white" />
          ) : (
            <Sun className="absolute left-1 top-1 size-3.5 text-neutral-700" />
          )}
        </span>
      </span>
    </label>
  );
}
