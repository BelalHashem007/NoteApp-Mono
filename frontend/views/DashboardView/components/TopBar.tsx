import {Search, Bell, Grid3x3, Plus} from "lucide-react" 

export default function TopBar() {
    return (
        <div className="h-16 border-b border-border px-6 flex items-center gap-4">
            <div className="flex-1 max-w-2xl">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search across all your notes..."
                        className="h-11 pl-11 bg-muted border-2 border-border/60 w-full"
                    />
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button className="w-10 h-10 rounded-lg hover:bg-muted flex items-center justify-center transition-colors">
                    <Bell className="w-5 h-5 text-foreground/70" />
                </button>
                <button className="w-10 h-10 rounded-lg hover:bg-muted flex items-center justify-center transition-colors">
                    <Grid3x3 className="w-5 h-5 text-foreground/70" />
                </button>
                <button className="px-4 py-2 bg-primary hover:bg-primary/90 flex justify-center items-center rounded-md text-primary-foreground h-10 gap-2">
                    <Plus className="w-4 h-4" />
                    New Note
                </button>
            </div>
        </div>
    )
}