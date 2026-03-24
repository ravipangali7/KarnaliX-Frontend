import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getRejectReasonSuggestions } from "@/api/admin";

type Props = {
  onPick: (text: string) => void;
};

export function RejectReasonSuggestionsRow({ onPick }: Props) {
  const { user } = useAuth();
  const role =
    user?.role === "powerhouse" || user?.role === "super" || user?.role === "master" ? user.role : "master";
  const { data } = useQuery({
    queryKey: ["reject-reason-suggestions", role],
    queryFn: () => getRejectReasonSuggestions(role),
  });
  const raw = data as { data?: unknown } | undefined;
  const items = Array.isArray(raw?.data) ? raw.data : [];
  if (items.length === 0) return null;
  return (
    <div className="space-y-1.5 pt-1">
      <p className="text-xs text-muted-foreground">Suggestions</p>
      <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
        {items.map((s, i) => (
          <Button
            key={i}
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 text-xs h-8 whitespace-nowrap"
            onClick={() => onPick(String(s))}
          >
            {String(s)}
          </Button>
        ))}
      </div>
    </div>
  );
}
