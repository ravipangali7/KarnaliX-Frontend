import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { getGameLog } from "@/api/admin";

type GameLogRow = Record<string, unknown> & { id?: number; user_username?: string; game_name?: string; category?: string; bet_amount?: string; result?: string; win_amount?: string; created_at?: string };

const AdminGameLog = () => {
  const { user } = useAuth();
  const role = (user?.role === "powerhouse" || user?.role === "super" || user?.role === "master") ? user.role : "master";
  const { data: gameLogs = [] } = useQuery({ queryKey: ["admin-game-log", role], queryFn: () => getGameLog(role) });
  const rows = gameLogs as GameLogRow[];

  const columns = [
    { header: "User", accessor: (row: GameLogRow) => String(row.user_username ?? row.username ?? "") },
    { header: "Game", accessor: (row: GameLogRow) => String(row.game_name ?? row.game ?? "") },
    { header: "Category", accessor: (row: GameLogRow) => String(row.category ?? "") },
    { header: "Bet", accessor: (row: GameLogRow) => `₹${Number(row.bet_amount ?? row.betAmount ?? 0).toLocaleString()}` },
    { header: "Result", accessor: (row: GameLogRow) => <StatusBadge status={String(row.result ?? row.type ?? "")} /> },
    { header: "Won", accessor: (row: GameLogRow) => Number(row.win_amount ?? row.winAmount ?? 0) > 0 ? `₹${Number(row.win_amount ?? row.winAmount ?? 0).toLocaleString()}` : "—" },
    { header: "Played", accessor: (row: GameLogRow) => row.created_at ? new Date(String(row.created_at)).toLocaleString() : "" },
    { header: "Details", accessor: (row: GameLogRow) => row.id != null ? <Button variant="outline" size="sm" className="h-7 text-xs" asChild><Link to={`/${role}/game-log/${row.id}`}>View</Link></Button> : "—" },
  ];

  return (
    <div className="space-y-4">
      <h2 className="font-display font-bold text-xl">Game Log</h2>
      <DataTable data={rows} columns={columns} searchKey="user_username" searchPlaceholder="Search game logs..." />
    </div>
  );
};

export default AdminGameLog;
