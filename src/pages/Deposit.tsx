import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { WhatsAppButton, whatsAppLinks } from "@/components/layout/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Wallet, 
  CreditCard, 
  Smartphone, 
  Building2, 
  QrCode,
  Shield,
  Clock,
  Gift,
  ChevronRight,
  Plus,
  Check,
  AlertCircle,
  MessageCircle,
  Zap,
  Upload,
  Image,
  FileText,
  X,
  LogIn
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useContact } from "@/hooks/useContact";
import apiClient from "@/lib/api";
import { toast } from "sonner";

const defaultPaymentMethods = [
  { id: "esewa", name: "eSewa", icon: "💳", popular: true, minLimit: 500, maxLimit: 25000, hasQR: true },
  { id: "khalti", name: "Khalti", icon: "📱", popular: true, minLimit: 100, maxLimit: 50000, hasQR: true },
  { id: "bank", name: "Bank Transfer", icon: "🏦", minLimit: 1000, maxLimit: 100000, hasQR: false },
];

const quickAmounts = [500, 1000, 2000, 5000, 10000, 25000];

export default function Deposit() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const contact = useContact();
  const navigate = useNavigate();
  const [paymentModes, setPaymentModes] = useState<{ id: string; name: string; icon: string; minLimit: number; maxLimit: number; hasQR: boolean }[]>(defaultPaymentMethods);
  const [recentDeposits, setRecentDeposits] = useState<{ type: string; amount: number; method: string; date: string; status: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [amount, setAmount] = useState(1000);
  const [step, setStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [transactionCode, setTransactionCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [dRes, mRes] = await Promise.all([
          apiClient.getUserDeposits(),
          apiClient.getUserDepositPaymentModes(),
        ]);
        if (cancelled) return;
        const modes = mRes?.results ?? mRes ?? [];
        const list = Array.isArray(modes) ? modes : [];
        setPaymentModes(
          list.length > 0
            ? list.map((m: any) => ({
                id: String(m.id),
                name: m.wallet_holder_name || m.name || String(m.id),
                icon: "💳",
                minLimit: 100,
                maxLimit: 100000,
                hasQR: false,
              }))
            : defaultPaymentMethods
        );
        const deposits = dRes?.results ?? dRes ?? [];
        const depList = Array.isArray(deposits) ? deposits : [];
        setRecentDeposits(
          depList.slice(0, 6).map((d: any) => ({
            type: "deposit",
            amount: Number(d.amount) || 0,
            method: d.payment_mode?.name || "—",
            date: d.created_at ? new Date(d.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—",
            status: (d.status || "").toLowerCase() === "approved" ? "success" : "pending",
          }))
        );
      } catch {
        if (!cancelled) setRecentDeposits([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  const paymentMethods = paymentModes;
  const recentTransactions = recentDeposits.length > 0 ? recentDeposits : [
    { type: "deposit", amount: 5000, method: "eSewa", date: "Today, 2:30 PM", status: "success" },
    { type: "deposit", amount: 10000, method: "Bank", date: "3 days ago", status: "success" },
  ];
  const currentMethod = paymentMethods.find(m => m.id === selectedMethod);

  const handleAmountChange = (value: number) => {
    const min = currentMethod?.minLimit || 100;
    const max = currentMethod?.maxLimit || 100000;
    setAmount(Math.max(min, Math.min(max, value)));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload PNG, JPG, or PDF file only');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setUploadedFile(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setUploadedPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setUploadedPreview(null);
      }
    }
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
    setUploadedPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const bonus = amount >= 500 ? Math.floor(amount * 0.1) : 0;

  const handleSubmitDeposit = async () => {
    if (!selectedMethod) {
      toast.error("Please select a payment method");
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.createUserDeposit({
        amount: Number(amount),
        payment_mode_id: selectedMethod || undefined,
        remarks: transactionCode || undefined,
      });
      toast.success("Deposit request submitted. We'll process it shortly.");
      setAmount(1000);
      setSelectedMethod("");
      setTransactionCode("");
      setUploadedFile(null);
      setUploadedPreview(null);
      const [dRes, mRes] = await Promise.all([
        apiClient.getUserDeposits(),
        apiClient.getUserDepositPaymentModes(),
      ]);
      const modes = mRes?.results ?? mRes ?? [];
      const list = Array.isArray(modes) ? modes : [];
      setPaymentModes(
        list.length > 0
          ? list.map((m: any) => ({
              id: String(m.id),
              name: m.wallet_holder_name || m.name || String(m.id),
              icon: "💳",
              minLimit: 100,
              maxLimit: 100000,
              hasQR: false,
            }))
          : defaultPaymentMethods
      );
      const deposits = dRes?.results ?? dRes ?? [];
      const depList = Array.isArray(deposits) ? deposits : [];
      setRecentDeposits(
        depList.slice(0, 6).map((d: any) => ({
          type: "deposit",
          amount: Number(d.amount) || 0,
          method: d.payment_mode?.name || "—",
          date: d.created_at ? new Date(d.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—",
          status: (d.status || "").toLowerCase() === "approved" ? "success" : "pending",
        }))
      );
    } catch (e: any) {
      toast.error(e?.message || "Failed to submit deposit");
    } finally {
      setSubmitting(false);
    }
  };

  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background pb-16 md:pb-0">
        <Header />
        <main className="pt-28 pb-20 md:pb-16">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <div className="glass rounded-xl p-8 max-w-md mx-auto">
              <Wallet className="w-12 h-12 text-primary mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Login to deposit</h1>
              <p className="text-muted-foreground mb-6">Sign in to add funds to your account.</p>
              <Button variant="neon" size="lg" className="gap-2" asChild>
                <Link to="/login">
                  <LogIn className="w-5 h-5" /> Sign in
                </Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />
      
      <main className="pt-28 pb-20 md:pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Add Funds</h1>
            <p className="text-muted-foreground">Quick, secure deposits with instant credit</p>
          </div>

          {/* Bonus Banner */}
          <div className="glass rounded-xl p-4 mb-8 bg-gradient-to-r from-neon-green/10 to-accent/10 border-neon-green/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Gift className="w-8 h-8 text-neon-green" />
                <div>
                  <p className="font-semibold">10% Deposit Bonus!</p>
                  <p className="text-sm text-muted-foreground">Minimum deposit ₹{contact.min_deposit}</p>
                </div>
              </div>
              {bonus > 0 && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">You'll get</p>
                  <p className="text-xl font-bold text-neon-green">+₹{bonus}</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step 1: Amount */}
              <div className="glass rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                    1
                  </div>
                  <h2 className="text-lg font-semibold">Enter Amount</h2>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-medium">₹</span>
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => handleAmountChange(Number(e.target.value))}
                      className="text-center text-3xl font-bold h-16 pl-8"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {quickAmounts.map((amt) => (
                      <Button
                        key={amt}
                        variant={amount === amt ? "default" : "outline"}
                        size="sm"
                        onClick={() => setAmount(amt)}
                      >
                        ₹{amt.toLocaleString()}
                      </Button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm pt-4 border-t border-border">
                    <span className="text-muted-foreground">Min: ₹{currentMethod?.minLimit.toLocaleString()}</span>
                    <span className="text-muted-foreground">Max: ₹{currentMethod?.maxLimit.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Step 2: Payment Method - Dropdown */}
              <div className="glass rounded-xl p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                    2
                  </div>
                  <h2 className="text-lg font-semibold">Select Payment Method</h2>
                </div>

                <select
                  value={selectedMethod}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-muted border border-border text-base font-medium focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                >
                  <option value="">-- Choose Payment Method --</option>
                  {paymentMethods.map((method) => (
                    <option key={method.id} value={method.id}>
                      {method.icon} {method.name} (₹{method.minLimit.toLocaleString()}-₹{method.maxLimit.toLocaleString()})
                    </option>
                  ))}
                </select>

                {selectedMethod && currentMethod && (
                  <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/30">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{currentMethod.icon}</span>
                      <div>
                        <p className="font-semibold">{currentMethod.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Limit: ₹{currentMethod.minLimit.toLocaleString()} - ₹{currentMethod.maxLimit.toLocaleString()}
                        </p>
                      </div>
                      <Check className="w-5 h-5 text-primary ml-auto" />
                    </div>
                  </div>
                )}
              </div>

              {/* Step 3: QR Code & Payment Details */}
              {selectedMethod && currentMethod?.hasQR && (
                <div className="glass rounded-xl p-4 sm:p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                      3
                    </div>
                    <h2 className="text-lg font-semibold">Scan QR Code & Pay</h2>
                  </div>

                  <div className="text-center">
                    {/* Payment Limit Notice */}
                    <div className="mb-4 p-3 bg-accent/10 rounded-lg border border-accent/30">
                      <p className="text-sm font-medium text-accent">
                        {currentMethod.name} Limit: ₹{currentMethod.minLimit.toLocaleString()} - ₹{currentMethod.maxLimit.toLocaleString()}
                      </p>
                    </div>
                    
                    {/* QR Code */}
                    <div className="w-40 h-40 sm:w-48 sm:h-48 mx-auto bg-white rounded-xl p-4 mb-4">
                      <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMSAyMSI+PHBhdGggZD0iTTEgMWg3djdIMXptMiAyaDN2M0gzem0xMi0yaDd2N2gtN3ptMiAyaDN2M2gtM3pNMSAxM2g3djdIMXptMiAyaDN2M0gzem0xMC0yaDJ2MmgtMnptMiAwaDJ2MmgtMnptMi0yaDJ2MmgtMnptMCAyaDJ2MmgtMnptMCAyaDJ2MmgtMnptLTQgMGgydjJoLTJ6bTIgMGgydjJoLTJ6bS00IDJoMnYyaC0yem0yIDBoMnYyaC0yem0yIDBoMnYyaC0yem0tMiAyaDJ2MmgtMnptMiAwaDJ2MmgtMnoiIGZpbGw9IiMwMDAiLz48L3N2Zz4=')] bg-contain bg-center bg-no-repeat" />
                    </div>
                    <p className="text-muted-foreground mb-2">
                      Scan with {currentMethod.name} app to pay ₹{amount.toLocaleString()}
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm mb-6">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">QR expires in 10:00</span>
                    </div>
                  </div>

                  {/* Transaction Code Input */}
                  <div className="border-t border-border pt-6 mb-6">
                    <div className="space-y-2">
                      <Label htmlFor="transactionCode" className="text-sm font-medium">
                        Transaction Code / Reference ID
                      </Label>
                      <Input
                        id="transactionCode"
                        placeholder="Enter transaction code from payment app"
                        value={transactionCode}
                        onChange={(e) => setTransactionCode(e.target.value)}
                        className="font-mono"
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter the transaction ID shown after completing payment
                      </p>
                    </div>
                  </div>

                  {/* Payment Screenshot Upload */}
                  <div className="border-t border-border pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-neon-green/20 flex items-center justify-center text-sm font-bold text-neon-green">
                        4
                      </div>
                      <div>
                        <h3 className="font-semibold">Upload Payment Screenshot</h3>
                        <p className="text-xs text-muted-foreground">After completing payment, upload proof</p>
                      </div>
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".png,.jpg,.jpeg,.pdf"
                      className="hidden"
                    />

                    {!uploadedFile ? (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full p-6 sm:p-8 border-2 border-dashed border-border rounded-xl hover:border-primary/50 transition-colors"
                      >
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Upload className="w-6 h-6 text-primary" />
                          </div>
                          <div className="text-center">
                            <p className="font-medium">Click to upload screenshot</p>
                            <p className="text-sm text-muted-foreground">PNG, JPG, or PDF (max 5MB)</p>
                          </div>
                        </div>
                      </button>
                    ) : (
                      <div className="p-4 bg-muted/30 rounded-xl">
                        <div className="flex items-center gap-4">
                          {uploadedPreview ? (
                            <img 
                              src={uploadedPreview} 
                              alt="Payment proof" 
                              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-lg flex items-center justify-center">
                              <FileText className="w-8 h-8 text-primary" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{uploadedFile.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(uploadedFile.size / 1024).toFixed(1)} KB
                            </p>
                            <div className="flex items-center gap-1 text-neon-green text-sm mt-1">
                              <Check className="w-4 h-4" />
                              <span>Ready to submit</span>
                            </div>
                          </div>
                          <button
                            onClick={removeUploadedFile}
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                          >
                            <X className="w-5 h-5 text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedMethod === "bank" && (
                <div className="glass rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                      3
                    </div>
                    <h2 className="text-lg font-semibold">Bank Transfer Details</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Bank Name</p>
                      <p className="font-medium">Nepal Investment Bank</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Account Name</p>
                      <p className="font-medium">KarnaliX Gaming Pvt. Ltd.</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Account Number</p>
                      <p className="font-medium font-mono">01234567890123</p>
                    </div>

                    <div className="p-4 bg-accent/10 rounded-lg border border-accent/30">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        <p className="text-sm">
                          Please include your username in the transfer remarks for faster processing.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Proceed Button */}
              <Button
                variant="neon"
                size="xl"
                className="w-full gap-2"
                disabled={submitting}
                onClick={handleSubmitDeposit}
              >
                {submitting ? "Submitting…" : <>Deposit ₹{amount.toLocaleString()}{bonus > 0 && <span className="text-xs">+₹{bonus} bonus</span>}</>}
                {!submitting && <ChevronRight className="w-5 h-5" />}
              </Button>

              {/* Instant Deposit via WhatsApp */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Or for instant processing</p>
                <a href={whatsAppLinks.deposit} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="lg" className="w-full gap-2 border-[#25D366] hover:bg-[#25D366]/10">
                    <MessageCircle className="w-5 h-5 text-[#25D366]" />
                    Instant Deposit via WhatsApp
                    <Zap className="w-4 h-4 text-accent" />
                  </Button>
                </a>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Summary */}
              <div className="glass rounded-xl p-6">
                <h3 className="font-semibold mb-4">Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deposit Amount</span>
                    <span className="font-mono">₹{amount.toLocaleString()}</span>
                  </div>
                  {bonus > 0 && (
                    <div className="flex justify-between text-neon-green">
                      <span>Bonus (10%)</span>
                      <span className="font-mono">+₹{bonus}</span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-border flex justify-between font-semibold">
                    <span>Total Credit</span>
                    <span className="font-mono text-lg">₹{(amount + bonus).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="glass rounded-xl p-6">
                <h3 className="font-semibold mb-4">Secure Payments</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-neon-green" />
                    <span>256-bit SSL Encryption</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-primary" />
                    <span>Instant Credit</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Wallet className="w-5 h-5 text-accent" />
                    <span>No Hidden Charges</span>
                  </div>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="glass rounded-xl p-6">
                <h3 className="font-semibold mb-4">Recent Transactions</h3>
                <div className="space-y-3">
                  {recentTransactions.slice(0, 3).map((tx, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium capitalize">{tx.type}</p>
                        <p className="text-xs text-muted-foreground">{tx.method}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-mono ${tx.type === "withdrawal" ? "text-neon-red" : "text-neon-green"}`}>
                          {tx.type === "withdrawal" ? "-" : "+"}₹{tx.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">{tx.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="w-full mt-4">
                  View All Transactions
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <MobileNav />
      <WhatsAppButton message="Hi! I want to deposit funds to my KarnaliX account." />
    </div>
  );
}
