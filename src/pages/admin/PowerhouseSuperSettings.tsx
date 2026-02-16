import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getSuperSettings } from "@/api/admin";

const PowerhouseSuperSettings = () => {
  const { data: superSettings } = useQuery({ queryKey: ["admin-super-settings"], queryFn: getSuperSettings });
  const s = (superSettings ?? {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 max-w-lg">
      <h2 className="font-display font-bold text-xl">Super Settings</h2>
      <Card>
        <CardHeader className="p-4 pb-2"><CardTitle className="text-sm font-display">Financial Settings</CardTitle></CardHeader>
        <CardContent className="p-4 pt-2 space-y-3">
          <div><label className="text-xs text-muted-foreground">GGR Coin</label><Input type="number" defaultValue={String(s.ggr_coin ?? "")} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-muted-foreground">Deposit Min</label><Input type="number" defaultValue={String(s.min_deposit ?? "")} /></div>
            <div><label className="text-xs text-muted-foreground">Deposit Max</label><Input type="number" defaultValue={String(s.max_deposit ?? "")} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-muted-foreground">Withdraw Min</label><Input type="number" defaultValue={String(s.min_withdraw ?? "")} /></div>
            <div><label className="text-xs text-muted-foreground">Withdraw Max</label><Input type="number" defaultValue={String(s.max_withdraw ?? "")} /></div>
          </div>
          <div><label className="text-xs text-muted-foreground">Exposure Limit</label><Input type="number" defaultValue={String(s.exposure_limit ?? "")} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 pb-2"><CardTitle className="text-sm font-display">API Settings</CardTitle></CardHeader>
        <CardContent className="p-4 pt-2 space-y-3">
          <div><label className="text-xs text-muted-foreground">API Endpoint</label><Input defaultValue={String(s.game_api_url ?? "")} /></div>
          <div><label className="text-xs text-muted-foreground">API Secret</label><Input defaultValue={String(s.game_api_secret ?? "")} type="password" /></div>
        </CardContent>
      </Card>

      <Button className="gold-gradient text-primary-foreground font-display w-full">Save Settings</Button>
    </div>
  );
};

export default PowerhouseSuperSettings;
