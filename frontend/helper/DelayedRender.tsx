"use client";
import { useState, useEffect, ReactNode } from "react";

export function DelayedRender({ children, delay = 300 }: { children: ReactNode, delay?: number }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return show ? <>{children}</> : null;
}