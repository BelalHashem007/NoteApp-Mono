import Link from "next/link"
import Logo from "@/public/logo.png"
import Image from "next/image"
import { Mail, Lock } from "lucide-react"

export default function LoginForm(){
    return (
        <div className="w-full flex lg:w-1/2 items-center justify-center p-6 sm:p-12">
            <div className="w-full max-w-md">
                <div className="lg:hidden flex items-center gap-3 mb-8">
                    <Image src={Logo} className="w-20 h-20" alt="Note Flow Logo" />
                    <h1 className="text-2xl">NoteFlow</h1>
                </div>
                <div className="mb-8">
                    <h2 className="text-3xl mb-2">Welcome back</h2>
                    <p className="text-[#8a8a8a]">Enter your credentials to access your notes</p>
                </div>
                <form action="" className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                className="w-full h-12 pl-11 bg-input-background border border-border/60 focus-visible:ring-primary/30 focus-visible:border-primary"
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="text-sm">Password</label>
                            <button
                                type="button"
                                className="text-sm text-primary hover:text-primary/80 transition-colors"
                            >
                                Forgot?
                            </button>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                className="w-full h-12 pl-11 bg-input-background border border-border/60 focus-visible:ring-primary/30 focus-visible:border-primary"
                                required
                            />
                        </div>
                    </div>
                    <button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground">Sign in</button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link href={"/signup"} className="text-primary hover:text-primary/80 transition-colors font-medium">
                            Create one now
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}