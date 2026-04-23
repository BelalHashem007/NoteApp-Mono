import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatIso(iso: string): string {
  const date = new Date(iso);

  const result = date.toLocaleString("en-US", {
    month: "short", // "Mar"
    day: "numeric", // "28"
    hour: "numeric", // "8"
    minute: "2-digit", // "11"
    hour12: true, // "PM"
  });

  return result;
}

export function toMaxAge(dateString: string) {
  return Math.max(
    0,
    Math.floor((new Date(dateString).getTime() - Date.now()) / 1000),
  );
}

export function normalizeUrl(url: string) {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    return parsed.href;
  } catch {
    return null;
  }
}

export const checkImage = (url: string) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};
