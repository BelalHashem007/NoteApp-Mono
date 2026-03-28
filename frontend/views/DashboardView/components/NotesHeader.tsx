'use client'

import { useFetchWrapperClient } from "@/helper/fetchWrapperClient";
import { usePathname } from "next/navigation"
import { useEffect, useState, useMemo } from "react";

export default function NotesHeader({ notes }: { notes: Note[] }) {
    const [folder, setFolder] = useState<Folder | null>(null);
    const pathname = usePathname();
    const folderId = useMemo(() => {
        if (pathname.split("/").length > 1) {
            const segments = pathname.split("/").filter(Boolean); // removes empty strings
            return segments[1];
        }
    }, [pathname]);
    const fetchClient = useFetchWrapperClient();
    useEffect(() => {
        const fetchData = async () => {
            const response = await fetchClient(`http://localhost:5001/api/folders/${folderId}`)
            if (response?.ok) {
                const folderData = (await response.json()).data as Folder
                setFolder(folderData);
            }
        }

        if (pathname.split("/").length > 1) {
            console.log("test")
            fetchData();
        }
    }, [pathname, fetchClient, folderId])

    return (
        <>
            <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
                <span>All Files</span>
                <span>/</span>
                {<span className="text-foreground capitalize">{folder?.folderName}</span>}
            </div>

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl mb-1 capitalize">{folder?.folderName}</h1>
                    <p className="text-sm text-muted-foreground">{notes.length} notes in this folder</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-sm">
                        <span className="text-muted-foreground">≡</span>
                        <span>Last Edited</span>
                    </div>
                </div>
            </div>

        </>
    )
}