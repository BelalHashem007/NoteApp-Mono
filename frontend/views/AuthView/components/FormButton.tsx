import { cn } from "@/helper/cn"
import { ButtonHTMLAttributes } from "react"

interface FormButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    className?: string
    children: React.ReactNode
}

export default function FormButton({ className, children, ...props }: FormButtonProps) {
    return (
        <button type="submit" className={cn(
            "w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground",
            className
        )}
            {...props}
        >
            {children}
        </button>
    )
}