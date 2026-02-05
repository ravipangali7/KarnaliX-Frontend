import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Gamepad2, Lock, Eye, EyeOff, ArrowRight, User, Phone, Gift, Shield, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/lib/api";
import { toast } from "sonner";

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register: registerAuth, getDashboardRoute } = useAuth();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: "",
    username: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
    ageVerified: false,
    termsAccepted: false,
  });

  // When returning from OTP verification, jump to account step with phone set
  useEffect(() => {
    const state = location.state as { phoneVerified?: boolean; phone?: string; referralCode?: string } | null;
    if (state?.phoneVerified && state?.phone) {
      setFormData((prev) => ({ ...prev, phone: state.phone ?? prev.phone, referralCode: state.referralCode ?? prev.referralCode }));
      setStep(2);
    }
  }, [location.state]);

  // Pick up referral code from URL
  useEffect(() => {
    const refFromState = (location.state as { referralCode?: string } | null)?.referralCode;
    const refFromQuery = new URLSearchParams(location.search).get("ref");
    const code = refFromState ?? refFromQuery ?? "";
    if (code && !formData.referralCode) {
      setFormData((prev) => ({ ...prev, referralCode: code }));
    }
  }, [location.state, location.search]);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const phone = formData.phone?.trim();
    if (!phone) {
      toast.error("Enter your phone number");
      return;
    }
    setLoading(true);
    try {
      await apiClient.sendOtp(phone);
      toast.success("OTP sent to your phone");
      navigate("/signup/verify-otp", { state: { phone, referralCode: formData.referralCode } });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to send OTP";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      handleSendOtp(e);
      return;
    }
    if (step === 2) {
      setStep(3);
      return;
    }
    // Step 3: create account
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    const username = formData.username?.trim();
    if (!username) {
      toast.error("Username is required");
      return;
    }
    if (!formData.phone?.trim()) {
      toast.error("Phone verification is required. Please complete the phone step.");
      return;
    }
    if (!formData.ageVerified || !formData.termsAccepted) {
      toast.error("Please confirm age and accept terms");
      return;
    }
    setLoading(true);
    try {
      await registerAuth({
        phone: formData.phone.trim(),
        username,
        password: formData.password,
        referral_code: formData.referralCode?.trim() || "",
      });
      toast.success("Account created successfully!");
      const route = getDashboardRoute();
      navigate(route === "/login" ? "/dashboard" : route);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Registration failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold gradient-text">KarnaliX</span>
          </Link>

          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-muted-foreground mb-6">
            Join the winning community today
          </p>

          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1 flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  step >= s
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                </div>
                {s < 3 && (
                  <div className={`flex-1 h-1 mx-2 rounded ${step > s ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Phone only */}
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+977 98XXXXXXXX"
                      className="pl-10 h-12 bg-input border-border"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  We&apos;ll send you a verification code by SMS.
                </p>
              </>
            )}

            {/* Step 2: Username & password (after OTP verified) */}
            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Choose a username"
                      className="pl-10 h-12 bg-input border-border"
                      value={formData.username}
                      onChange={(e) => handleChange("username", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      className="pl-10 pr-10 h-12 bg-input border-border"
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      className="pl-10 h-12 bg-input border-border"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="referralCode">Referral Code (Optional)</Label>
                  <div className="relative">
                    <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="referralCode"
                      type="text"
                      placeholder="Enter referral code"
                      className="pl-10 h-12 bg-input border-border"
                      value={formData.referralCode}
                      onChange={(e) => handleChange("referralCode", e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Age & terms */}
            {step === 3 && (
              <>
                <div className="glass rounded-xl p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Shield className="w-8 h-8 text-primary" />
                    <div>
                      <h3 className="font-semibold">Age Verification</h3>
                      <p className="text-sm text-muted-foreground">You must be 18+ to play</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="ageVerified"
                      checked={formData.ageVerified}
                      onCheckedChange={(checked) => handleChange("ageVerified", checked as boolean)}
                    />
                    <Label htmlFor="ageVerified" className="text-sm cursor-pointer">
                      I confirm that I am at least 18 years old and legally allowed to participate in online gaming in my jurisdiction.
                    </Label>
                  </div>
                </div>

                <div className="glass rounded-xl p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="termsAccepted"
                      checked={formData.termsAccepted}
                      onCheckedChange={(checked) => handleChange("termsAccepted", checked as boolean)}
                    />
                    <Label htmlFor="termsAccepted" className="text-sm cursor-pointer">
                      I agree to the{" "}
                      <Link to="/terms" className="text-primary hover:underline">Terms & Conditions</Link>
                      {" "}and{" "}
                      <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                      I understand the risks associated with online gaming and betting.
                    </Label>
                  </div>
                </div>

                <div className="glass rounded-xl p-4 border-neon-green/50 bg-neon-green/10">
                  <div className="flex items-center gap-3">
                    <Gift className="w-6 h-6 text-neon-green" />
                    <div>
                      <p className="font-semibold text-neon-green">Welcome Bonus: 200% up to ₹50,000</p>
                      <p className="text-sm text-muted-foreground">Claim your bonus after registration!</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-4">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={() => setStep(step - 1)}
                >
                  Back
                </Button>
              )}
              <Button
                type="submit"
                variant="neon"
                size="lg"
                className="flex-1 gap-2"
                disabled={(step === 3 && (!formData.ageVerified || !formData.termsAccepted)) || loading}
              >
                {loading
                  ? (step === 1 ? "Sending..." : "Creating...")
                  : step === 1
                    ? "Send OTP"
                    : step === 2
                      ? "Continue"
                      : "Create Account"}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </form>

          <p className="text-center mt-8 text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Login
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-card items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-secondary/20 via-transparent to-transparent" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-2s' }} />

        <div className="relative z-10 max-w-md">
          <h2 className="text-3xl font-bold mb-6">Why Join KarnaliX?</h2>
          <div className="space-y-4">
            {[
              { icon: "🎮", title: "500+ Games", desc: "Card games, slots, live casino & more" },
              { icon: "💰", title: "Instant Payouts", desc: "Withdraw your winnings 24/7" },
              { icon: "🎁", title: "200% Welcome Bonus", desc: "Up to ₹50,000 on first deposit" },
              { icon: "🔒", title: "100% Secure", desc: "SSL encrypted & licensed platform" },
              { icon: "📱", title: "24/7 Support", desc: "WhatsApp, chat & phone support" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 glass rounded-xl p-4">
                <div className="text-3xl">{item.icon}</div>
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
