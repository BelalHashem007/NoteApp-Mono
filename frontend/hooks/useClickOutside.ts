import { useEffect, useRef } from "react";

export function useClickOutside(callback: () => void) {
  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (!elementRef.current?.contains(e.target as Node)) callback();
    };

    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  });

  return elementRef;
}
