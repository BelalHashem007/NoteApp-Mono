import Image from "next/image";
import Link from "next/link";

import ThemeToggle from "@/components/ThemeToggle";

const navLinks = [
  { label: "Live Demo", href: "#live-demo" },
  { label: "Features", href: "#features" },
  { label: "Technical", href: "#technical-highlights" },
];

export default function NavComponent() {
  return (
    <header className="w-full px-4 py-4">
      <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-xl border border-border bg-background/95 px-5 py-3 shadow-sm backdrop-blur dark:bg-card/95">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-foreground"
        >
          NoteFlow
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="#"
            aria-label="View code on GitHub"
            className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Image
              src="/GitHub_Invertocat_Black.png"
              alt=""
              width={22}
              height={22}
              className="dark:hidden"
            />
            <Image
              src="/GitHub_Invertocat_White.png"
              alt=""
              width={22}
              height={22}
              className="hidden dark:block"
            />
          </Link>

          <ThemeToggle />

          <Link
            href="/login"
            className="rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background transition-colors hover:bg-foreground/85"
          >
            Log in
          </Link>
        </div>
      </nav>
    </header>
  );
}
