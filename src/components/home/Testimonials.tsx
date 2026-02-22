import { Quote, Trophy } from "lucide-react";
import { testimonials as defaultTestimonials, recentWins as defaultRecentWins } from "@/data/homePageMockData";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import type { TestimonialShape, RecentWinShape } from "@/data/homePageMockData";

interface TestimonialsProps {
  testimonials?: TestimonialShape[] | null;
  recentWins?: RecentWinShape[] | null;
}

export function Testimonials({ testimonials: testimonialsProp, recentWins: recentWinsProp }: TestimonialsProps) {
  const testimonials = testimonialsProp && testimonialsProp.length > 0 ? testimonialsProp : defaultTestimonials;
  const recentWins = recentWinsProp && recentWinsProp.length > 0 ? recentWinsProp : defaultRecentWins;

  return (
    <section className="container px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <Quote className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Player Stories</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {testimonials.map((t) => (
              <Card key={t.id ?? t.name} className="glass border-white/10 overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    {typeof t.avatar === "string" && (t.avatar.startsWith("http") || t.avatar.startsWith("/")) ? (
                      <img src={t.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center font-semibold text-sm text-primary">
                        {t.avatar ?? t.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-sm text-foreground">{t.name}</p>
                      {t.location && <p className="text-xs text-muted-foreground">{t.location}</p>}
                    </div>
                    <div className="flex text-amber-400 ml-auto">
                      {Array.from({ length: t.rating ?? 5 }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed italic">&ldquo;{t.message}&rdquo;</p>
                  <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t.game}</span>
                    <span className="text-primary font-semibold">{t.amount ?? "—"}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="h-6 w-6 text-amber-400" />
            <h2 className="text-xl font-bold text-foreground">Live Wins</h2>
          </div>
          <Card className="glass border-white/10">
            <CardContent className="p-0">
              <ul className="divide-y divide-white/10">
                {recentWins.map((w, i) => (
                  <li key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                      {w.user.slice(0, 1)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{w.user}</p>
                      <p className="text-xs text-muted-foreground truncate">{w.game}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-green-500">{w.amount}</p>
                      <p className="text-[10px] text-muted-foreground">{w.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
