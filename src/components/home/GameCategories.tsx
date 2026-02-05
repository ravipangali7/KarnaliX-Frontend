import { useState, useEffect } from "react";
import {
  Dices,
  Trophy,
  Video,
  Gamepad2,
  Rocket,
} from "lucide-react";
import { CategoryCard } from "@/components/games/CategoryCard";
import apiClient from "@/lib/api";
import { SLUG_TO_LABEL } from "@/lib/gameUtils";
import type { LucideIcon } from "lucide-react";

const SLUG_ICON: Record<string, LucideIcon> = {
  crash: Rocket,
  casino: Dices,
  liveCasino: Video,
  sports: Trophy,
  casual: Gamepad2,
};

const SLUG_COLOR: Record<string, "cyan" | "purple" | "gold" | "green" | "red" | "pink"> = {
  crash: "cyan",
  casino: "purple",
  liveCasino: "red",
  sports: "green",
  casual: "gold",
};

function slugToHref(slug: string): string {
  if (slug === "sports") return "/sports";
  return `/games/${slug}`;
}

export function GameCategories() {
  const [categories, setCategories] = useState<{ name: string; icon: LucideIcon; href: string; gameCount: number; color: "cyan" | "purple" | "gold" | "green" | "red" | "pink" }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiClient.getPublicCategories();
        if (cancelled) return;
        const results = data?.results ?? [];
        const mapped = results
          .filter((r: { slug?: string }) => r.slug && SLUG_ICON[r.slug])
          .map((r: { slug: string; label?: string; count?: number }) => ({
            name: r.label ?? SLUG_TO_LABEL[r.slug] ?? r.slug,
            icon: SLUG_ICON[r.slug],
            href: slugToHref(r.slug),
            gameCount: Number(r.count) || 0,
            color: SLUG_COLOR[r.slug] ?? "purple",
          }));
        setCategories(mapped);
      } catch {
        if (!cancelled) setCategories([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="py-16 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Explore <span className="gradient-text">Game Categories</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            From classic card games to thrilling live casino experiences. Find your perfect game.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl h-40 bg-muted/50 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.name} {...category} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
