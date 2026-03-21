import IllustrationSide from "../components/IllustrationSide"
import SignUpForm from "../components/SignUpForm"
import SignUpHeader from "../components/SignUpHeader"

export default function SignUpView() {
    return (
        <div className="min-h-screen w-full flex ">
            <IllustrationSide />
            <div className="w-full lg:w-1/2 flex justify-center items-center">
                <div className="w-full max-w-md">
                    <SignUpHeader/>
                    <SignUpForm />
                </div>
            </div>
            
        </div>
    )
}