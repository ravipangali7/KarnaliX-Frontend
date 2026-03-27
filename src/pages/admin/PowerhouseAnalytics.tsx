import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import {
  TrendingUp, TrendingDown, Users, Gamepad2, Wallet,
  ArrowDownCircle, ArrowUpCircle, Activity, BarChart2, Search,
} from "lucide-react";
import {
  getAnalyticsOverview, getAnalyticsGames, getAnalyticsFinance,
  getAnalyticsCustomers, getAnalyticsUser, getPlayers,
  type AnalyticsDateRange,
} from "@/api/admin";

// ── Helpers ───────────────────────────────────────────────────────────────────

const PIE_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6", "#f97316", "#ec4899"];

const fmt = (v: string | number | undefined | null, prefix = "₹") =>
  `${prefix}${Number(v || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const fmtNum = (v: string | number | undefined | null) =>
  Number(v || 0).toLocaleString("en-IN");

function plColor(val: string | number) {
  return Number(val) >= 0 ? "text-green-500" : "text-destructive";
}

// ── Date Range Controls ───────────────────────────────────────────────────────

type Preset = "7d" | "30d" | "90d" | "custom";

function useDateRange(defaultDays = 30) {
  const today = new Date().toISOString().slice(0, 10);
  const defaultFrom = new Date(Date.now() - defaultDays * 86400_000).toISOString().slice(0, 10);
  const [preset, setPreset] = useState<Preset>("30d");
  const [customFrom, setCustomFrom] = useState(defaultFrom);
  const [customTo, setCustomTo] = useState(today);

  const range: AnalyticsDateRange = useMemo(() => {
    const to = today;
    if (preset === "7d") return { date_from: new Date(Date.now() - 7 * 86400_000).toISOString().slice(0, 10), date_to: to };
    if (preset === "30d") return { date_from: new Date(Date.now() - 30 * 86400_000).toISOString().slice(0, 10), date_to: to };
    if (preset === "90d") return { date_from: new Date(Date.now() - 90 * 86400_000).toISOString().slice(0, 10), date_to: to };
    return { date_from: customFrom, date_to: customTo };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset, customFrom, customTo]);

  return { preset, setPreset, customFrom, setCustomFrom, customTo, setCustomTo, range };
}

function DateRangeBar({
  preset, setPreset, customFrom, setCustomFrom, customTo, setCustomTo,
}: {
  preset: Preset; setPreset: (p: Preset) => void;
  customFrom: string; setCustomFrom: (v: string) => void;
  customTo: string; setCustomTo: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {(["7d", "30d", "90d"] as Preset[]).map((p) => (
        <Button key={p} size="sm" variant={preset === p ? "default" : "outline"} onClick={() => setPreset(p)}>
          {p === "7d" ? "7 Days" : p === "30d" ? "30 Days" : "90 Days"}
        </Button>
      ))}
      <Button size="sm" variant={preset === "custom" ? "default" : "outline"} onClick={() => setPreset("custom")}>
        Custom
      </Button>
      {preset === "custom" && (
        <>
          <Input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="w-36 h-8 text-xs" />
          <span className="text-muted-foreground text-xs">to</span>
          <Input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="w-36 h-8 text-xs" />
        </>
      )}
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  title, value, sub, icon: Icon, colorClass,
}: {
  title: string; value: string | number; sub?: string;
  icon?: React.ElementType; colorClass?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground truncate">{title}</p>
            <p className={`text-lg font-bold truncate ${colorClass ?? "text-foreground"}`}>{value}</p>
            {sub && <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{sub}</p>}
          </div>
          {Icon && <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Simple Table ──────────────────────────────────────────────────────────────

function SimpleTable({ headers, rows }: { headers: string[]; rows: (string | number | React.ReactNode)[][] }) {
  if (!rows.length) return <p className="text-sm text-muted-foreground py-4 text-center">No data</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {headers.map((h) => (
              <th key={h} className="text-left py-2 px-3 text-xs text-muted-foreground font-medium whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
              {row.map((cell, j) => (
                <td key={j} className="py-2 px-3 text-xs whitespace-nowrap">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Tab 1: Overview ───────────────────────────────────────────────────────────

function OverviewTab() {
  const dr = useDateRange(30);
  const { data, isLoading } = useQuery({
    queryKey: ["analytics-overview", dr.range],
    queryFn: () => getAnalyticsOverview(dr.range),
  });

  const s = data?.summary;
  const daily = data?.daily ?? [];

  const chartData = daily.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
    deposits: Number(d.deposits),
    withdrawals: Number(d.withdrawals),
    pl: Number(d.platform_pl),
    newPlayers: Number(d.new_players ?? 0),
  }));

  return (
    <div className="space-y-4">
      <DateRangeBar {...dr} />

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <StatCard title="Revenue (Net)" value={fmt(s?.revenue)} icon={TrendingUp} colorClass={plColor(s?.revenue ?? 0)} />
            <StatCard title="Platform P/L" value={fmt(s?.platform_pl)} icon={BarChart2} colorClass={plColor(s?.platform_pl ?? 0)} />
            <StatCard title="Total Bets" value={fmtNum(s?.total_bets)} sub={fmt(s?.total_bet_amount)} icon={Gamepad2} />
            <StatCard title="Total Deposits" value={fmt(s?.total_deposits)} sub={`${fmtNum(s?.deposits_count)} txns`} icon={ArrowDownCircle} />
            <StatCard title="Total Withdrawals" value={fmt(s?.total_withdrawals)} sub={`${fmtNum(s?.withdrawals_count)} txns`} icon={ArrowUpCircle} />
            <StatCard title="Active Users" value={fmtNum(s?.active_users)} icon={Activity} />
            <StatCard title="New Players" value={fmtNum(s?.new_players)} sub={`of ${fmtNum(s?.total_players)} total`} icon={Users} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Daily Deposits vs Withdrawals</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v) => fmt(v as number)} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="deposits" name="Deposits" fill="#22c55e" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="withdrawals" name="Withdrawals" fill="#ef4444" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Daily Platform P/L</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v) => fmt(v as number)} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                    <Line dataKey="pl" name="Platform P/L" stroke="#6366f1" dot={false} strokeWidth={2} />
                    <Line dataKey="newPlayers" name="New Players" stroke="#f59e0b" dot={false} strokeWidth={1.5} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

// ── Tab 2: Game Analytics ─────────────────────────────────────────────────────

function GameAnalyticsTab() {
  const dr = useDateRange(30);
  const { data, isLoading } = useQuery({
    queryKey: ["analytics-games", dr.range],
    queryFn: () => getAnalyticsGames(dr.range),
  });

  const topGames = data?.top_games ?? [];
  const providers = data?.providers ?? [];
  const categories = data?.categories ?? [];
  const daily = data?.daily ?? [];

  const chartData = daily.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
    bets: d.bets,
    bet_amount: Number(d.bet_amount),
    pl: Number(d.platform_pl),
  }));

  const topGamesChart = topGames.slice(0, 10).map((g) => ({
    name: g.game_name.length > 14 ? g.game_name.slice(0, 14) + "…" : g.game_name,
    bet_amount: Number(g.bet_amount),
    pl: Number(g.platform_pl),
  }));

  return (
    <div className="space-y-4">
      <DateRangeBar {...dr} />

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Top 10 Games by Bet Volume</CardTitle>
              </CardHeader>
              <CardContent>
                {topGamesChart.length ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={topGamesChart} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" tick={{ fontSize: 10 }} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} width={90} />
                      <Tooltip formatter={(v) => fmt(v as number)} />
                      <Bar dataKey="bet_amount" name="Bet Amount" fill="#6366f1" radius={[0, 2, 2, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-sm text-muted-foreground py-6 text-center">No data</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Provider Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {providers.length ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={providers.slice(0, 8)}
                        dataKey="bet_amount"
                        nameKey="provider_name"
                        cx="50%" cy="50%" outerRadius={90}
                        label={({ provider_name, percent }) => `${provider_name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {providers.slice(0, 8).map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => fmt(v as number)} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p className="text-sm text-muted-foreground py-6 text-center">No data</p>}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Daily Bet Volume & P/L</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v) => fmt(v as number)} />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                  <Line dataKey="bet_amount" name="Bet Amount" stroke="#6366f1" dot={false} strokeWidth={2} />
                  <Line dataKey="pl" name="Platform P/L" stroke="#22c55e" dot={false} strokeWidth={1.5} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Top Games</CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleTable
                  headers={["Game", "Provider", "Bets", "Bet Amount", "P/L", "Players"]}
                  rows={topGames.slice(0, 10).map((g) => [
                    g.game_name,
                    g.provider,
                    fmtNum(g.bet_count),
                    fmt(g.bet_amount),
                    <span key="pl" className={plColor(g.platform_pl)}>{fmt(g.platform_pl)}</span>,
                    fmtNum(g.unique_players),
                  ])}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleTable
                  headers={["Category", "Bets", "Bet Amount", "Platform P/L"]}
                  rows={categories.map((c) => [
                    c.category_name,
                    fmtNum(c.bet_count),
                    fmt(c.bet_amount),
                    <span key="pl" className={plColor(c.platform_pl)}>{fmt(c.platform_pl)}</span>,
                  ])}
                />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

