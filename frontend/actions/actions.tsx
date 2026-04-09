"use server";
import { CreateNoteSchema, UpdateNoteTitleSchema } from "@/lib/zod";
import { requireAuth } from "@/lib/dal";

//-----------------------------------------------------------------------
/**********************Note actions***********************************/
//-----------------------------------------------------------------------

export async function createNote(folderId: string, title: string) {
  //validate input
  console.log(folderId, title);

  const validationResult = CreateNoteSchema.safeParse({ title });
  if (!validationResult.success) {
    console.log(validationResult.error?.issues);
    throw new Error(validationResult.error?.issues.toString());
  }

  //check user
  const session = await requireAuth();

  console.log(validationResult.data);
  console.log(session.accessToken);
  //create Note
  const objectToSend = {
    ...validationResult.data,
  };

  console.log(objectToSend);
  try {
    const response = await fetch(
      `http://localhost:5001/api/folders/${folderId}/notes`,
      {
        method: "POST",
        body: JSON.stringify({
          ...validationResult.data,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
      },
    );
    const body = await response.json();
    console.log(body);
    if (!response.ok) throw new Error(await response.json());

    return Promise.resolve();
  } catch (error) {
    console.error("Failed to create folder", error);
    throw new Error("Something went wrong!");
  }
}

export async function updateNoteBody(bodyToUpdate: string, noteId?: string) {
  if (!noteId) throw new Error("no note id is given!!");
  //check user
  const session = await requireAuth();

  const response = await fetch(`http://localhost:5001/api/notes/${noteId}`, {
    method: "PUT",
    body: JSON.stringify({
      body: bodyToUpdate,
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`,
    },
  });
  return response.json();
}

export async function updateNoteTitle(updatedNote: NoteWithoutBody) {
  //validate input
  console.log(updatedNote);
  const validationResult = UpdateNoteTitleSchema.safeParse(updatedNote);
  if (!validationResult.success) {
    console.log(validationResult.error?.issues);
    throw new Error(validationResult.error?.issues.toString());
  }

  //check user
  const session = await requireAuth();

  console.log(validationResult.data);
  console.log(session.accessToken);
  //update
  try {
    const response = await fetch(
      `http://localhost:5001/api/notes/${updatedNote.id}`,
      {
        method: "PUT",
        body: JSON.stringify({
          title: validationResult.data.title,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
      },
    );
    const body = await response.json();
    console.log(body);
    if (!response.ok) throw new Error(body.message);

    return Promise.resolve();
  } catch (error) {
    console.error("Failed to update folder", error);
    throw new Error("Something went wrong!");
  }
}

export async function deleteNote(noteToDelete: NoteWithoutBody) {
  //check user
  const session = await requireAuth();
  console.log(noteToDelete);

  //delete note
  try {
    const result = await fetch(
      `http://localhost:5001/api/notes/${noteToDelete.id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
      },
    );

    if (!result.ok) throw new Error(await result.json());

    if (result.status === 204) return Promise.resolve();

    return result.json();
  } catch (error) {
    console.error("Failed to delete note", error);
    throw error;
  }
}
