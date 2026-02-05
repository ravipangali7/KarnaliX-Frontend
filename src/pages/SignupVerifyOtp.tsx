import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Gamepad2 } from "lucide-react";
import apiClient from "@/lib/api";
import { toast } from "sonner";

export default function SignupVerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const statePhone = (location.state as { phone?: string } | null)?.phone;
    const queryPhone = new URLSearchParams(location.search).get("phone");
    const p = statePhone ?? queryPhone ?? "";
    setPhone(p);
    if (!p) {
      toast.error("Phone number is missing. Please start from signup.");
      navigate("/signup", { replace: true });
    }
  }, [location.state, location.search, navigate]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || otp.length !== 6) {
      toast.error("Please enter the 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      await apiClient.verifyOtp(phone, otp);
      toast.success("Phone verified!");
      const referralCode = (location.state as { referralCode?: string } | null)?.referralCode;
      navigate("/signup", { state: { phoneVerified: true, phone, referralCode }, replace: true });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Verification failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!phone) return;
    setResendLoading(true);
    try {
      await apiClient.sendOtp(phone);
      toast.success("OTP sent again");
      setOtp("");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to resend OTP";
      toast.error(message);
    } finally {
      setResendLoading(false);
    }
  };

  if (!phone) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Gamepad2 className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold gradient-text">KarnaliX</span>
        </Link>

        <h1 className="text-3xl font-bold mb-2">Verify your phone</h1>
        <p className="text-muted-foreground mb-6">
          Enter the 6-digit code sent to {phone}
        </p>

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
            >
              <InputOTPGroup className="gap-2">
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              type="submit"
              variant="neon"
              size="lg"
              className="w-full"
              disabled={otp.length !== 6 || loading}
            >
              {loading ? "Verifying..." : "Verify"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
              disabled={resendLoading}
              onClick={handleResend}
            >
              {resendLoading ? "Sending..." : "Resend OTP"}
            </Button>
          </div>
        </form>

        <p className="text-center mt-8 text-muted-foreground">
          <Link to="/signup" className="text-primary hover:underline font-medium">
            Back to signup
          </Link>
        </p>
      </div>
    </div>
  );
}
