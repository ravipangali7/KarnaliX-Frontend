import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getGameLaunchUrl } from "@/api/player";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function GamePlayPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: launchUrl, isLoading, isError, error } = useQuery({
    queryKey: ["game-launch", id],
    queryFn: () => getGameLaunchUrl(Number(id)),
    enabled: !!id && /^\d+$/.test(id),
  });

  if (!id) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <p className="text-muted-foreground">Invalid game.</p>
        <Button variant="link" onClick={() => navigate("/games")}>Back to games</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading game...</p>
        </div>
      </div>
    );
  }

  if (isError || !launchUrl) {
    const err = error as { detail?: string } | undefined;
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
        <p className="text-muted-foreground">{err?.detail ?? "Could not load game."}</p>
        <Button variant="outline" onClick={() => navigate("/games/" + id)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to game
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col min-h-0 w-full">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/30">
        <Button variant="ghost" size="sm" onClick={() => navigate("/games/" + id)}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      </div>
      <div className="flex-1 min-h-0 w-full">
        <iframe
          title="Game"
          src={launchUrl}
          className="w-full h-full min-h-[calc(100vh-8rem)] border-0"
          allow="fullscreen; payment; autoplay"
          allowFullScreen
        />
      </div>
    </div>
  );
}
