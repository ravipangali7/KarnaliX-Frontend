import { categories as defaultCategories } from "@/data/homePageMockData";
import { CategoryCard } from "@/components/games/CategoryCard";
import type { CategoryShape } from "@/data/homePageMockData";

interface GameCategoriesProps {
  categories?: CategoryShape[] | null;
}

export function GameCategories({ categories: categoriesProp }: GameCategoriesProps) {
  const categories = categoriesProp && categoriesProp.length > 0 ? categoriesProp : defaultCategories;

  return (
    <section className="container px-4 py-10">
      <h2 className="text-xl font-bold text-foreground mb-2">
        Explore <span className="gradient-text">Game Categories</span>
      </h2>
      <p className="text-sm text-muted-foreground mb-6">Choose your favorite category and start playing</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {categories.map((cat) => (
          <CategoryCard key={cat.slug} {...cat} />
        ))}
      </div>
    </section>
  );
}
