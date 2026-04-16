import IllustrationSide from "../components/IllustrationSide";
import SignUpForm from "../components/SignUpForm";
import SignUpHeader from "../components/SignUpHeader";

export default function SignUpView() {
  return (
    <div className="min-h-screen w-full flex ">
      <IllustrationSide />
      <div className="w-full lg:w-1/2 flex justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-lg p-6 border rounded-md border-border shadow-sm dark:bg-neutral-900">
          <SignUpHeader />
          <SignUpForm />
        </div>
      </div>
    </div>
  );
}