// ── Tab 3: Finance & P/L ─────────────────────────────────────────────────────

function FinanceTab() {
  const dr = useDateRange(30);
  const { data, isLoading } = useQuery({
    queryKey: ["analytics-finance", dr.range],
    queryFn: () => getAnalyticsFinance(dr.range),
  });

  const s = data?.summary;
  const daily = data?.daily ?? [];

  const chartData = daily.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
    deposits: Number(d.deposits),
    withdrawals: Number(d.withdrawals),
    pl: Number(d.platform_pl),
    running_pl: Number(d.running_pl ?? 0),
  }));

  return (
    <div className="space-y-4">
      <DateRangeBar {...dr} />

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard title="Total Deposits" value={fmt(s?.total_deposits)} sub={`${fmtNum(s?.deposits_count)} txns`} icon={ArrowDownCircle} colorClass="text-green-500" />
            <StatCard title="Total Withdrawals" value={fmt(s?.total_withdrawals)} sub={`${fmtNum(s?.withdrawals_count)} txns`} icon={ArrowUpCircle} colorClass="text-destructive" />
            <StatCard title="Net Cash" value={fmt(s?.net_cash)} icon={Wallet} colorClass={plColor(s?.net_cash ?? 0)} />
            <StatCard title="Platform P/L" value={fmt(s?.platform_pl)} icon={TrendingUp} colorClass={plColor(s?.platform_pl ?? 0)} />
            <StatCard title="Bonus Given" value={fmt(s?.bonus_given)} sub={`${fmtNum(s?.bonus_count)} txns`} icon={TrendingDown} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Daily Deposits vs Withdrawals</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v) => fmt(v as number)} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="deposits" name="Deposits" fill="#22c55e" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="withdrawals" name="Withdrawals" fill="#ef4444" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Running Platform P/L</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v) => fmt(v as number)} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                    <Line dataKey="running_pl" name="Running P/L" stroke="#6366f1" dot={false} strokeWidth={2} />
                    <Line dataKey="pl" name="Daily P/L" stroke="#f59e0b" dot={false} strokeWidth={1.5} strokeDasharray="4 2" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Top 10 Depositors</CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleTable
                  headers={["#", "Username", "Name", "Total", "Txns"]}
                  rows={(data?.top_depositors ?? []).map((u, i) => [
                    i + 1,
                    u.username,
                    u.name || "—",
                    <span key="t" className="text-green-500 font-medium">{fmt(u.total)}</span>,
                    u.count,
                  ])}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Top 10 Withdrawers</CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleTable
                  headers={["#", "Username", "Name", "Total", "Txns"]}
                  rows={(data?.top_withdrawers ?? []).map((u, i) => [
                    i + 1,
                    u.username,
                    u.name || "—",
                    <span key="t" className="text-destructive font-medium">{fmt(u.total)}</span>,
                    u.count,
                  ])}
                />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

