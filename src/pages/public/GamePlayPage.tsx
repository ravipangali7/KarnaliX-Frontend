import { useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getGameLaunchUrl } from "@/api/player";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const DRAG_THRESHOLD_PX = 5;

export default function GamePlayPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [backPosition, setBackPosition] = useState({ x: 16, y: 16 });
  const backButtonRef = useRef<HTMLButtonElement>(null);
  const dragStartRef = useRef<{ clientX: number; clientY: number; posX: number; posY: number; width: number; height: number } | null>(null);
  const didDragRef = useRef(false);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    const start = dragStartRef.current;
    if (!start) return;
    const dx = e.clientX - start.clientX;
    const dy = e.clientY - start.clientY;
    if (Math.abs(dx) > DRAG_THRESHOLD_PX || Math.abs(dy) > DRAG_THRESHOLD_PX) didDragRef.current = true;
    let newX = start.posX + dx;
    let newY = start.posY + dy;
    newX = Math.max(0, Math.min(window.innerWidth - start.width, newX));
    newY = Math.max(0, Math.min(window.innerHeight - start.height, newY));
    setBackPosition({ x: newX, y: newY });
  }, []);

  const handlePointerUp = useCallback(() => {
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
    if (!didDragRef.current) navigate(-1);
    dragStartRef.current = null;
  }, [handlePointerMove, navigate]);

  const handleBackPointerDown = useCallback((e: React.PointerEvent) => {
    didDragRef.current = false;
    const rect = backButtonRef.current?.getBoundingClientRect();
    const w = rect?.width ?? 80;
    const h = rect?.height ?? 36;
    dragStartRef.current = { clientX: e.clientX, clientY: e.clientY, posX: backPosition.x, posY: backPosition.y, width: w, height: h };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  }, [backPosition.x, backPosition.y, handlePointerMove, handlePointerUp]);

  const { data: launchUrl, isLoading, isError, error } = useQuery({
    queryKey: ["game-launch", id],
    queryFn: () => getGameLaunchUrl(Number(id)),
    enabled: !!id && /^\d+$/.test(id),
  });

  const fullViewport = "fixed inset-0 w-screen h-screen overflow-hidden";

  if (!id) {
    return (
      <div className={`${fullViewport} flex items-center justify-center p-4`}>
        <p className="text-muted-foreground">Invalid game.</p>
        <Button variant="link" onClick={() => navigate("/games")}>Back to games</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`${fullViewport} flex items-center justify-center p-4`}>
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
      <div className={`${fullViewport} flex flex-col items-center justify-center gap-4 p-4`}>
        <p className="text-muted-foreground">{err?.detail ?? "Could not load game."}</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to game
        </Button>
      </div>
    );
  }

  return (
    <div className={fullViewport}>
      <iframe
        title="Game"
        src={launchUrl}
        className="absolute inset-0 w-full h-full border-0"
        allow="fullscreen; payment; autoplay"
        allowFullScreen
      />
      <Button
        ref={backButtonRef}
        variant="outline"
        size="sm"
        className="fixed z-50 bg-background/90 backdrop-blur-sm shadow-md hover:bg-background cursor-grab active:cursor-grabbing"
        style={{ left: backPosition.x, top: backPosition.y }}
        onPointerDown={handleBackPointerDown}
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back
      </Button>
    </div>
  );
}
