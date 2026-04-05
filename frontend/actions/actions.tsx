"use server";
import {
  CreateFolderSchema,
  UpdateFolderSchema,
  CreateNoteSchema,
} from "@/lib/zod";
import { ActionError } from "./authActions";
import { requireAuth } from "@/lib/utils";
import { updateTag } from "next/cache";

//-----------------------------------------------------------------------
/**********************Folder actions***********************************/
//-----------------------------------------------------------------------

export async function createFolder(
  _prevState: unknown,
  formData: FormData,
): Promise<ActionError | undefined> {
  //validate input
  const data = Object.fromEntries(formData.entries());
  console.log(data);

  const validationResult = CreateFolderSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!validationResult.success) {
    console.log(validationResult.error?.issues);
    return { validationErrors: validationResult.error?.issues };
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
      body: JSON.stringify(
        data.parentId
          ? { ...validationResult.data, parentId: data.parentId }
          : validationResult.data,
      ),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
    });
    const body = await response.json();
    console.log(body);
    if (!response.ok) return { serverErrors: { message: body.message } };

    updateTag("folders");
    return { status: "success" };
  } catch (error) {
    console.error("Failed to create folder", error);
    return { serverErrors: { message: "Something went wrong!" } };
  }
}

export async function updateFolder(
  _prevState: unknown,
  formData: FormData,
): Promise<ActionError | undefined> {
  //validate input
  console.log(Object.fromEntries(formData.entries()));
  const validationResult = UpdateFolderSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!validationResult.success) {
    console.log(validationResult.error?.issues);
    return { validationErrors: validationResult.error?.issues };
  }

  //check user
  const session = await requireAuth();

  if (!session.user) throw new Error("Unauthorized");

  console.log(validationResult.data);
  console.log(session.accessToken);
  //update
  try {
    const response = await fetch(
      `http://localhost:5001/api/Folders/${validationResult.data.folderId}`,
      {
        method: "PUT",
        body: JSON.stringify({
          folderName: validationResult.data.folderName,
          id: validationResult.data.folderId,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
      },
    );
    const body = await response.json();
    console.log(body);
    if (!response.ok) return { serverErrors: { message: body.message } };

    updateTag("folders");
    return { status: "success" };
  } catch (error) {
    console.error("Failed to update folder", error);
    return { serverErrors: { message: "Something went wrong!" } };
  }
}

type DeleteObject = {
  id: string;
};

export async function deleteFolder(formData: FormData) {
  const data = Object.fromEntries(formData.entries()) as DeleteObject;
  //check user
  const session = await requireAuth();
  console.log(data);
  if (!session.user) throw new Error("Unauthorized");

  //create folder
  try {
    await fetch(`http://localhost:5001/api/Folders/${data.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    updateTag("folders");
  } catch (error) {
    console.error("Failed to delete folder", error);
  }
}

//-----------------------------------------------------------------------
/**********************Note actions***********************************/
//-----------------------------------------------------------------------

export async function createNote(
  _prevState: unknown,
  formData: FormData,
): Promise<ActionError | undefined> {
  //validate input
  const data = Object.fromEntries(formData.entries());
  console.log(data);

  const validationResult = CreateNoteSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!validationResult.success) {
    console.log(validationResult.error?.issues);
    return { validationErrors: validationResult.error?.issues };
  }

  //check user
  const session = await requireAuth();

  if (!session.user) throw new Error("Unauthorized");

  console.log(validationResult.data);
  console.log(session.accessToken);
  //create Note
  const objectToSend = {
    ...validationResult.data,
    body: data.body ?? null,
  };

  console.log(objectToSend);
  try {
    const response = await fetch(
      `http://localhost:5001/api/folders/${data.folderId}/notes`,
      {
        method: "POST",
        body: JSON.stringify({
          ...validationResult.data,
          body: data.body ?? null,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
      },
    );
    const body = await response.json();
    console.log(body);
    if (!response.ok) return { serverErrors: { message: body.message } };

    updateTag("foldersWithNotes");
    return { status: "success" };
  } catch (error) {
    console.error("Failed to create folder", error);
    return { serverErrors: { message: "Something went wrong!" } };
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
