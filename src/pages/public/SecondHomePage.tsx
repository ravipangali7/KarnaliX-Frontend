import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { getSiteSetting } from "@/api/site";
import { ChevronDown, Play } from "lucide-react";
import { useState } from "react";

const liveEventTimes = ["10:48", "11:12", "11:20", "11:30", "11:40", "1:10", "1:20", "1:30"];

const otherSports = [
  { name: "Where to Play", count: 0 },
  { name: "Football", count: 90 },
  { name: "Basketball", count: 12 },
  { name: "Tennis", count: 8 },
  { name: "Badminton", count: 5 },
  { name: "Table Tennis", count: 4 },
  { name: "Volleyball", count: 6 },
];

const mockMatches = [
  { sport: "Cricket", team1: "Pakistan", team2: "Sri Lanka", date: "19 Mar 2026", time: "23:00", odds: [1.92, 1.92, 2.1] },
  { sport: "Cricket", team1: "India", team2: "Australia", date: "20 Mar 2026", time: "14:30", odds: [1.7, 1.9, 1.9] },
  { sport: "Soccer", team1: "Team A", team2: "Team B", date: "19 Mar 2026", time: "20:00", odds: [2.0, 3.2, 3.5] },
  { sport: "Tennis", team1: "Player 1", team2: "Player 2", date: "19 Mar 2026", time: "18:00", odds: [1.85, 2.0, 2.1] },
];

const faqItems = [
  { title: "What Makes KarnaliX A Standout Choice For Betting?", content: "KarnaliX offers a wide range of sports and casino games, secure payments, and 24/7 support. Our platform is licensed and committed to responsible gaming." },
  { title: "How To Fund Your KarnaliX Account?", content: "Go to Wallet, choose Deposit, and select your preferred payment method. We support multiple payment options including bank transfer and e-wallets." },
  { title: "Is KarnaliX A Legitimate Platform?", content: "Yes. KarnaliX operates under applicable licenses and uses industry-standard security to protect your data and funds." },
  { title: "How To Predict Sports Results Live And Get Predictions?", content: "Navigate to Live Matches to see ongoing events and odds. Place your bets before the market closes. Live stats and streams may be available for selected events." },
  { title: "Which Bonuses, Rewards, And Promotions Does KarnaliX Offer?", content: "We offer welcome bonuses, referral rewards, cashback, and seasonal promotions. Check the Promotions page for current offers." },
  { title: "What Are The Different Types Of Sports Betting Available?", content: "Pre-match and live betting on sports including cricket, soccer, tennis, and more. We also offer virtual sports and esports." },
  { title: "Why Choose KarnaliX?", content: "Competitive odds, fast withdrawals, a large selection of games and sports, and dedicated customer support." },
  { title: "Stay Safe And Play Smart With Responsible Gambling", content: "Set deposit limits, take breaks, and never chase losses. Use our responsible gaming tools and seek help if needed." },
  { title: "How Quickly And Easily Can I Withdraw My Winnings?", content: "Withdrawal requests are processed within 24–48 hours. Processing time depends on your chosen method. Instant withdrawal may be available for eligible users." },
];

export default function SecondHomePage() {
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const { data: siteSetting } = useQuery({ queryKey: ["siteSetting"], queryFn: getSiteSetting });
  const promoTitle =
    (siteSetting as Record<string, string> | undefined)?.hero_title ??
    "CRICKET CHAMPIONSHIP - T20 WORLD CUP WITNESS BEGINS - THE COUNTDOWN IS OVER";

  return (
    <div className="space-y-0 pb-8">
      {/* Promo Banner */}
      <section className="bg-red-600 text-white">
        <div className="container px-4 py-8 md:py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h2 className="font-bold text-xl md:text-2xl uppercase tracking-wide leading-tight">
                {promoTitle}
              </h2>
              <p className="text-white/90 text-sm mt-2">
                Join now and enjoy live sports betting and casino games.
              </p>
            </div>
            <Link to="/register">
              <Button size="lg" className="bg-white text-red-600 hover:bg-white/90 font-bold px-8 h-12">
                JOIN NOW ON KARNALIX
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Live event timeline */}
      <section className="border-b border-border bg-muted/30 py-2">
        <div className="container px-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {liveEventTimes.map((t) => (
              <button
                key={t}
                type="button"
                className="flex-shrink-0 px-4 py-2 rounded bg-background border border-border text-sm font-medium hover:bg-muted"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Live Matches */}
      <section className="container px-4 py-6">
        <h2 className="font-display font-bold text-xl mb-4">Live Matches</h2>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Other Sports</h3>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {otherSports.map((s) => (
              <div
                key={s.name}
                className="flex-shrink-0 w-20 h-20 rounded-full bg-card border-2 border-primary/30 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
              >
                <span className="text-[10px] font-medium text-center px-1">{s.name}</span>
                {s.count > 0 && (
                  <span className="text-xs font-bold text-primary mt-0.5">{s.count}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {mockMatches.map((m, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-wrap items-center gap-2 md:gap-4 p-3">
                  <Link to="/games">
                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white h-8">
                      <Play className="h-3 w-3 mr-1" />
                      Play
                    </Button>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {m.team1} vs. {m.team2}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {m.date} · {m.time}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-[10px] text-muted-foreground px-2 py-1 rounded bg-muted">
                      Live/Early
                    </span>
                    {m.odds.map((odd, j) => (
                      <span
                        key={j}
                        className={`text-xs font-semibold px-2 py-1 rounded ${
                          j === 0 ? "bg-red-500/20 text-red-600 dark:text-red-400" : "bg-primary/10 text-primary"
                        }`}
                      >
                        {odd}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Discover / FAQ */}
      <section className="container px-4 py-10">
        <h2 className="font-display font-bold text-2xl mb-6">
          Discover the World of KarnaliX – Ultimate Gaming and Predictions Hub
        </h2>
        <div className="space-y-2">
          {faqItems.map((faq) => (
            <Collapsible
              key={faq.title}
              open={openFaq === faq.title}
              onOpenChange={(open) => setOpenFaq(open ? faq.title : null)}
            >
              <Card>
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between p-4 text-left font-medium hover:bg-muted/50 transition-colors rounded-lg"
                  >
                    {faq.title}
                    <ChevronDown
                      className={`h-5 w-5 flex-shrink-0 transition-transform ${
                        openFaq === faq.title ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-4 text-sm text-muted-foreground">{faq.content}</div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </div>
      </section>
    </div>
  );
}
