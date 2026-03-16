import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/** Coming Soon section is now driven by the Coming Soon model. Use the Coming Soon menu to manage items. */
export default function PowerhouseSiteHomeComingSoon() {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 pb-10">
      <div className="flex flex-col gap-1">
        <Link to="/powerhouse/site-settings" className="text-sm text-primary hover:underline">
          ← Site Setting
        </Link>
        <h1 className="font-display font-bold text-2xl tracking-tight">Home Coming Soon</h1>
        <p className="text-sm text-muted-foreground">
          The Coming Soon section on the home page is now managed via the Coming Soon menu. Add and edit items there.
        </p>
      </div>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display">Manage Coming Soon items</CardTitle>
        </CardHeader>
        <CardContent>
          <Button asChild variant="default">
            <Link to="/powerhouse/coming-soon">Open Coming Soon</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
