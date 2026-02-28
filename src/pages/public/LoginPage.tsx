import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Gamepad2 } from "lucide-react";

const roleRedirect: Record<string, string> = {
  powerhouse: "/powerhouse",
  super: "/super",
  master: "/master",
  player: "/player",
};

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(username, password);
      const nextParam = searchParams.get("next") ?? "";
      const isSafeNext = nextParam.startsWith("/") && !nextParam.startsWith("//");
      const to = isSafeNext ? nextParam : (roleRedirect[user.role] || "/");
      navigate(to, { replace: true });
    } catch (err: unknown) {
      const detail = (err as { detail?: string })?.detail ?? "Invalid credentials.";
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
            <Gamepad2 className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="font-gaming text-xl neon-text tracking-wide">WELCOME BACK</CardTitle>
          <p className="text-xs text-muted-foreground">Sign in to your Karnali X account</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-xs text-destructive">{error}</p>}
            <Input placeholder="Username" className="h-11" value={username} onChange={(e) => setUsername(e.target.value)} required />
            <div className="relative">
              <Input type={showPassword ? "text" : "password"} placeholder="Password" className="h-11" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <Button type="submit" className="w-full gold-gradient text-primary-foreground font-display font-semibold h-11 neon-glow-sm" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <p className="text-center text-xs text-muted-foreground">
            <Link to="/forgot-password" className="text-primary hover:underline font-medium">Forgot password?</Link>
          </p>
          <p className="text-center text-xs text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary hover:underline font-medium">Register</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
