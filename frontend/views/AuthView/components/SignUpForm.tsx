import FormInput from "../components/FormInput";
import LogoHeader from "../components/LogoHeader";
import FormButton from "../components/FormButton";
import Link from "next/link";

export default function SignUpForm() {
    return (
        <div className="w-full lg:w-1/2 flex justify-center items-center">
            <div className="w-full max-w-md">
                <LogoHeader />
                <div className="mb-8">
                    <h2 className="text-3xl mb-2">Create an account</h2>
                    <p className="text-muted-foreground">Sign up to start organizing your notes</p>
                </div>
                <form action="" className="space-y-5">

                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm">Full Name</label>
                        <FormInput type="text" id="name" />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm">Email Address</label>
                        <FormInput type="email" id="email" />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm">Password</label>
                        <FormInput type="password" id="password" />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="confirmPassword" className="text-sm">Confirm Password</label>
                        <FormInput type="password" id="confirmPassword" />
                    </div>

                    <FormButton>Create Account</FormButton>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/login" className="text-primary hover:text-primary/80 transition-colors font-medium">
                            Sign in
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    )
}