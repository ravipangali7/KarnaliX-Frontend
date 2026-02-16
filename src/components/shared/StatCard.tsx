import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export const StatCard = ({ title, value, icon: Icon, trend, trendUp, className }: StatCardProps) => {
  return (
    <Card className={`hover:border-primary/20 hover:neon-glow-sm transition-all duration-300 gaming-card ${className || ""}`}>
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
        <CardTitle className="text-[10px] md:text-xs font-medium text-muted-foreground">{title}</CardTitle>
        <div className="h-8 w-8 rounded-lg gold-gradient flex items-center justify-center neon-glow-sm">
          <Icon className="h-4 w-4 text-primary-foreground" />
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="text-lg md:text-xl font-gaming font-bold">{typeof value === "number" ? value.toLocaleString() : value}</div>
        {trend && (
          <p className={`text-[10px] mt-1 ${trendUp ? "text-success" : "text-destructive"}`}>
            {trendUp ? "↑" : "↓"} {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
