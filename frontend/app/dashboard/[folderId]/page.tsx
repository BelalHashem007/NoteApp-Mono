import { fetchWrapperServerSide } from "@/helper/fetchWrapper"
import DashboardView from "@/views/DashboardView";

export default async function page({ params }: { params: Promise<{ folderId: string }> }) {
    const { folderId } = await params;
    new Promise(resolve => {
        setTimeout(() => {
            resolve("hello")
        }, 2000);
    })
    const response = await fetchWrapperServerSide(`http://localhost:5001/api/folders/${folderId}/notes`, {
        next: { tags: ['notes'] }
    })
    if (!response?.ok)
        return null;
    const body = await response.json();
    const notes = body.data as Note[];
    console.log(body)
    return (
            <DashboardView notes={notes} />
    )
}