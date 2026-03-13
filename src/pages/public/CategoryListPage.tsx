import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/api/games";
import type { GameCategory } from "@/api/games";
import { getMediaUrl } from "@/lib/api";
import { svgToImgSrc } from "@/lib/svg";
import { LayoutGrid } from "lucide-react";

const IRREGULAR_SHAPE = "60% 40% 50% 50% / 50% 60% 40% 50%";

function categoryIconSrc(cat: GameCategory): string | null {
  const icon = cat.icon?.trim();
  if (icon) return icon.startsWith("http") ? icon : getMediaUrl(icon);
  const svg = cat.svg?.trim();
  if (svg) return svg.startsWith("<svg") ? svgToImgSrc(svg) : getMediaUrl(svg);
  return null;
}

function CategoryIcon({ cat, name }: { cat: GameCategory; name: string }) {
  const src = categoryIconSrc(cat);
  if (!src) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <LayoutGrid className="h-8 w-8 text-muted-foreground" />
      </div>
    );
  }
  return <img src={src} alt={name} className="h-full w-full object-cover" />;
}

const CategoryListPage = () => {
  const { data: categories = [], isLoading, isError } = useQuery({ queryKey: ["categories"], queryFn: getCategories });

  return (
    <div className="container px-2 mobile:px-4 py-4 mobile:py-6 space-y-4 min-w-0 max-w-full">
      <div className="min-w-0">
        <h1 className="font-gaming font-bold text-xl mobile:text-2xl neon-text tracking-wide truncate">GAME CATEGORIES</h1>
        <p className="text-xs mobile:text-sm text-muted-foreground mt-1 truncate">Browse games by category</p>
      </div>

      {isLoading && <p className="text-center text-muted-foreground py-8 text-sm">Loading categories…</p>}
      {isError && !isLoading && <p className="text-center text-muted-foreground py-8 text-sm">Could not load categories.</p>}

      {!isLoading && !isError && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 mobile:gap-4 min-w-0">
          {(categories as GameCategory[]).map((cat) => (
            <Link
              key={cat.id}
              to={`/categories/${cat.id}`}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-card/80 hover:border-primary/40 hover:bg-card transition-all min-h-[120px] justify-center"
            >
              <div className="h-14 w-14 flex items-center justify-center overflow-hidden" style={{ borderRadius: IRREGULAR_SHAPE }}>
                <CategoryIcon cat={cat} name={cat.name} />
              </div>
              <span className="text-sm font-medium text-center truncate w-full">{cat.name}</span>
            </Link>
          ))}
        </div>
      )}

      {!isLoading && !isError && categories.length === 0 && (
        <p className="text-center text-muted-foreground py-12 text-sm">No categories found</p>
      )}
    </div>
  );
};

export default CategoryListPage;
