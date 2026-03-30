import Skeleton from "react-loading-skeleton";

export default function NotesHeaderSkeleton() {
    return (
        <>
            <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
                <span>All Files</span>
                <span>/</span>
                {<span className="text-foreground capitalize"><Skeleton width={50} height={15}/></span>}
            </div>

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl mb-1 capitalize"><Skeleton width={100} height={30}/></h1>
                    <p className="text-sm text-muted-foreground"><Skeleton width={100} height={25}/></p>
                </div>
                <div className="flex items-center gap-2">
                   <Skeleton width={70} height={15}/>
                </div>
            </div>

        </>
    )
}