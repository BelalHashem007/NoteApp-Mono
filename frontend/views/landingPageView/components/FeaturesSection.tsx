import Image from "next/image";
import EditorImg from "@/public/Editor.png";
import VSCodeImg from "@/public/VSCodeLayout.png";
import SearchImg from "@/public/Search.png";
import FoldersAndTagsImg from "@/public/Folders_Tags.png";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const features = [
  {
    title: "Rich Text Editor",
    description:
      "Create polished notes with headings, formatting, lists, links, and editor tools built for focused writing.",
    imageSrc: EditorImg,
    imageAlt: "Rich text editor picture",
  },
  {
    title: "IDE-Inspired Workspace",
    description:
      "Work in a familiar editor-inspired interface with organized panels and a distraction-free writing area.",
    imageSrc: VSCodeImg,
    imageAlt: "VSCode layout feature picture",
  },
  {
    title: "Fast Search",
    description:
      "Find notes quickly across your workspace so important ideas and references stay easy to reach.",
    imageSrc: SearchImg,
    imageAlt: "Fast search feature picture",
  },
  {
    title: "Folders & Tags",
    description:
      "Keep notes structured with folders and tags that make your workspace easier to browse and maintain.",
    imageSrc: FoldersAndTagsImg,
    imageAlt: "Folders and tags feature picture",
  },
];

export default function FeaturesSection() {
  return (
    <section className="px-4 py-20" aria-labelledby="features" id="features">
      <div className="mx-auto max-w-7xl">
        <h2
          id="features-title"
          className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
        >
          Explore Features
        </h2>

        <Carousel
          opts={{
            align: "start",
            dragFree: true,
          }}
          className="mt-8 cursor-grab active:cursor-grabbing"
          aria-label="Feature carousel"
        >
          <CarouselContent className="-ml-6">
            {features.map((feature) => (
              <CarouselItem
                key={feature.title}
                className="pl-6 py-4 sm:basis-1/1 lg:basis-1/2 xl:basis-2/5"
              >
                <Card className="h-full rounded-3xl border-0 ring-0 shadow-sm pointer-events-none">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="leading-6">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="flex h-80 items-center justify-center rounded-2xl bg-muted/70 ">
                      <Image
                        src={feature.imageSrc}
                        alt={feature.imageAlt}
                        className="h-full w-auto opacity-70 dark:invert"
                      />
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}
