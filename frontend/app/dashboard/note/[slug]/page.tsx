import NoteView from "@/views/DashboardView/NoteView/index";

export default async function page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <NoteView slug={slug} />;
}
