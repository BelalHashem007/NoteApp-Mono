"use client";
import {
  environmentManager,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

type Theme = [string, (a: string) => void] | null;

const ThemeContext = createContext<Theme>(null);

function getQueryClient() {
  if (environmentManager.isServer()) {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("Failed to get theme context");
  return context;
};

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const [theme, setTheme] = useState<string | undefined>();

  //get theme either from localstorage or users preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const handleInitialTheme = (mediaQuery: MediaQueryList) => {
      if (savedTheme) setTheme(savedTheme);
      else {
        const newTheme = mediaQuery.matches ? "dark" : "light";
        setTheme(newTheme);
      }
    };

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    handleInitialTheme(mediaQuery);

    const handleMediaQueryChanges = (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? "dark" : "light";
      setTheme(newTheme);
    };

    mediaQuery.addEventListener("change", handleMediaQueryChanges);

    return () =>
      mediaQuery.removeEventListener("change", handleMediaQueryChanges);
  }, []);

  //everytime theme changes update html element + set theme in storage
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    if (theme) localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <ThemeContext value={[theme ? theme : "light", setTheme]}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      <Toaster
        toastOptions={{
          duration: 5000,
          success: {
            iconTheme: {
              primary: theme === "dark" ? "green" : "",
              secondary: theme === "dark" ? "lab(15.204 0 0)" : "",
            },
          },
          style: {
            background: theme === "dark" ? "lab(15.204 0 0)" : "",
            color: theme === "dark" ? "white" : "",
          },
        }}
      />
    </ThemeContext>
  );
}
