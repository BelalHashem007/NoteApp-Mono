import { MoreVertical, Plus } from "lucide-react"
import { formatIso } from "@/helper/helperFuncs"

export default function NotesGrid({ notes }: { notes: Note[] }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {notes.map((note) => (
                <div
                    key={note.id}
                    className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                >
                    <div
                        className="h-32 w-full"
                    />

                    <div className="p-4">
                        <h3 className="mb-1 truncate">{note.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {note.body}
                        </p>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                                EDITED {formatIso(note.updatedAt)}
                            </span>
                            <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded">
                                <MoreVertical className="w-4 h-4 text-muted-foreground" />
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            <button className="bg-card border-2 border-dashed border-border rounded-xl h-60 flex flex-col items-center justify-center gap-3 hover:border-primary/50 hover:bg-muted/50 transition-colors group">
                <div className="w-12 h-12 rounded-full bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                    <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    Add New Note
                </span>
            </button>
        </div>
    )
}