// ── Tab 4: Customer Behaviour ─────────────────────────────────────────────────

function CustomerTab() {
  const dr = useDateRange(30);
  const { data, isLoading } = useQuery({
    queryKey: ["analytics-customers", dr.range],
    queryFn: () => getAnalyticsCustomers(dr.range),
  });

  const s = data?.summary;
  const daily = data?.daily ?? [];

  const chartData = daily.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
    active_users: Number(d.active_users ?? 0),
    logins: Number(d.logins ?? 0),
    new_reg: Number(d.new_registrations ?? 0),
  }));

  const devices = data?.devices ?? [];
  const actions = data?.action_distribution ?? [];

  return (
    <div className="space-y-4">
      <DateRangeBar {...dr} />

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard title="Unique Active Users" value={fmtNum(s?.unique_active_users)} icon={Users} />
            <StatCard title="Total Logins" value={fmtNum(s?.total_logins)} icon={Activity} />
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Daily Active Users & Logins</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                  <Line dataKey="active_users" name="Active Users" stroke="#6366f1" dot={false} strokeWidth={2} />
                  <Line dataKey="logins" name="Logins" stroke="#22c55e" dot={false} strokeWidth={1.5} />
                  <Line dataKey="new_reg" name="New Registrations" stroke="#f59e0b" dot={false} strokeWidth={1.5} strokeDasharray="4 2" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Top 10 Players by Bet Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  <SimpleTable
                    headers={["#", "Username", "Name", "Bets", "Bet Amount", "Win Amount", "Platform P/L"]}
                    rows={(data?.top_bettors ?? []).map((b, i) => [
                      i + 1,
                      b.username,
                      b.name || "—",
                      fmtNum(b.bet_count),
                      fmt(b.bet_amount),
                      fmt(b.win_amount),
                      <span key="pl" className={plColor(b.platform_pl)}>{fmt(b.platform_pl)}</span>,
                    ])}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Device Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  {devices.length ? (
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie data={devices} dataKey="count" nameKey="device" cx="50%" cy="50%" outerRadius={65} label={({ device, percent }) => `${(device as string).slice(0, 12)} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                          {devices.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <p className="text-sm text-muted-foreground py-4 text-center">No data</p>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Activity Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5">
                  {actions.map((a) => (
                    <div key={a.action} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground capitalize">{a.action.replace(/_/g, " ")}</span>
                      <Badge variant="secondary">{fmtNum(a.count)}</Badge>
                    </div>
                  ))}
                  {!actions.length && <p className="text-muted-foreground text-xs py-2">No data</p>}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Tab 5: User Analytics ─────────────────────────────────────────────────────

function UserAnalyticsTab() {
  const dr = useDateRange(30);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const { data: players = [] } = useQuery({
    queryKey: ["analytics-players"],
    queryFn: () => getPlayers("powerhouse"),
    staleTime: 60_000,
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return (players as Record<string, unknown>[]).slice(0, 20);
    const q = search.toLowerCase();
    return (players as Record<string, unknown>[])
      .filter((p) =>
        String(p.username || "").toLowerCase().includes(q) ||
        String(p.name || "").toLowerCase().includes(q)
      )
      .slice(0, 20);
  }, [players, search]);

  const selectedPlayer = (players as Record<string, unknown>[]).find((p) => Number(p.id) === selectedId);

  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["analytics-user", selectedId, dr.range],
    queryFn: () => getAnalyticsUser(selectedId!, dr.range),
    enabled: selectedId != null,
  });

  const handleSelect = useCallback((p: Record<string, unknown>) => {
    setSelectedId(Number(p.id));
    setSearch(String(p.username || ""));
    setShowDropdown(false);
  }, []);

  const dailyChart = (userData?.daily ?? []).map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
    bets: d.bets,
    bet_amount: Number(d.bet_amount),
    win_amount: Number(d.win_amount),
    pl: Number(d.pl),
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-72">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            className="pl-8 h-9"
            placeholder="Search player by username or name…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setShowDropdown(true); }}
            onFocus={() => setShowDropdown(true)}
          />
          {showDropdown && filtered.length > 0 && (
            <div className="absolute z-10 top-full mt-1 w-full bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {filtered.map((p) => (
                <button
                  key={String(p.id)}
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted/60 transition-colors flex items-center gap-2"
                  onMouseDown={() => handleSelect(p)}
                >
                  <span className="font-medium">{String(p.username)}</span>
                  {p.name && <span className="text-muted-foreground text-xs">{String(p.name)}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
        <DateRangeBar {...dr} />
      </div>

      {!selectedId && (
        <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
          Search and select a player to view their analytics
        </div>
      )}

      {selectedId && userLoading && (
        <div className="flex items-center justify-center h-32">
          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {selectedId && !userLoading && userData && (
        <>
          {/* Player info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 items-start">
                <div>
                  <p className="text-lg font-bold">{userData.user.username}</p>
                  <p className="text-sm text-muted-foreground">{userData.user.name}</p>
                  <p className="text-xs text-muted-foreground">{userData.user.phone}</p>
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  <Badge variant="outline">Main: {fmt(userData.user.main_balance)}</Badge>
                  <Badge variant="outline">Bonus: {fmt(userData.user.bonus_balance)}</Badge>
                  <Badge variant="outline">P/L: <span className={plColor(userData.user.pl_balance)}>{fmt(userData.user.pl_balance)}</span></Badge>
                  <Badge variant="secondary">All-time dep: {fmt(userData.user.all_time_deposits)}</Badge>
                  <Badge variant="secondary">All-time wd: {fmt(userData.user.all_time_withdrawals)}</Badge>
                  {userData.user.joined && (
                    <Badge variant="secondary">Joined: {new Date(userData.user.joined).toLocaleDateString("en-IN")}</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KPI cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <StatCard title="Total Bets" value={fmtNum(userData.summary.total_bets)} icon={Gamepad2} />
            <StatCard title="Bet Amount" value={fmt(userData.summary.total_bet_amount)} icon={Wallet} />
            <StatCard title="Win Amount" value={fmt(userData.summary.total_win_amount)} icon={TrendingUp} colorClass="text-green-500" />
            <StatCard title="Lose Amount" value={fmt(userData.summary.total_lose_amount)} icon={TrendingDown} colorClass="text-destructive" />
            <StatCard title="Platform P/L" value={fmt(userData.summary.platform_pl)} icon={BarChart2} colorClass={plColor(userData.summary.platform_pl)} />
          </div>

          {/* Daily chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Daily Bet & Win Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={dailyChart} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v) => fmt(v as number)} />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                  <Line dataKey="bet_amount" name="Bet Amount" stroke="#6366f1" dot={false} strokeWidth={2} />
                  <Line dataKey="win_amount" name="Win Amount" stroke="#22c55e" dot={false} strokeWidth={1.5} />
                  <Line dataKey="pl" name="Platform P/L" stroke="#f59e0b" dot={false} strokeWidth={1.5} strokeDasharray="4 2" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top games */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Top Games</CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleTable
                  headers={["Game", "Provider", "Bets", "Bet Amount", "Win Amount"]}
                  rows={userData.top_games.map((g) => [
                    g.game_name,
                    g.provider,
                    fmtNum(g.bet_count),
                    fmt(g.bet_amount),
                    fmt(g.win_amount),
                  ])}
                />
              </CardContent>
            </Card>

            {/* Recent activity */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleTable
                  headers={["Action", "Device", "Time"]}
                  rows={userData.activities.slice(0, 15).map((a) => [
                    <span key="a" className="capitalize">{a.action.replace(/_/g, " ")}</span>,
                    a.device || "—",
                    a.created_at ? new Date(a.created_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" }) : "—",
                  ])}
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Recent Deposits</CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleTable
                  headers={["Amount", "Status", "Date"]}
                  rows={userData.deposits.map((d) => [
                    fmt(d.amount),
                    <Badge key="s" variant={d.status === "approved" ? "default" : d.status === "rejected" ? "destructive" : "secondary"}>
                      {d.status}
                    </Badge>,
                    d.created_at ? new Date(d.created_at).toLocaleDateString("en-IN") : "—",
                  ])}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Recent Withdrawals</CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleTable
                  headers={["Amount", "Status", "Date"]}
                  rows={userData.withdrawals.map((w) => [
                    fmt(w.amount),
                    <Badge key="s" variant={w.status === "approved" ? "default" : w.status === "rejected" ? "destructive" : "secondary"}>
                      {w.status}
                    </Badge>,
                    w.created_at ? new Date(w.created_at).toLocaleDateString("en-IN") : "—",
                  ])}
                />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function PowerhouseAnalytics() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <BarChart2 className="h-5 w-5 text-primary" />
        <h2 className="font-display font-bold text-xl">Analytics</h2>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="games" className="text-xs">Game Analytics</TabsTrigger>
          <TabsTrigger value="finance" className="text-xs">Finance & P/L</TabsTrigger>
          <TabsTrigger value="customers" className="text-xs">Customer Behaviour</TabsTrigger>
          <TabsTrigger value="user" className="text-xs">User Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview"><OverviewTab /></TabsContent>
        <TabsContent value="games"><GameAnalyticsTab /></TabsContent>
        <TabsContent value="finance"><FinanceTab /></TabsContent>
        <TabsContent value="customers"><CustomerTab /></TabsContent>
        <TabsContent value="user"><UserAnalyticsTab /></TabsContent>
      </Tabs>
    </div>
  );
}
