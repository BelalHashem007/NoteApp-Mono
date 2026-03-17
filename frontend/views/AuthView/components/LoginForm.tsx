import Link from "next/link"
import LogoHeader from "./LogoHeader"
import FormInput from "./FormInput"
import FormButton from "./FormButton"

export default function LoginForm(){
    return (
        <div className="w-full flex lg:w-1/2 items-center justify-center p-6 sm:p-12">
            <div className="w-full max-w-md">
                <LogoHeader/>
                <div className="mb-8">
                    <h2 className="text-3xl mb-2">Welcome back</h2>
                    <p className="text-[#8a8a8a]">Enter your credentials to access your notes</p>
                </div>
                <form action="" className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm">Email Address</label>
                            <FormInput type="email" id="email"/>
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
                            <FormInput type="password" id="password"/>
                    </div>
                    
                    <FormButton>Sign in</FormButton>
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