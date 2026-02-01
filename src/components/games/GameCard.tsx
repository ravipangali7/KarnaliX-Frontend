import { Link } from "react-router-dom";
import { Users, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GameCardProps {
  id: string;
  name: string;
  image: string;
  category: string;
  players: number;
  minBet: number;
  maxBet: number;
  rating: number;
  isHot?: boolean;
  isNew?: boolean;
  provider?: string;
}

export function GameCard({ 
  id, 
  name, 
  image, 
  category, 
  players, 
  minBet, 
  maxBet, 
  rating, 
  isHot, 
  isNew,
  provider 
}: GameCardProps) {
  return (
    <Link to={`/game/${id}`} className="group">
      <div className="game-card relative rounded-xl overflow-hidden glass border border-border/50 hover:border-primary/50 hover:glow-cyan">
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img 
            src={image} 
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
            <Button variant="neon" size="sm">
              Play Now
            </Button>
          </div>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-2">
            {isNew && (
              <span className="px-2 py-0.5 bg-neon-green text-primary-foreground text-xs font-bold rounded">
                NEW
              </span>
            )}
            {isHot && (
              <span className="px-2 py-0.5 bg-neon-red text-white text-xs font-bold rounded flex items-center gap-1">
                <Zap className="w-3 h-3" /> HOT
              </span>
            )}
          </div>

          {/* Live Players */}
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-background/80 backdrop-blur-sm rounded-full text-xs">
            <Users className="w-3 h-3 text-neon-green" />
            <span className="font-mono">{players.toLocaleString()}</span>
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {name}
              </h3>
              {provider && (
                <p className="text-xs text-muted-foreground">{provider}</p>
              )}
            </div>
            <div className="flex items-center gap-1 text-accent">
              <Star className="w-3 h-3 fill-current" />
              <span className="text-xs font-medium">{rating.toFixed(1)}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="px-2 py-0.5 bg-muted rounded">{category}</span>
            <span className="font-mono">₹{minBet} - ₹{maxBet}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function GameCardLarge({ 
  id, 
  name, 
  image, 
  category, 
  players, 
  minBet, 
  maxBet, 
  rating, 
  isHot, 
  isNew,
  provider 
}: GameCardProps) {
  return (
    <Link to={`/game/${id}`} className="group">
      <div className="game-card relative rounded-2xl overflow-hidden glass border border-border/50 hover:border-primary/50 hover:glow-cyan">
        {/* Image Container */}
        <div className="relative aspect-video overflow-hidden">
          <img 
            src={image} 
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {isNew && (
              <span className="px-3 py-1 bg-neon-green text-primary-foreground text-xs font-bold rounded-full">
                NEW
              </span>
            )}
            {isHot && (
              <span className="px-3 py-1 bg-neon-red text-white text-xs font-bold rounded-full flex items-center gap-1">
                <Zap className="w-3 h-3" /> HOT
              </span>
            )}
          </div>

          {/* Live Players */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-background/80 backdrop-blur-sm rounded-full text-sm">
            <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
            <Users className="w-4 h-4 text-neon-green" />
            <span className="font-mono font-medium">{players.toLocaleString()}</span>
          </div>

          {/* Bottom Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">{provider}</p>
                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  {name}
                </h3>
                <div className="flex items-center gap-3 mt-2">
                  <span className="px-2 py-0.5 bg-muted/80 backdrop-blur-sm rounded text-xs">{category}</span>
                  <div className="flex items-center gap-1 text-accent">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-medium">{rating.toFixed(1)}</span>
                  </div>
                  <span className="font-mono text-sm">₹{minBet} - ₹{maxBet}</span>
                </div>
              </div>
              <Button variant="neon" size="lg" className="opacity-0 group-hover:opacity-100 transition-opacity">
                Play Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
