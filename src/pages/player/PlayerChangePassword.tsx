import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const PlayerChangePassword = () => {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [current, setCurrent] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleSubmit = () => {
    if (!current || !newPw || !confirm) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    if (newPw !== confirm) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (newPw.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    toast({ title: "Password updated successfully!", description: "Please use your new password next time." });
    setCurrent(""); setNewPw(""); setConfirm("");
  };

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto space-y-5">
      <h2 className="font-gaming font-bold text-xl neon-text tracking-wider">CHANGE PASSWORD</h2>

      <Card className="gaming-card">
        <CardContent className="p-5 space-y-4">
          <div className="h-14 w-14 mx-auto rounded-full gold-gradient flex items-center justify-center neon-glow-sm mb-2">
            <Lock className="h-7 w-7 text-primary-foreground" />
          </div>

          <div>
            <label className="text-xs text-muted-foreground font-medium mb-1 block">Current Password</label>
            <div className="relative">
              <Input type={showCurrent ? "text" : "password"} placeholder="Enter current password" value={current} onChange={(e) => setCurrent(e.target.value)} className="h-11 pr-10" />
              <button onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground font-medium mb-1 block">New Password</label>
            <div className="relative">
              <Input type={showNew ? "text" : "password"} placeholder="Enter new password" value={newPw} onChange={(e) => setNewPw(e.target.value)} className="h-11 pr-10" />
              <button onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {newPw && (
              <div className="flex gap-2 mt-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${newPw.length >= 6 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                  {newPw.length >= 6 ? "✓" : "✗"} 6+ chars
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${/[A-Z]/.test(newPw) ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                  {/[A-Z]/.test(newPw) ? "✓" : "○"} Uppercase
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${/[0-9]/.test(newPw) ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                  {/[0-9]/.test(newPw) ? "✓" : "○"} Number
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs text-muted-foreground font-medium mb-1 block">Confirm New Password</label>
            <Input type="password" placeholder="Confirm new password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="h-11" />
            {confirm && newPw && (
              <p className={`text-[10px] mt-1 ${confirm === newPw ? "text-success" : "text-destructive"}`}>
                {confirm === newPw ? "✓ Passwords match" : "✗ Passwords don't match"}
              </p>
            )}
          </div>

          <Button onClick={handleSubmit} className="w-full gold-gradient text-primary-foreground font-gaming tracking-wider h-11 neon-glow-sm">
            UPDATE PASSWORD
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlayerChangePassword;
