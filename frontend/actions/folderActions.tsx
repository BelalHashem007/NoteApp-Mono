"use server"
import { CreateFolderSchema, UpdateFolderSchema } from "@/lib/zod"
import { ApiError } from "./authActions"
import { requireAuth } from "@/helper/requireAuth"
import { updateTag } from "next/cache"

export async function createFolder(_prevState: unknown ,formData: FormData): Promise<ApiError | undefined> {
    //validate input
    console.log(Object.fromEntries(formData.entries()))
    const validationResult = CreateFolderSchema.safeParse(Object.fromEntries(formData.entries()))
    if (!validationResult.success) {
        console.log(validationResult.error?.issues)
        return { validationErrors: validationResult.error?.issues }
    }

    //check user
    const session = await requireAuth();

    if (!session.user)
        throw new Error("Unauthorized");

    console.log(validationResult.data)
    console.log(session.accessToken)
    //create folder
    try {
        const response = await fetch("http://localhost:5001/api/Folders", {
            method: "POST",
            body: JSON.stringify(validationResult.data),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.accessToken}`
            },
        });
        const body = await response.json();
        console.log(body)
        if (!response.ok)
            return {serverErrors: {  message: body.message}}

        updateTag('folders')
        return {status:"success"}

    } catch (error) {
        console.error("Failed to create folder", error)
        return {serverErrors: {message: "Something went wrong!"}}
    }
}

export async function updateFolder(_prevState: unknown ,formData: FormData): Promise<ApiError | undefined> {
    //validate input
    console.log(Object.fromEntries(formData.entries()))
    const validationResult = UpdateFolderSchema.safeParse(Object.fromEntries(formData.entries()))
    if (!validationResult.success) {
        console.log(validationResult.error?.issues)
        return { validationErrors: validationResult.error?.issues }
    }

    //check user
    const session = await requireAuth();

    if (!session.user)
        throw new Error("Unauthorized");

    console.log(validationResult.data)
    console.log(session.accessToken)
    //update
    try {
        const response = await fetch(`http://localhost:5001/api/Folders/${validationResult.data.id}`, {
            method: "PUT",
            body: JSON.stringify(validationResult.data),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.accessToken}`
            },
        });
        const body = await response.json();
        console.log(body)
        if (!response.ok)
            return {serverErrors: {  message: body.message}}

        updateTag('folders')
        return {status:"success"}

    } catch (error) {
        console.error("Failed to update folder", error)
        return {serverErrors: {message: "Something went wrong!"}}
    }
}

type DeleteObject = {
    id:string
}

export async function deleteFolder(formData: FormData) {

    const data = Object.fromEntries(formData.entries()) as DeleteObject;
    //check user
    const session = await requireAuth();

    if (!session.user)
        throw new Error("Unauthorized");

    //create folder
    try {
        await fetch(`http://localhost:5001/api/Folders/${data.id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.accessToken}`
            },
        });

        updateTag('folders')

    } catch (error) {
        console.error("Failed to delete folder", error)
    }
}