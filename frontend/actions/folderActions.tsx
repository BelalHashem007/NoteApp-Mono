"use server"
import { createFolderSchema } from "@/lib/zod"
import { ApiError } from "./authActions"
import { requireAuth } from "@/helper/requireAuth"
import { revalidatePath } from "next/cache"

export async function createFolder(_prevState: unknown ,formData: FormData): Promise<ApiError | undefined> {
    //validate input
    console.log(formData)
    const validationResult = createFolderSchema.safeParse(Object.fromEntries(formData.entries()))
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

        revalidatePath("/dashboard");
        return {status:"success"}

    } catch (error) {
        console.error("Failed to create folder", error)
        return {serverErrors: {message: "Something went wrong!"}}
    }
}