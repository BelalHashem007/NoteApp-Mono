import Skeleton from "react-loading-skeleton";

export default function FolderComponentSkeleton() {
    return (
        <div className="grow flex flex-col gap-5 p-4">
            <div className="h-9">
                <Skeleton height={36}/>
            </div>
            <div className="flex-1  overflow-y-auto">
                <Skeleton count={5} height={45}/>
            </div>
        </div>
    )
}