import LoginForm from "../components/LoginForm";
import IllustrationSide from "../components/IllustrationSide";
import LoginHeader from "../components/LoginHeader";

export default function LoginView() {
  return (
    <div className="min-h-screen w-full flex">
      <IllustrationSide />
      <div className="w-full flex lg:w-1/2 items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-lg p-6 border rounded-md border-border shadow-sm dark:bg-neutral-900">
          <LoginHeader />
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
