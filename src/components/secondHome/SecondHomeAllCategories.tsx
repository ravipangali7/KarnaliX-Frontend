import { Link } from "react-router-dom";
import type { GameCategory } from "@/api/games";
import { svgToImgSrc } from "@/lib/svg";
import { getMediaUrl } from "@/lib/api";
import { LayoutGrid } from "lucide-react";

interface SecondHomeAllCategoriesProps {
  categories: GameCategory[];
  sectionTitle?: string;
  sectionSvg?: string;
}

function CategoryIcon({ svg, name }: { svg?: string; name: string }) {
  if (!svg?.trim()) {
    return (
      <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
        <LayoutGrid className="h-5 w-5 text-muted-foreground" />
      </div>
    );
  }
  const src = svg.trim().startsWith("<svg") ? svgToImgSrc(svg.trim()) : getMediaUrl(svg.trim());
  return (
    <img src={src} alt={name} className="h-10 w-10 rounded-xl object-contain flex-shrink-0 bg-white/5 border border-white/10 p-1" />
  );
}

export function SecondHomeAllCategories({ categories, sectionTitle, sectionSvg }: SecondHomeAllCategoriesProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="container px-4 py-6">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-4">
        {sectionSvg ? (
          <img src={svgToImgSrc(sectionSvg)} alt="" className="h-5 w-5 object-contain" />
        ) : (
          <LayoutGrid className="h-5 w-5 text-primary" />
        )}
        <h2 className="font-display font-bold text-lg text-foreground">
          {sectionTitle || "All Categories"}
        </h2>
      </div>

      {/* Horizontal scroll */}
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4" style={{ WebkitOverflowScrolling: "touch" }}>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/games?category=${cat.id}`}
            className="flex flex-col items-center gap-2 flex-shrink-0 group"
          >
            <div className="h-14 w-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center overflow-hidden group-hover:border-primary/40 group-hover:bg-white/[0.07] transition-colors">
              <CategoryIcon svg={cat.svg} name={cat.name} />
            </div>
            <span className="text-[11px] text-muted-foreground font-medium group-hover:text-foreground transition-colors text-center max-w-[64px] leading-tight line-clamp-2">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
