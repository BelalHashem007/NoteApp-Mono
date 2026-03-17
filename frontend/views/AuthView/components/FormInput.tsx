import { cn } from "@/helper/cn"
import { InputHTMLAttributes } from "react"

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
    className?: string
}

export default function FormInput({ className, ...props }: FormInputProps) {
    return (
        <input
            className={cn(
                "w-full h-12 pl-11 bg-input-background border border-border/60 focus-visible:ring-primary/30 focus-visible:border-primary {...classname}",
                className
            )}
            {...props}
        />
    )
}