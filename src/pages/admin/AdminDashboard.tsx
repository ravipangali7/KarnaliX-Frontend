import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/shared/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboard, getDeposits, getWithdrawals } from "@/api/admin";
import { Users, Wallet, TrendingUp, ArrowDownCircle, ArrowUpCircle, Gamepad2 } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";

interface AdminDashboardProps {
  role: "master" | "super" | "powerhouse";
}

const AdminDashboard = ({ role }: AdminDashboardProps) => {
  const { data: dashboard = {} } = useQuery({
    queryKey: ["admin-dashboard", role],
    queryFn: () => getDashboard(role),
  });
  const { data: deposits = [] } = useQuery({
    queryKey: ["admin-deposits", role],
    queryFn: () => getDeposits(role),
  });
  const { data: withdrawals = [] } = useQuery({
    queryKey: ["admin-withdrawals", role],
    queryFn: () => getWithdrawals(role),
  });
  const d = dashboard as Record<string, unknown>;
  const pendingDeposits = Number(d.pending_deposits) ?? 0;
  const pendingWithdrawals = Number(d.pending_withdrawals) ?? 0;
  const totalPlayers = Number(d.total_players) ?? 0;
  const totalBalance = String(d.total_balance ?? "0");
  const totalMasters = Number(d.total_masters) ?? 0;
  const totalSupers = Number(d.total_supers) ?? 0;
  const recentDeposits = (d.recent_deposits as Record<string, unknown>[]) ?? deposits.slice(0, 5);
  const recentWithdrawals = (d.recent_withdrawals as Record<string, unknown>[]) ?? withdrawals.slice(0, 5);
  const depList = Array.isArray(recentDeposits) && recentDeposits.length > 0 ? recentDeposits : (deposits as Record<string, unknown>[]).slice(0, 5);
  const wdList = Array.isArray(recentWithdrawals) && recentWithdrawals.length > 0 ? recentWithdrawals : (withdrawals as Record<string, unknown>[]).slice(0, 5);

  return (
    <div className="space-y-4">
      <h2 className="font-display font-bold text-xl">
        {role === "powerhouse" ? "Platform Overview" : role === "super" ? "Super Dashboard" : "Master Dashboard"}
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="Total Players" value={totalPlayers} icon={Users} />
        <StatCard title="Total Balance" value={`₹${(Number(totalBalance) / 1000).toFixed(0)}K`} icon={Wallet} />
        <StatCard title="Pending Deposits" value={pendingDeposits} icon={ArrowDownCircle} />
        <StatCard title="Pending Withdrawals" value={pendingWithdrawals} icon={ArrowUpCircle} />
      </div>

      {(role === "super" || role === "powerhouse") && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="Masters" value={totalMasters} icon={Users} />
          {role === "powerhouse" && <StatCard title="Supers" value={totalSupers} icon={Users} />}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-display">Recent Deposits</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-2">
            {depList.map((d) => (
              <div key={String(d.id ?? d)} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium">{String(d.username ?? d.user_username ?? "-")}</p>
                  <p className="text-[10px] text-muted-foreground">{String(d.payment_mode ?? "-")}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">₹{Number(d.amount ?? 0).toLocaleString()}</p>
                  <StatusBadge status={String(d.status ?? "pending")} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-display">Recent Withdrawals</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-2">
            {wdList.map((w) => (
              <div key={String(w.id ?? w)} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium">{String(w.username ?? w.user_username ?? "-")}</p>
                  <p className="text-[10px] text-muted-foreground">{String(w.payment_mode ?? "-")}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">₹{Number(w.amount ?? 0).toLocaleString()}</p>
                  <StatusBadge status={String(w.status ?? "pending")} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
