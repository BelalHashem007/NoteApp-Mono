import TopBar from "./TopBar"
import NotesGrid from "./NotesGrid"

const notes: Note[] = [
    {
        id: "1",
        title: "Project Alpha...",
        description: "This document outlines the...",
        editedTime: "2H AGO",
        thumbnail: "linear-gradient(135deg, #f5d5b8 0%, #e8b897 100%)",
    },
    {
        id: "2",
        title: "Q4 Budget Planning",
        description: "Detailed breakdown of...",
        editedTime: "5H AGO",
        thumbnail: "linear-gradient(135deg, #a8c9d4 0%, #8bb5c4 100%)",
    },
    {
        id: "3",
        title: "Team Offsite Ideas",
        description: "Potential locations...",
        editedTime: "1D AGO",
        thumbnail: "linear-gradient(135deg, #e8dcc4 0%, #d4c4a8 100%)",
    },
    {
        id: "4",
        title: "Meeting Notes - O...",
        description: "Discussed the new product...",
        editedTime: "2D AGO",
        thumbnail: "linear-gradient(135deg, #f5d5c8 0%, #e8c4b0 100%)",
    },
];

export default function MainContent() {

    return (
        <div className="flex-1 flex flex-col">

            <TopBar />

            <div className="flex-1 overflow-y-auto p-6">
                <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
                    <span>All Files</span>
                    <span>/</span>
                    {/* <span className="text-foreground capitalize">{currentFolder?.name}</span> */}
                </div>

                <div className="mb-6 flex items-center justify-between">
                    <div>
                        {/* <h1 className="text-3xl mb-1 capitalize">{currentFolder?.name}</h1> */}
                        <p className="text-sm text-muted-foreground">{notes.length} notes in this folder</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-sm">
                            <span className="text-muted-foreground">≡</span>
                            <span>Last Edited</span>
                        </div>
                    </div>
                </div>

                <NotesGrid notes={notes} />
            </div>
        </div>
    )
}