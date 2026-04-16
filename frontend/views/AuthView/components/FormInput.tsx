import { cn } from "@/lib/utils";
import { InputHTMLAttributes } from "react";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export default function FormInput({ className, ...props }: FormInputProps) {
  return (
    <input
      className={cn(
        "w-full h-12 pl-3 bg-neutral-50 dark:bg-neutral-800 rounded-md focus:outline-0 border border-border dark:border-0 focus:ring dark:focus:ring-neutral-600 focus:ring-primary/30 ",
        className,
      )}
      {...props}
    />
  );
}
