import { fetchWrapperServerSide } from "@/helper/fetchWrapper";
import FoldersComponent from "./FoldersComponent";

export default async function FolderDataLayer() {
    const res = await fetchWrapperServerSide("http://localhost:5001/api/folders", {
        next: { tags: ['folders'] }
    });

    const folders = (await res?.json()).data as Folder[];

    return <FoldersComponent folders={folders} />;
}