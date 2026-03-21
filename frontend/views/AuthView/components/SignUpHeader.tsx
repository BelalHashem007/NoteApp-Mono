import LogoHeader from "./LogoHeader"

export default function SignUpHeader() {
    return (
        <>
            <LogoHeader />
            <div className="mb-8">
                <h2 className="text-3xl mb-2">Create an account</h2>
                <p className="text-muted-foreground">Sign up to start organizing your notes</p>
            </div>
        </>
    )
}