import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { WhatsAppButton, whatsAppLinks } from "@/components/layout/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Wallet, 
  Shield,
  Clock,
  Gift,
  ChevronRight,
  Check,
  AlertCircle,
  MessageCircle,
  Zap,
  Upload,
  FileText,
  X,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/api";

interface PaymentMethod {
  id: number;
  name: string;
  icon: string;
  minLimit: number;
  maxLimit: number;
  hasQr: boolean;
  isActive: boolean;
}

interface Transaction {
  id: number;
  type: string;
  amount: number;
  method: string;
  date: string;
  status: string;
}

const quickAmounts = [500, 1000, 2000, 5000, 10000, 25000];

// Fallback payment methods
const fallbackMethods: PaymentMethod[] = [
  { id: 1, name: "eSewa", icon: "💳", minLimit: 500, maxLimit: 25000, hasQr: true, isActive: true },
  { id: 2, name: "Khalti", icon: "📱", minLimit: 100, maxLimit: 50000, hasQr: true, isActive: true },
  { id: 3, name: "Bank QR Code", icon: "📷", minLimit: 500, maxLimit: 100000, hasQr: true, isActive: true },
  { id: 4, name: "Bank Transfer", icon: "🏦", minLimit: 1000, maxLimit: 100000, hasQr: false, isActive: true },
  { id: 5, name: "UPI", icon: "📲", minLimit: 100, maxLimit: 100000, hasQr: false, isActive: true },
];

interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
}

