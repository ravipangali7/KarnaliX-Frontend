import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { User, Phone, Mail, Key, CreditCard, Gamepad2, ChevronRight, LogOut, BarChart3, Clock, Edit } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const profileLinks = [
  { label: "Payment Modes", path: "/player/payment-modes", icon: CreditCard, color: "text-primary" },
  { label: "Game Results", path: "/player/game-results", icon: BarChart3, color: "text-neon" },
  { label: "Transactions", path: "/player/transactions", icon: Clock, color: "text-warning" },
  { label: "Change Password", path: "/player/change-password", icon: Key, color: "text-accent" },
];

const PlayerProfile = () => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("Ram Sharma");
  const [phone, setPhone] = useState("+977-9841234567");
  const [email, setEmail] = useState("ram@email.com");

  const handleSave = () => {
    setEditing(false);
    toast({ title: "Profile updated successfully!" });
  };

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-2xl mx-auto">
      <h2 className="font-gaming font-bold text-xl neon-text tracking-wider">PROFILE</h2>

      {/* Avatar & Info */}
      <Card className="overflow-hidden gaming-card">
        <div className="h-20 gold-gradient relative">
          <div className="absolute inset-0 gaming-grid-bg opacity-30" />
        </div>
        <CardContent className="p-5 -mt-10 text-center">
          <div className="h-20 w-20 rounded-full gold-gradient mx-auto flex items-center justify-center ring-4 ring-card neon-glow">
            <span className="font-gaming font-bold text-2xl text-primary-foreground">P1</span>
          </div>
          <h3 className="font-display font-semibold text-xl mt-3">{name}</h3>
          <p className="text-xs text-muted-foreground">@player1</p>
          <div className="flex justify-center gap-4 mt-3">
            <div className="text-center">
              <p className="font-gaming font-bold text-sm text-primary">₹25,000</p>
              <p className="text-[9px] text-muted-foreground">Balance</p>
            </div>
            <div className="text-center">
              <p className="font-gaming font-bold text-sm text-accent">₹2,500</p>
              <p className="text-[9px] text-muted-foreground">Bonus</p>
            </div>
            <div className="text-center">
              <p className="font-gaming font-bold text-sm text-success">142</p>
              <p className="text-[9px] text-muted-foreground">Games</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Info */}
      <Card className="gaming-card">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display font-semibold text-sm">Personal Info</h3>
            <Button variant="ghost" size="sm" className="text-xs text-primary gap-1" onClick={() => setEditing(!editing)}>
              <Edit className="h-3 w-3" /> {editing ? "Cancel" : "Edit"}
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <Input value={name} onChange={(e) => setName(e.target.value)} readOnly={!editing} className={!editing ? "border-transparent bg-transparent" : ""} />
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} readOnly={!editing} className={!editing ? "border-transparent bg-transparent" : ""} />
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <Input value={email} onChange={(e) => setEmail(e.target.value)} readOnly={!editing} className={!editing ? "border-transparent bg-transparent" : ""} />
          </div>
          {editing && (
            <Button onClick={handleSave} className="w-full gold-gradient text-primary-foreground font-gaming tracking-wider neon-glow-sm">SAVE CHANGES</Button>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="space-y-2">
        {profileLinks.map((link) => (
          <Link key={link.path} to={link.path}>
            <Card className="hover:border-primary/30 hover:neon-glow-sm transition-all gaming-card">
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center">
                    <link.icon className={`h-4 w-4 ${link.color}`} />
                  </div>
                  <span className="text-sm font-medium">{link.label}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Button variant="outline" className="w-full border-destructive text-destructive hover:bg-destructive/10">
        <LogOut className="h-4 w-4 mr-2" /> Logout
      </Button>
    </div>
  );
};

export default PlayerProfile;
