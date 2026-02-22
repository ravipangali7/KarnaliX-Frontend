import { useRef } from "react";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { comingSoon as defaultComingSoon } from "@/data/homePageMockData";
import { Button } from "@/components/ui/button";
import type { ComingSoonShape } from "@/data/homePageMockData";

interface ComingSoonProps {
  comingSoon?: ComingSoonShape[] | null;
}

export function ComingSoon({ comingSoon: comingSoonProp }: ComingSoonProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const comingSoon = comingSoonProp && comingSoonProp.length > 0 ? comingSoonProp : defaultComingSoon;

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -280 : 280, behavior: "smooth" });
  };

  return (
    <section className="container px-4 py-10">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Coming Soon</h2>
      </div>
      <div className="relative">
        <Button
          variant="glass"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 -translate-x-2 rounded-full h-10 w-10 hidden md:flex"
          onClick={() => scroll("left")}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button
          variant="glass"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 translate-x-2 rounded-full h-10 w-10 hidden md:flex"
          onClick={() => scroll("right")}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
        <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide snap-x pb-2 -mx-4 px-4">
          {comingSoon.map((item) => (
            <div
              key={item.id ?? item.name}
              className="shrink-0 w-[240px] md:w-[280px] rounded-xl overflow-hidden glass border border-white/10 group"
            >
              <div className="relative aspect-video">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-70" loading="lazy" />
                <div className="absolute inset-0 bg-black/50" />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-amber-500/90 text-black text-xs font-semibold">
                  {item.launchDate ?? "Coming Soon"}
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-sm text-foreground">{item.name}</h3>
                {item.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>}
                <Button variant="outline" size="sm" className="mt-3 w-full">Notify Me</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
