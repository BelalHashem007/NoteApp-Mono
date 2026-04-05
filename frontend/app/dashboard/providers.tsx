"use client";
import {
  createContext,
  SetStateAction,
  useContext,
  useState,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";

type OpenedNote = {
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
  const router = useRouter();

  useEffect(() => {
    const updateState = () => {
      const openNotes = localStorage.getItem("openNotes");
      const parsed = openNotes ? JSON.parse(openNotes) : [];
      if (parsed.length > 0) {
        setOpenedNotes(parsed);
        router.replace(`/dashboard/note/${parsed[0].slug}`);
      }
    };
    updateState();
  }, [router]);

  return (
    <OpenedNotesContext value={{ openedNotes, setOpenedNotes }}>
      {children}
    </OpenedNotesContext>
  );
}
