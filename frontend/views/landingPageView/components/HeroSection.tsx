import TipTapDemo from "@/components/tiptap/TipTap-Demo";

export default function HeroSection() {
  return (
    <section
      className="px-4 pb-20 pt-16 sm:pt-20"
      aria-labelledby="Rich Text Editor"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-12">
        <div className="max-w-4xl text-center">
          <h1
            id="hero-title"
            className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            A Rich Text Editor Built for Developers
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
            A note-taking application with VSCode layout featuring a rich text
            editor, search, and structured organization with folders and tags.
          </p>
        </div>

        <div id="live-demo" className="w-full scroll-mt-28">
          <TipTapDemo />
        </div>
      </div>
    </section>
  );
}
