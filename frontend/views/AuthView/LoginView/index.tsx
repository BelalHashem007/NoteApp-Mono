import LoginForm from "../components/LoginForm"
import IllustrationSide from "../components/IllustrationSide"

export default function LoginView() {
    return (
        <div className="min-h-screen w-full flex">
            {/* LeftSide */}
            <IllustrationSide />
            {/* RightSide */}
            <LoginForm />
        </div>
    )
}