import Link from "next/link";

export default function FooterSection() {
  return (
    <footer className="border-t border-border px-4 py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
        <p className="font-semibold text-foreground">NoteFlow</p>

        <p>
          Made with ❤️ by{" "}
          <Link
            href="#"
            className="font-medium text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            Belal Hashem
          </Link>
        </p>
      </div>
    </footer>
  );
}
