import { useQuery } from "@tanstack/react-query";
import { Spade, Dices, Trophy, Video, Gamepad2, Target, Rocket, Ticket, Grid3X3 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CategoryCard } from "@/components/games/CategoryCard";
import { Skeleton } from "@/components/ui/skeleton";
import apiClient, { mapCategory } from "@/lib/api";

const slugToIcon: Record<string, LucideIcon> = {
  cards: Spade,
  casino: Dices,
  sports: Trophy,
  "live-casino": Video,
  live: Video,
  casual: Gamepad2,
  fantasy: Target,
  crash: Rocket,
  lottery: Ticket,
};

const slugToColor = (slug: string): "cyan" | "purple" | "gold" | "green" | "red" | "pink" => {
  const map: Record<string, "cyan" | "purple" | "gold" | "green" | "red" | "pink"> = {
    cards: "cyan",
    casino: "purple",
    sports: "green",
    "live-casino": "red",
    live: "red",
    casual: "gold",
    fantasy: "pink",
    crash: "cyan",
    lottery: "gold",
  };
  return map[slug] ?? "cyan";
};

export function GameCategories() {
  const { data: categoriesRaw = [], isLoading } = useQuery({
    queryKey: ["gameCategories"],
    queryFn: () => apiClient.getGameCategories(),
  });

  const categories = (categoriesRaw as any[]).map((c) => {
    const mapped = mapCategory(c);
    return {
      ...mapped,
      icon: slugToIcon[mapped.slug] ?? Grid3X3,
      color: slugToColor(mapped.slug),
    };
  });

  if (isLoading) {
    return (
      <section className="py-16 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-9 w-64 mx-auto mb-3" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category) => (
            <CategoryCard key={category.id} {...category} />
          ))}
        </div>
      </div>
    </section>
  );
}
