"use client"
import Image from "next/image"
import { StickyNote } from "lucide-react"
import Illustration from "@/public/RightSideIllustration.jpg"
import { usePathname } from "next/navigation"

export default function IllustrationSide() {
    const path = usePathname();
    const isLogin = path.includes("login");
    const header = isLogin ? "Your Notes, Organized" : "Start Your Journey"
    const solgan = isLogin ? "Keep your thoughts and ideas in one beautiful place" : "Start organizing your notes"

    return (
        <div className="hidden lg:flex lg:w-1/2 bg-secondary relative overflow-hidden items-center justify-center p-12">
            <div className="absolute inset-0">
                <Image
                    src={Illustration}
                    alt="Cozy workspace"
                    className="w-full h-full object-cover opacity-50"
                />
                <div className="absolute inset-0 bg-linear-to-br from-accent/30 to-primary/20" />
            </div>

            <div className="relative z-10 max-w-md text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-6">
                    <StickyNote className="w-10 h-10 text-primary" />
                </div>
                <h1 className="text-4xl mb-4 text-foreground">{header}</h1>
                <p className="text-lg text-foreground/70">
                    {solgan}
                </p>
            </div>
        </div>
    )
}