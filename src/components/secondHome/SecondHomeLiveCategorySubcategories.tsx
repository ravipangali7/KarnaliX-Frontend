import { Link } from "react-router-dom";
import { getMediaUrl } from "@/lib/api";
import type { GameSubCategory, GameCategory } from "@/api/games";

interface SecondHomeLiveCategorySubcategoriesProps {
  liveCategory: GameCategory | null;
  subcategories: GameSubCategory[];
}

export function SecondHomeLiveCategorySubcategories({ liveCategory, subcategories }: SecondHomeLiveCategorySubcategoriesProps) {
  if (!liveCategory || !subcategories.length) return null;

  return (
    <section className="border-b border-white/10 bg-card/40 py-4">
      <div className="container px-4">
        <h2 className="font-display font-bold text-lg text-foreground mb-3">{liveCategory.name}</h2>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1" style={{ WebkitOverflowScrolling: "touch" }}>
          {subcategories.map((sub) => {
            const svgVal = sub.svg?.trim();
            const isEmoji = svgVal && !svgVal.startsWith("http") && !svgVal.startsWith("/") && svgVal.length <= 4;
            const iconUrl = svgVal && !isEmoji ? getMediaUrl(svgVal) : undefined;
            return (
              <Link
                key={sub.id}
                to={`/games?category=${liveCategory.id}`}
                className="flex-shrink-0 flex flex-col items-center gap-2 p-3 min-w-[80px] rounded-xl glass border border-white/10 hover:bg-primary/10 hover:border-primary/30 transition-colors"
              >
                <div className="h-10 w-10 rounded-lg bg-muted/50 flex items-center justify-center overflow-hidden">
                  {iconUrl ? (
                    <img src={iconUrl} alt="" className="h-8 w-8 object-contain" />
                  ) : isEmoji ? (
                    <span className="text-2xl">{svgVal}</span>
                  ) : (
                    <span className="text-lg font-bold text-muted-foreground">{sub.name.slice(0, 1)}</span>
                  )}
                </div>
                <span className="text-xs font-medium text-foreground text-center line-clamp-2">{sub.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
