import { Search } from "lucide-react"

export default function FolderSearch(){
    return (
        <div className="p-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Find folder..."
                    className="h-9 pl-9 bg-background border-2 border-border text-sm"
                />
            </div>
        </div>
    )
}