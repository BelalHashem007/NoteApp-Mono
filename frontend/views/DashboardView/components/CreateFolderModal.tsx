"use client"
import { Folder, X } from "lucide-react";
import { createFolder } from "@/actions/folderActions";
import { useTransition,useState } from "react";
import { TailSpin } from "react-loader-spinner";
import { ApiError } from "@/actions/authActions";

interface Props {
    onClose: () => void
}

export default function CreateFolderModal({ onClose }: Props) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<ApiError | null>(null);

    async function handleCreation(formData:FormData){
        setError(null); 

        startTransition(async () => {
            const result = await createFolder(undefined, formData);

            if (result?.serverErrors || result?.validationErrors) {
                setError(result)
            } else {
                onClose();
            }
        });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
            <div
                className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Folder className="w-5 h-5 text-primary" />
                        </div>
                        <h2 className="text-xl">Create New Folder</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
                    >
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>

                {/* Content */}
                <form action={handleCreation}>
                    <div className="p-6">
                        <label htmlFor="folderName" className="block text-sm mb-2 text-muted-foreground">
                            Folder Name
                        </label>
                        <input
                            id="folderName"
                            type="text"
                            name="folderName"
                            placeholder="Enter folder name..."
                            className="w-full h-11 bg-background border-border px-3"
                            maxLength={50}
                            autoFocus
                            required
                        />
                        {error?.validationErrors?.map((err, i) =>
                            err.path[0] === "folderName" &&
                            <div key={i} className="text-red-500 text-sm mt-2">{err.message}</div>
                        )}
                    </div>
                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-muted hover:bg-muted/80 text-foreground h-10 px-6 rounded-md"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={isPending}
                            type="submit"
                            className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-6 gap-2 flex items-center justify-center rounded-md"
                        >
                            
                            {isPending ? <TailSpin width={"30"} height={30} color="#ffffff"/> : <><Folder className="w-4 h-4" /> Create Folder</>}
                        </button>
                    </div>
                </form>
                {error?.serverErrors &&
                    <div className="text-red-500 text-sm">{error.serverErrors.message}</div>
                }
            </div>
        </div>
    );
}