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
  Loader2,
} from "lucide-react";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  method: string;
  date: string;
  status: string;
  reference?: string;
}

interface WalletSectionProps {
  walletBalance: number;
  onRequestWithdraw: () => void;
}

export function WalletSection({ walletBalance, onRequestWithdraw }: WalletSectionProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [totalWithdrawals, setTotalWithdrawals] = useState(0);
  const [exporting, setExporting] = useState(false);
  const itemsPerPage = 5;

  const handleExport = async () => {
    try {
      setExporting(true);
      const blob = await apiClient.exportTransactions();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'transactions.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await apiClient.getTransactions();
        
        // Map API response to Transaction format
        const mappedTransactions: Transaction[] = (data || []).map((t: any) => {
          // Map transaction type to display type
          let displayType = t.type;
          if (t.type === 'bet' && parseFloat(t.amount) < 0) displayType = 'bet_loss';
          if (t.type === 'win') displayType = 'bet_win';
          
          return {
            id: String(t.id),
            type: displayType,
            amount: parseFloat(t.amount),
            method: t.method || t.type,
            date: new Date(t.created_at).toLocaleString(),
            status: t.status === 'completed' ? 'success' : t.status,
            reference: t.reference || undefined,
          };
        });
        
        setTransactions(mappedTransactions);
        
        // Calculate totals
        const deposits = mappedTransactions
          .filter(t => t.type === 'deposit' && t.status === 'success')
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const withdrawals = mappedTransactions
          .filter(t => t.type === 'withdrawal' && t.status === 'success')
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        setTotalDeposits(deposits);
        setTotalWithdrawals(withdrawals);
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter((t) => {
    if (filter !== "all" && t.type !== filter) return false;
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
      case "win":
        return <ArrowUpRight className="w-4 h-4 text-neon-green" />;
      case "bet_loss":
      case "bet":
        return <ArrowDownRight className="w-4 h-4 text-neon-red" />;
      case "transfer":
        return <CreditCard className="w-4 h-4 text-primary" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
      case "completed":
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
      case "cancelled":
        return (
          <span className="flex items-center gap-1 text-xs text-neon-red bg-neon-red/10 px-2 py-1 rounded-full">
            <X className="w-3 h-3" /> {status === 'cancelled' ? 'Cancelled' : 'Failed'}
          </span>
        );
      default:
        return null;
    }
  };

  const isPositiveAmount = (type: string) => {
    return ['deposit', 'bonus', 'bet_win', 'win', 'refund'].includes(type) || 
           (type === 'transfer' && true); // Transfers can be positive or negative
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
            ₹{totalDeposits.toLocaleString()}
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
          <p className="text-lg sm:text-2xl font-bold font-mono">
            ₹{totalWithdrawals.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">All time</p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="glass rounded-xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
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
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 px-3 rounded-lg bg-muted border border-border text-sm"
            >
              <option value="all">All Types</option>
              <option value="deposit">Deposits</option>
              <option value="withdrawal">Withdrawals</option>
              <option value="bonus">Bonuses</option>
              <option value="bet_win">Wins</option>
              <option value="bet_loss">Losses</option>
              <option value="transfer">Transfers</option>
            </select>
            <Button variant="outline" size="sm" className="gap-1" onClick={handleExport} disabled={exporting}>
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span className="hidden sm:inline">{exporting ? "Exporting..." : "Export"}</span>
            </Button>
          </div>
        </div>

        {/* Transactions Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No transactions found</p>
            <Link to="/deposit" className="text-primary text-sm hover:underline">Make your first deposit</Link>
          </div>
        ) : (
          <>
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
                            isPositiveAmount(t.type) && t.amount > 0
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
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let page;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8"
                      >
                        {page}
                      </Button>
                    );
                  })}
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
