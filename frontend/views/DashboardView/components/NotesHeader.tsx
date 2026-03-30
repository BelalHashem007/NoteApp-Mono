'use client'

import NotesHeaderSkeleton from "@/components/placeholders/NotesHeaderSkeleton";
import { DelayedRender } from "@/helper/DelayedRender";
import { useFetchWrapperClient } from "@/helper/fetchWrapperClient";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation"
import { useMemo } from "react";
import useSWR from "swr";

export default function NotesHeader({ notes }: { notes: Note[] }) {
    const { status } = useSession();
    const pathname = usePathname();

    const folderId = useMemo(() => {
        const segments = pathname.split("/").filter(Boolean);
        return segments.length > 1 ? segments[1] : null;
    }, [pathname]);

    const fetchClient = useFetchWrapperClient();

    const shouldFetch = folderId && status !== 'loading';

    const { data, isLoading } = useSWR(
        shouldFetch ? `http://localhost:5001/api/folders/${folderId}` : null,
        fetchClient
    );

    if (!folderId) return null;

    if (isLoading) return (
        <DelayedRender>
            <NotesHeaderSkeleton />
        </DelayedRender>
    );
    const folder = data ? data.data as Folder : null

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