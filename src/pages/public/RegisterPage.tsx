import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, UserPlus } from "lucide-react";

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ username: "", password: "", name: "", phone: "", email: "", whatsapp_number: "", referral_code: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/player", { replace: true });
    } catch (err: unknown) {
      const detail = (err as { detail?: string })?.detail ?? "Registration failed.";
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-navy relative overflow-hidden">
      <div className="absolute inset-0 hero-bg" />
      <div className="absolute inset-0 gaming-grid-bg opacity-30" />
      <Card className="w-full max-w-sm relative z-10 gaming-card">
        <CardHeader className="text-center space-y-3">
          <div className="h-16 w-16 mx-auto rounded-xl gold-gradient flex items-center justify-center neon-glow">
            <UserPlus className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="font-gaming text-xl neon-text tracking-wide">CREATE ACCOUNT</CardTitle>
          <p className="text-xs text-muted-foreground">Join Karnali X today</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && <p className="text-xs text-destructive">{error}</p>}
            <Input placeholder="Full Name" className="h-11" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <Input placeholder="Username" className="h-11" value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} required />
            <Input placeholder="Phone Number" className="h-11" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            <Input placeholder="Email (optional)" type="email" className="h-11" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            <Input placeholder="WhatsApp Number" className="h-11" value={form.whatsapp_number} onChange={(e) => setForm((f) => ({ ...f, whatsapp_number: e.target.value }))} />
            <div className="relative">
              <Input type={showPassword ? "text" : "password"} placeholder="Password" className="h-11" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <Input placeholder="Referral Code (optional)" className="h-11" value={form.referral_code} onChange={(e) => setForm((f) => ({ ...f, referral_code: e.target.value }))} />
            <Button type="submit" className="w-full gold-gradient text-primary-foreground font-display font-semibold h-11 neon-glow-sm" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </Button>
          </form>
          <p className="text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">Sign In</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;
