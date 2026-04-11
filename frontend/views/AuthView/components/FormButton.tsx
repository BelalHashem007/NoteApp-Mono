import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";
import { TailSpin } from "react-loader-spinner";

interface FormButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children: React.ReactNode;
}

export default function FormButton({
  className,
  children,
  ...props
}: FormButtonProps) {
  return (
    <button
      type="submit"
      className={cn(
        "w-full h-12 rounded-full bg-primary hover:bg-primary/90 focus:bg-primary/90 text-primary-foreground flex justify-center items-center disabled:bg-primary/50",
        className,
      )}
      {...props}
    >
      {props.disabled ? (
        <TailSpin width={"30"} height={30} color="#ffffff" />
      ) : (
        children
      )}
    </button>
  );
}
