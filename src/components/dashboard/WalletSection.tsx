import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import apiClient from "@/lib/api";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Download,
  Search,
  CreditCard,
  Clock,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Transaction {
  id: string;
  type: "deposit" | "withdrawal" | "bonus" | "bet_win" | "bet_loss";
  amount: number;
  method: string;
  date: string;
  status: "success" | "pending" | "failed";
  reference?: string;
}

function mapApiTransaction(item: any): Transaction {
  const rawType = String(item.transaction_type || item.type || "deposit").toUpperCase();
  const amount = typeof item.amount === "string" ? parseFloat(item.amount) : Number(item.amount) ?? 0;
  let type: Transaction["type"];
  if (rawType === "DEPOSIT") type = "deposit";
  else if (rawType === "WITHDRAW") type = "withdrawal";
  else if (rawType === "BONUS") type = "bonus";
  else if (rawType === "BET_SETTLED") type = amount >= 0 ? "bet_win" : "bet_loss";
  else if (rawType === "BET_PLACED") type = "bet_loss";
  else type = "deposit";
  const statusMap: Record<string, Transaction["status"]> = {
    success: "success",
    completed: "success",
    approved: "success",
    pending: "pending",
    failed: "failed",
    rejected: "failed",
  };
  const status = statusMap[String(item.status || "success").toLowerCase()] ?? "success";
  const date = item.created_at || item.date || "";
  const method = item.remarks || item.payment_mode || item.method || item.description || type;
  return {
    id: String(item.id),
    type,
    amount: type === "withdrawal" || type === "bet_loss" ? -Math.abs(amount) : Math.abs(amount),
    method,
    date: date ? new Date(date).toLocaleString() : "",
    status,
    reference: item.reference || item.reference_id,
  };
}

const TRANSACTION_TABS = [
  { id: "all", label: "All", typeParam: undefined },
  { id: "deposit", label: "Deposit", typeParam: "DEPOSIT" },
  { id: "withdraw", label: "Withdraw", typeParam: "WITHDRAW" },
  { id: "bonus", label: "Bonus", typeParam: "BONUS" },
  { id: "win", label: "Win", typeParam: "WIN" },
  { id: "loss", label: "Loss", typeParam: "LOSS" },
] as const;

interface WalletSectionProps {
  walletBalance: number;
  totalDeposit?: string;
  totalWithdraw?: string;
  onRequestWithdraw: () => void;
}

export function WalletSection({
  walletBalance,
  totalDeposit = "0",
  totalWithdraw = "0",
  onRequestWithdraw,
}: WalletSectionProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<typeof TRANSACTION_TABS[number]["id"]>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError(null);
        const tab = TRANSACTION_TABS.find((t) => t.id === activeTab);
        const params: Record<string, string> = { page_size: "100" };
        if (tab?.typeParam) params.type = tab.typeParam;
        const res = await apiClient.getUserTransactions(Object.keys(params).length ? params : undefined);
        const list = res?.transactions?.results ?? res?.results ?? (Array.isArray(res) ? res : []);
        setTransactions((Array.isArray(list) ? list : []).map(mapApiTransaction));
        setCurrentPage(1);
      } catch (err: any) {
        setError(err?.message ?? "Failed to load transactions");
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [activeTab]);

  const filteredTransactions = transactions.filter((t) => {
    if (searchQuery && !t.method.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownRight className="w-4 h-4 text-neon-green" />;
      case "withdrawal":
        return <ArrowUpRight className="w-4 h-4 text-neon-red" />;
      case "bonus":
        return <CreditCard className="w-4 h-4 text-accent" />;
      case "bet_win":
        return <ArrowUpRight className="w-4 h-4 text-neon-green" />;
      case "bet_loss":
        return <ArrowDownRight className="w-4 h-4 text-neon-red" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <span className="flex items-center gap-1 text-xs text-neon-green bg-neon-green/10 px-2 py-1 rounded-full">
            <Check className="w-3 h-3" /> Success
          </span>
        );
      case "pending":
        return (
          <span className="flex items-center gap-1 text-xs text-accent bg-accent/10 px-2 py-1 rounded-full">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case "failed":
        return (
          <span className="flex items-center gap-1 text-xs text-neon-red bg-neon-red/10 px-2 py-1 rounded-full">
            <X className="w-3 h-3" /> Failed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Balance Cards */}
      <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="glass rounded-xl p-4 sm:p-6 bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Available Balance</p>
              <p className="text-xl sm:text-3xl font-bold font-mono">₹{walletBalance.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/deposit" className="flex-1">
              <Button variant="neon" size="sm" className="w-full gap-1 text-xs sm:text-sm">
                <Plus className="w-4 h-4" /> Add Funds
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 gap-1 text-xs sm:text-sm"
              onClick={onRequestWithdraw}
            >
              <ArrowUpRight className="w-4 h-4" /> Withdraw
            </Button>
          </div>
        </div>

        <div className="glass rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-neon-green/20 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5 text-neon-green" />
            </div>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Deposits</p>
          <p className="text-lg sm:text-2xl font-bold font-mono text-neon-green">
            ₹{Number(totalDeposit).toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">All time</p>
        </div>

        <div className="glass rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-neon-red/20 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-neon-red" />
            </div>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Withdrawals</p>
          <p className="text-lg sm:text-2xl font-bold font-mono text-neon-red">
            ₹{Number(totalWithdraw).toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">All time</p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="glass rounded-xl p-4 sm:p-6">
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">Transaction History</h2>
            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 w-full sm:w-40"
                />
              </div>
              <Button variant="outline" size="sm" className="gap-1">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-1 border-b border-border pb-2">
            {TRANSACTION_TABS.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className="rounded-lg"
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          </div>
        ) : error ? (
          <p className="text-center py-8 text-muted-foreground">{error}</p>
        ) : filteredTransactions.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">No transactions found.</p>
        ) : (
        <>
        {/* Transactions Table */}
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Type</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Method/Game</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Date</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Status</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Amount</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTransactions.map((t) => (
                <tr key={t.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        t.type.includes("win") || t.type === "deposit" || t.type === "bonus"
                          ? "bg-neon-green/10"
                          : "bg-neon-red/10"
                      }`}>
                        {getTypeIcon(t.type)}
                      </div>
                      <span className="capitalize text-sm">{t.type.replace("_", " ")}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm">{t.method}</p>
                    {t.reference && (
                      <p className="text-xs text-muted-foreground font-mono">{t.reference}</p>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{t.date}</td>
                  <td className="py-3 px-4">{getStatusBadge(t.status)}</td>
                  <td className={`py-3 px-4 text-right font-mono font-medium ${
                    t.amount > 0 ? "text-neon-green" : "text-neon-red"
                  }`}>
                    {t.amount > 0 ? "+" : ""}₹{Math.abs(t.amount).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1}-
              {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of{" "}
              {filteredTransactions.length}
            </p>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="w-8"
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
}
