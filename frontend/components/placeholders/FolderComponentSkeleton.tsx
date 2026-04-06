import { Skeleton } from "../ui/skeleton";

export default function FolderComponentSkeleton() {
  return (
    <div className="flex flex-col  gap-2 overflow-y-auto">
      <Skeleton className="h-7 grow " />
      <Skeleton className="h-7 grow" />
      <Skeleton className="h-7 grow" />
      <Skeleton className="h-7 grow" />
      <Skeleton className="h-7 grow" />
    </div>
  );
}
