import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { signupCheckPhone, signupSendOtp, signupVerifyOtp } from "@/api/auth";

type Step = "phone" | "otp" | "name" | "password";

function maskPhone(phone: string): string {
  if (!phone || phone.length < 4) return "****";
  return "*".repeat(phone.length - 4) + phone.slice(-4);
}

const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const refFromUrl = searchParams.get("ref") ?? "";
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState(refFromUrl);
  const [signupToken, setSignupToken] = useState("");
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (refFromUrl) setReferralCode(refFromUrl);
  }, [refFromUrl]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { exists } = await signupCheckPhone(phone.trim());
      if (exists) {
        setError("An account with this phone already exists. Please log in.");
        return;
      }
      await signupSendOtp(phone.trim());
      toast({ title: "OTP sent to your phone." });
      setStep("otp");
    } catch (err: unknown) {
      const detail = (err as { detail?: string })?.detail ?? "Failed. Try again.";
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { signup_token } = await signupVerifyOtp(phone.trim(), otp);
      setSignupToken(signup_token);
      setVerifiedPhone(phone.trim());
      setStep("name");
    } catch (err: unknown) {
      const detail = (err as { detail?: string })?.detail ?? "Invalid or expired OTP.";
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  const handleNameNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Enter your name.");
      return;
    }
    setError("");
    setStep("password");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await register({
        signup_token: signupToken,
        phone: verifiedPhone,
        name: name.trim(),
        password,
        referral_code: referralCode.trim() || undefined,
      });
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
          <p className="text-xs text-muted-foreground">
            {step === "phone" && "Enter your phone number"}
            {step === "otp" && "Enter the code we sent"}
            {step === "name" && "Your name"}
            {step === "password" && "Choose a password"}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {step === "phone" && (
            <form onSubmit={handlePhoneSubmit} className="space-y-3">
              {error && <p className="text-xs text-destructive">{error}</p>}
              <Input
                placeholder="Phone (e.g. 9812345678 or 9779812345678)"
                className="h-11"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              {referralCode && (
                <Input
                  placeholder="Referral code"
                  className="h-11"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                />
              )}
              <Button type="submit" className="w-full gold-gradient text-primary-foreground font-display font-semibold h-11 neon-glow-sm" disabled={loading}>
                {loading ? "Checking..." : "Continue"}
              </Button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleOtpSubmit} className="space-y-3">
              <p className="text-xs text-muted-foreground">Code sent to {maskPhone(phone)}</p>
              <Input
                placeholder="6-digit code"
                className="h-11"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                required
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
              <Button type="submit" className="w-full gold-gradient text-primary-foreground font-display font-semibold h-11 neon-glow-sm" disabled={loading}>
                {loading ? "Verifying..." : "Verify"}
              </Button>
            </form>
          )}

          {step === "name" && (
            <form onSubmit={handleNameNext} className="space-y-3">
              {error && <p className="text-xs text-destructive">{error}</p>}
              <Input placeholder="Full name" className="h-11" value={name} onChange={(e) => setName(e.target.value)} required />
              <Button type="submit" className="w-full gold-gradient text-primary-foreground font-display font-semibold h-11 neon-glow-sm">
                Next
              </Button>
            </form>
          )}

          {step === "password" && (
            <form onSubmit={handleRegister} className="space-y-3">
              {error && <p className="text-xs text-destructive">{error}</p>}
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password (min 6 characters)"
                  className="h-11"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button type="submit" className="w-full gold-gradient text-primary-foreground font-display font-semibold h-11 neon-glow-sm" disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </form>
          )}

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
