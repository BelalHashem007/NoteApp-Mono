"use server";
import {
  CreateFolderSchema,
  UpdateFolderSchema,
  CreateNoteSchema,
  UpdateNoteTitleSchema,
} from "@/lib/zod";
import { ActionError } from "./authActions";
import { requireAuth } from "@/lib/utils";
import { updateTag } from "next/cache";

//-----------------------------------------------------------------------
/**********************Folder actions***********************************/
//-----------------------------------------------------------------------

export async function createFolder(folderName: string, parendId?: string) {
  //validate input
  console.log(parendId);

  const validationResult = CreateFolderSchema.safeParse({ folderName });
  if (!validationResult.success) {
    console.log(validationResult.error?.issues);
    throw new Error(validationResult.error?.issues.toString());
  }

  //check user
  const session = await requireAuth();

  if (!session.user) throw new Error("Unauthorized");

  console.log(validationResult.data);
  console.log(session.accessToken);
  //create folder
  try {
    const response = await fetch("http://localhost:5001/api/Folders", {
      method: "POST",
      body: JSON.stringify({
        folderName,
        parentId: parendId ?? null,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    if (!response.ok) throw new Error(await response.json());

    return response.json();
  } catch (error) {
    console.error("Failed to create folder", error);
    throw new Error("Something went wrong!");
  }
}

export async function updateFolder(newFolder: Folder) {
  //validate input
  console.log(newFolder);
  const validationResult = UpdateFolderSchema.safeParse(newFolder);
  if (!validationResult.success) {
    console.log(validationResult.error?.issues);
    throw new Error(validationResult.error?.issues.toString());
  }

  //check user
  const session = await requireAuth();

  if (!session.user) throw new Error("Unauthorized");

  console.log(validationResult.data);
  console.log(session.accessToken);
  //update
  try {
    const response = await fetch(
      `http://localhost:5001/api/Folders/${validationResult.data.id}`,
      {
        method: "PUT",
        body: JSON.stringify({
          folderName: validationResult.data.folderName,
          id: validationResult.data.id,
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

export async function deleteFolder(folderToDelete: Folder) {
  //check user
  const session = await requireAuth();
  console.log(folderToDelete);
  if (!session.user) throw new Error("Unauthorized");

  //delete folder
  try {
    const result = await fetch(
      `http://localhost:5001/api/Folders/${folderToDelete.id}`,
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
    console.error("Failed to delete folder", error);
    throw error;
  }
}

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

  if (!session.user) throw new Error("Unauthorized");

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

  if (!session.user) throw new Error("Unauthorized");
  console.log(session.accessToken);

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

  if (!session.user) throw new Error("Unauthorized");

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
  if (!session.user) throw new Error("Unauthorized");

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
