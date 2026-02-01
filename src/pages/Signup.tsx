import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Gamepad2, Mail, Lock, Eye, EyeOff, ArrowRight, User, Phone, Gift, Shield, CheckCircle, Loader2 } from "lucide-react";
import apiClient from "@/lib/api";
import { toast } from "sonner";

export default function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    username: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
    ageVerified: false,
    termsAccepted: false,
  });

  const handleChange = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Validate password match
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      setLoading(true);
      try {
        await apiClient.register({
          email: formData.email,
          username: formData.username,
          password: formData.password,
          full_name: formData.fullName,
          phone: formData.phone,
          referral_code: formData.referralCode || undefined,
        });
        toast.success("Account created successfully! Please login.");
        navigate("/login");
      } catch (error: any) {
        toast.error(error.message || "Registration failed. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
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

          {/* Progress Steps */}
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
            {/* Step 1: Personal Info */}
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      className="pl-10 h-12 bg-input border-border"
                      value={formData.fullName}
                      onChange={(e) => handleChange("fullName", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10 h-12 bg-input border-border"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                    />
                  </div>
                </div>

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
              </>
            )}

            {/* Step 2: Account Info */}
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

            {/* Step 3: Verification */}
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

            {/* Navigation Buttons */}
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
                disabled={loading || (step === 3 && (!formData.ageVerified || !formData.termsAccepted))}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    {step === 3 ? "Create Account" : "Continue"}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Login Link */}
          <p className="text-center mt-8 text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Login
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Promo */}
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
