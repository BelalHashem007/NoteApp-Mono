import Logo from "@/public/logo.png"
import Image from "next/image"

export default function LogoHeader() {
    return (
        <div className="lg:hidden flex items-center gap-3 mb-8">
            <Image src={Logo} className="w-20 h-20" alt="Note Flow Logo" />
            <h1 className="text-2xl">NoteFlow</h1>
        </div>
    )
}