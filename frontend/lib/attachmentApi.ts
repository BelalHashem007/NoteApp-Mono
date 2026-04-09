import { Editor } from "@tiptap/react";
import { fetchWithAuth } from "./fetchWithAuthentication";

export async function uploadImage(
  file: File,
  editor: Editor,
  noteId?: string,
  pos?: number,
) {
  // const { accessToken } = await requireAuth();

  if (!noteId) {
    throw new Error("no note id is given");
  }
  //show ghost image
  const tempUrl = URL.createObjectURL(file);
  if (pos !== undefined) {
    editor
      .chain()
      .insertContentAt(pos, {
        type: "image",
        attrs: { src: tempUrl, alt: file.name },
      })
      .focus()
      .run();
  } else {
    editor.chain().focus().setImage({ src: tempUrl }).run();
  }
  //send to backend
  const formData = new FormData();
  formData.append("file", file);
  try {
    const reponse = await fetchWithAuth(
      `http://localhost:3000/api/notes/${noteId}/upload-image`,
      {
        method: "POST",
        body: formData,
      },
    );

    const data = await reponse.json();

    console.log(data);
    //swap ghost for real
    const { state, view } = editor;

    state.doc.descendants((node, nodePos) => {
      if (node.type.name === "image" && node.attrs.src === tempUrl) {
        const transaction = state.tr.setNodeMarkup(nodePos, null, {
          ...node.attrs,
          src: `/api/attachments/${data.data.attachmentId}`,
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