export default function Deposit() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    bankName: 'Nepal Investment Bank',
    accountName: 'KarnaliX Gaming Pvt. Ltd.',
    accountNumber: '01234567890123',
  });

  const [selectedMethodId, setSelectedMethodId] = useState<number | null>(null);
  const [amount, setAmount] = useState(1000);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [transactionCode, setTransactionCode] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentMethod = paymentMethods.find(m => m.id === selectedMethodId);

  useEffect(() => {
    fetchPaymentMethods();
    fetchRecentTransactions();
    fetchBankDetails();
  }, []);

  const fetchBankDetails = async () => {
    try {
      const config = await apiClient.getSystemConfig('payment');
      if (config && Array.isArray(config)) {
        const bankName = config.find((c: any) => c.key === 'bank_name')?.value;
        const accountName = config.find((c: any) => c.key === 'bank_account_name')?.value;
        const accountNumber = config.find((c: any) => c.key === 'bank_account_number')?.value;
        
        setBankDetails({
          bankName: bankName || 'Nepal Investment Bank',
          accountName: accountName || 'KarnaliX Gaming Pvt. Ltd.',
          accountNumber: accountNumber || '01234567890123',
        });
      }
    } catch (error) {
      // Use default bank details
      console.error("Failed to fetch bank details:", error);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const data = await apiClient.getPaymentMethods();
      const mapped = data.map((m: any) => ({
        id: m.id,
        name: m.name,
        icon: m.icon || "💳",
        minLimit: Number(m.min_limit) || 100,
        maxLimit: Number(m.max_limit) || 100000,
        hasQr: m.has_qr ?? true,
        isActive: m.is_active ?? true,
      }));
      setPaymentMethods(mapped.length > 0 ? mapped.filter((m: PaymentMethod) => m.isActive) : fallbackMethods);
    } catch (error) {
      console.error("Failed to fetch payment methods:", error);
      setPaymentMethods(fallbackMethods);
    } finally {
      setLoadingMethods(false);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const data = await apiClient.getTransactions({ limit: 5 });
      const mapped = (data || []).slice(0, 5).map((t: any) => {
        const createdAt = new Date(t.created_at);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
        let dateStr = "";
        if (diffDays === 0) dateStr = "Today";
        else if (diffDays === 1) dateStr = "Yesterday";
        else if (diffDays < 7) dateStr = `${diffDays} days ago`;
        else dateStr = createdAt.toLocaleDateString();

        return {
          id: t.id,
          type: t.type || "deposit",
          amount: Number(t.amount) || 0,
          method: t.method || "Unknown",
          date: dateStr,
          status: t.status || "completed",
        };
      });
      setRecentTransactions(mapped);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      setRecentTransactions([]);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleAmountChange = (value: number) => {
    const min = currentMethod?.minLimit || 100;
    const max = currentMethod?.maxLimit || 100000;
    setAmount(Math.max(min, Math.min(max, value)));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload PNG, JPG, or PDF file only');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setUploadedFile(file);
      
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

  const handleDeposit = async () => {
    if (!selectedMethodId) {
      toast.error("Please select a payment method");
      return;
    }
    if (!transactionCode) {
      toast.error("Please enter the transaction code");
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.createDeposit({
        payment_method: selectedMethodId,
        amount: amount,
        transaction_code: transactionCode,
      });
      toast.success("Deposit request submitted! We'll verify and credit your account shortly.");
      // Reset form
      setTransactionCode("");
      setUploadedFile(null);
      setUploadedPreview(null);
      fetchRecentTransactions();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit deposit request");
    } finally {
      setSubmitting(false);
    }
  };

  const bonus = amount >= 500 ? Math.floor(amount * 0.1) : 0;

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
                  <p className="text-sm text-muted-foreground">Minimum deposit ₹500</p>
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

                  {currentMethod && (
                    <div className="flex items-center justify-between text-sm pt-4 border-t border-border">
                      <span className="text-muted-foreground">Min: ₹{currentMethod.minLimit.toLocaleString()}</span>
                      <span className="text-muted-foreground">Max: ₹{currentMethod.maxLimit.toLocaleString()}</span>
                    </div>
                  )}
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

                {loadingMethods ? (
                  <Skeleton className="h-12 w-full rounded-xl" />
                ) : (
                  <select
                    value={selectedMethodId || ""}
                    onChange={(e) => setSelectedMethodId(e.target.value ? Number(e.target.value) : null)}
                    className="w-full h-12 px-4 rounded-xl bg-muted border border-border text-base font-medium focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  >
                    <option value="">-- Choose Payment Method --</option>
                    {paymentMethods.map((method) => (
                      <option key={method.id} value={method.id}>
                        {method.icon} {method.name} (₹{method.minLimit.toLocaleString()}-₹{method.maxLimit.toLocaleString()})
                      </option>
                    ))}
                  </select>
                )}

                {selectedMethodId && currentMethod && (
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
              {selectedMethodId && currentMethod?.hasQr && (
                <div className="glass rounded-xl p-4 sm:p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                      3
                    </div>
                    <h2 className="text-lg font-semibold">Scan QR Code & Pay</h2>
                  </div>

                  <div className="text-center">
                    <div className="mb-4 p-3 bg-accent/10 rounded-lg border border-accent/30">
                      <p className="text-sm font-medium text-accent">
                        {currentMethod.name} Limit: ₹{currentMethod.minLimit.toLocaleString()} - ₹{currentMethod.maxLimit.toLocaleString()}
                      </p>
                    </div>
                    
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

              {selectedMethodId && currentMethod && !currentMethod.hasQr && (
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
                      <p className="font-medium">{bankDetails.bankName}</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Account Name</p>
                      <p className="font-medium">{bankDetails.accountName}</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Account Number</p>
                      <p className="font-medium font-mono">{bankDetails.accountNumber}</p>
                    </div>

                    <div className="p-4 bg-accent/10 rounded-lg border border-accent/30">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        <p className="text-sm">
                          Please include your username in the transfer remarks for faster processing.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bankTxCode" className="text-sm font-medium">
                        Transaction Reference
                      </Label>
                      <Input
                        id="bankTxCode"
                        placeholder="Enter bank transaction reference"
                        value={transactionCode}
                        onChange={(e) => setTransactionCode(e.target.value)}
                        className="font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Proceed Button */}
              <Button 
                variant="neon" 
                size="xl" 
                className="w-full gap-2"
                onClick={handleDeposit}
                disabled={submitting || !selectedMethodId}
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Deposit ₹{amount.toLocaleString()}
                    {bonus > 0 && <span className="text-xs">+₹{bonus} bonus</span>}
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
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
                {loadingTransactions ? (
                  <div className="space-y-3">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : recentTransactions.length > 0 ? (
                  <div className="space-y-3">
                    {recentTransactions.slice(0, 3).map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between text-sm">
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
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No recent transactions</p>
                )}
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="w-full mt-4">
                    View All Transactions
                  </Button>
                </Link>
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
