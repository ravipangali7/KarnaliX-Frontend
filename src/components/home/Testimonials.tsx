import { useState, useEffect } from "react";
import { Star, Trophy, Quote, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import apiClient from "@/lib/api";

interface Testimonial {
  id: number;
  name: string;
  avatar: string;
  location: string;
  game: string;
  amount: string;
  message: string;
  rating: number;
}

interface LiveWin {
  user: string;
  game: string;
  amount: string;
  time: string;
}

// Fallback data in case API returns empty
const fallbackTestimonials: Testimonial[] = [
  {
    id: 1,
    name: "Rajesh K.",
    avatar: "RK",
    location: "Kathmandu",
    game: "Aviator",
    amount: "₹2,50,000",
    message: "Won big on Aviator! The platform is super smooth and withdrawals are instant. Best gaming site in Nepal!",
    rating: 5,
  },
  {
    id: 2,
    name: "Priya S.",
    avatar: "PS",
    location: "Pokhara",
    game: "Teen Patti",
    amount: "₹1,80,000",
    message: "Love playing Teen Patti here. The live dealers are professional and the experience is amazing!",
    rating: 5,
  },
  {
    id: 3,
    name: "Amit G.",
    avatar: "AG",
    location: "Biratnagar",
    game: "Cricket Betting",
    amount: "₹5,00,000",
    message: "IPL betting made me rich! Best odds I've found anywhere. Customer support is also very helpful.",
    rating: 5,
  },
  {
    id: 4,
    name: "Sita M.",
    avatar: "SM",
    location: "Lalitpur",
    game: "Rummy",
    amount: "₹95,000",
    message: "Daily tournaments with great prizes. I've been playing here for 6 months and never had any issues.",
    rating: 4,
  },
];

const fallbackLiveWins: LiveWin[] = [
  { user: "Ra***sh", game: "Aviator", amount: "₹45,000", time: "2 min ago" },
  { user: "Pr***ya", game: "Lightning Roulette", amount: "₹1,20,000", time: "5 min ago" },
  { user: "Am***it", game: "Teen Patti", amount: "₹28,000", time: "8 min ago" },
  { user: "Su***sh", game: "Sweet Bonanza", amount: "₹65,000", time: "12 min ago" },
  { user: "An***ta", game: "Blackjack", amount: "₹2,50,000", time: "15 min ago" },
  { user: "Bi***al", game: "Crazy Time", amount: "₹85,000", time: "18 min ago" },
];

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [liveWins, setLiveWins] = useState<LiveWin[]>([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);
  const [loadingWins, setLoadingWins] = useState(true);

  useEffect(() => {
    fetchTestimonials();
    fetchLiveWins();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const data = await apiClient.getTestimonials();
      setTestimonials(data.length > 0 ? data : fallbackTestimonials);
    } catch (error) {
      console.error("Failed to fetch testimonials:", error);
      setTestimonials(fallbackTestimonials);
    } finally {
      setLoadingTestimonials(false);
    }
  };

  const fetchLiveWins = async () => {
    try {
      const data = await apiClient.getLiveWins();
      setLiveWins(data.length > 0 ? data : fallbackLiveWins);
    } catch (error) {
      console.error("Failed to fetch live wins:", error);
      setLiveWins(fallbackLiveWins);
    } finally {
      setLoadingWins(false);
    }
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Testimonials */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                <Quote className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">Player Stories</h2>
                <p className="text-muted-foreground text-sm">Hear from our winners</p>
              </div>
            </div>

            {loadingTestimonials ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-48 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {testimonials.map((testimonial) => (
                  <div key={testimonial.id} className="glass rounded-xl p-5 hover:glow-gold transition-all duration-300">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold">
                        {testimonial.avatar}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                        <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                      </div>
                      <div className="flex">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-accent fill-current" />
                        ))}
                      </div>
                    </div>

                    {/* Message */}
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">"{testimonial.message}"</p>

                    {/* Win Info */}
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <span className="text-xs text-muted-foreground">{testimonial.game}</span>
                      <span className="text-sm font-bold gradient-text-gold">{testimonial.amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Wins */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-neon-green/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-neon-green" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Live Wins</h2>
                <p className="text-muted-foreground text-sm">Real-time winners</p>
              </div>
            </div>

            {loadingWins ? (
              <div className="glass rounded-xl overflow-hidden">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="p-4 border-b border-border last:border-0">
                    <Skeleton className="h-12 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass rounded-xl overflow-hidden">
                {liveWins.map((win, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-4 border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                        {win.user.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{win.user}</p>
                        <p className="text-xs text-muted-foreground">{win.game}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-neon-green">{win.amount}</p>
                      <p className="text-xs text-muted-foreground">{win.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
