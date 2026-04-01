import { Editor } from "@tiptap/react";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";

export async function uploadImage(
  file: File,
  editor: Editor,
  session: Session | null,
  pos?: number,
) {
  if (!session?.accessToken) {
    console.error("No session yet");
    return;
  }
  //show ghost image
  const tempUrl = URL.createObjectURL(file);
  if (pos !== undefined) {
    editor
      .chain()
      .insertContentAt(pos, { type: "image", attrs: { src: tempUrl } })
      .focus()
      .run();
  } else {
    editor.chain().focus().setImage({ src: tempUrl }).run();
  }
  console.log("test");
  console.log("session", session);
  //send to backend
  const formData = new FormData();
  formData.append("file", file);
  try {
    const reponse = await fetch(
      "http://localhost:5001/api/folders/7C06CDD4-74D5-4D81-B5B0-08DE8CFF5A9E/notes/6A74765B-E22A-F111-9400-FC7774D3AB11/upload-image",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: formData,
      },
    );

    const data = await reponse.json();

    //swap ghost for real
    const { state, view } = editor;

    state.doc.descendants((node, nodePos) => {
      if (node.type.name === "image" && node.attrs.src === tempUrl) {
        const transaction = state.tr.setNodeMarkup(nodePos, null, {
          ...node.attrs,
          src: data.data.url,
        });
        view.dispatch(transaction);
      }
    });
  } catch (error) {
    console.error("Upload failed", error);
  } finally {
    URL.revokeObjectURL(tempUrl);
  }
}
