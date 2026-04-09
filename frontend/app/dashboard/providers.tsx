"use client";
import {
  createContext,
  SetStateAction,
  useContext,
  useState,
  useEffect,
} from "react";
import { usePathname, useRouter } from "next/navigation";

export type OpenedNote = {
  slug: string;
  title: string;
};

export type TapsContextType = {
  openedNotes: OpenedNote[];
  setOpenedNotes: React.Dispatch<SetStateAction<OpenedNote[]>>;
};

const OpenedNotesContext = createContext<TapsContextType | undefined>(
  undefined,
);

export const useTapsContext = (): TapsContextType => {
  const context = useContext(OpenedNotesContext);
  if (!context) throw new Error("No context");
  return context;
};

export function TapProvider({ children }: { children: React.ReactNode }) {
  const [openedNotes, setOpenedNotes] = useState<OpenedNote[]>([]);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    const updateState = () => {
      const openNotes = localStorage.getItem("openNotes");
      const parsed = openNotes ? JSON.parse(openNotes) : [];
      if (parsed.length > 0) {
        setOpenedNotes(parsed);
        if (path.split("/").length < 3)
          router.replace(`/dashboard/note/${parsed[0].slug}`);
      }
      setIsInitialized(true);
    };
    updateState();
  }, [router, path]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("openNotes", JSON.stringify(openedNotes));
    }
  }, [openedNotes, isInitialized]);

  return (
    <OpenedNotesContext value={{ openedNotes, setOpenedNotes }}>
      {children}
    </OpenedNotesContext>
  );
}
