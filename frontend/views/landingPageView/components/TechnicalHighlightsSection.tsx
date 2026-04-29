const frontendHighlights = [
  {
    title: "Powerful Writing Experience",
    description:
      "Built on Tiptap with a fully featured editing toolkit, supporting rich formatting, media embeds, and seamless autosave.",
  },
  {
    title: "IDE-Inspired Workspace",
    description:
      "VSCode-like layout with explorer, tabs, and search panels for efficient navigation and multitasking.",
  },
  {
    title: "Intuitive Organization",
    description:
      "Drag-and-drop notes, folders, and tagging system make structuring content fast and flexible.",
  },
  {
    title: "Fast, Accurate Search",
    description:
      "Weighted search across titles and content with tag-based filtering for precise results.",
  },
];

const backendHighlights = [
  {
    title: "Performance-Driven Data Layer",
    description:
      "Combines EF Core, Dapper, and stored procedures to balance developer productivity with high-performance queries where it matters.",
  },
  {
    title: "Robust Authentication System",
    description:
      "Secure JWT + refresh token flow with Google OAuth integration and fine-grained resource authorization.",
  },
  {
    title: "Search-Optimized Editor Pipeline",
    description:
      "Tiptap JSON is parsed into a dedicated searchable column, enabling fast and efficient text-based queries using Full-Text Search from sql.",
  },
  {
    title: "Background Job Processing",
    description:
      "Automated cleanup using Hangfire for revoked tokens and orphaned attachments, keeping the system lean over time.",
  },
];

type Highlight = {
  title: string;
  description: string;
};

function HighlightGroup({
  title,
  highlights,
}: {
  title: string;
  highlights: Highlight[];
}) {
  return (
    <div>
      <h3 className="text-lg font-semibold tracking-tight text-foreground">
        {title}
      </h3>

      <div className="mt-5 divide-y divide-border">
        {highlights.map((highlight) => (
          <article key={highlight.title} className="py-4 first:pt-0 last:pb-0">
            <h4 className="font-semibold text-foreground">{highlight.title}</h4>
            <p className="mt-2 leading-7 text-muted-foreground">
              {highlight.description}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}

export default function TechnicalHighlightsSection() {
  return (
    <section
      className="px-4 py-20"
      aria-labelledby="technical-highlights-title"
      id="technical-highlights"
    >
      <div className="mx-auto max-w-7xl">
        <h2
          id="technical-highlights-title"
          className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
        >
          Technical Highlights
        </h2>

        <div className="mt-8 grid gap-10 border-t border-border pt-8 lg:grid-cols-2 lg:gap-16">
          <HighlightGroup title="Frontend" highlights={frontendHighlights} />
          <HighlightGroup title="Backend" highlights={backendHighlights} />
        </div>
      </div>
    </section>
  );
}
