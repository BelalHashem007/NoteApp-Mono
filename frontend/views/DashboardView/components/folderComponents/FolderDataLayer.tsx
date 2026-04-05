import { fetchWrapperServerSide } from "@/lib/fetchWrapper";
import FoldersComponent from "./FoldersComponent";

export default async function FolderDataLayer() {
  const res = await fetchWrapperServerSide(
    "http://localhost:5001/api/folders/getAllItems",
    {
      next: { tags: ["foldersWithNotes"] },
    },
  );

  const folders = (await res?.json()).data as FolderWithNotes[];

  return <FoldersComponent folders={folders} />;
}
