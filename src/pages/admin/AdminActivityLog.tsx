import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { DataTable } from "@/components/shared/DataTable";
import { getActivity } from "@/api/admin";

type ActivityRow = Record<string, unknown> & { user_username?: string; username?: string; action?: string; details?: string; remarks?: string; ip_address?: string; ip?: string; ipAddress?: string; created_at?: string };

const AdminActivityLog = () => {
  const { user } = useAuth();
  const role = (user?.role === "powerhouse" || user?.role === "super" || user?.role === "master") ? user.role : "master";
  const { data: activityLogs = [] } = useQuery({ queryKey: ["admin-activity", role], queryFn: () => getActivity(role) });
  const rows = activityLogs as ActivityRow[];

  const columns = [
    { header: "User", accessor: (row: ActivityRow) => String(row.user_username ?? row.username ?? "") },
    { header: "Action", accessor: (row: ActivityRow) => <span className="capitalize">{String(row.action ?? "").replace(/_/g, " ")}</span> },
    { header: "Details", accessor: (row: ActivityRow) => String(row.remarks ?? row.details ?? "") },
    { header: "IP", accessor: (row: ActivityRow) => String(row.ip ?? row.ip_address ?? row.ipAddress ?? "") },
    { header: "Date", accessor: (row: ActivityRow) => row.created_at ? new Date(String(row.created_at)).toLocaleString() : "" },
  ];

  return (
    <div className="space-y-4">
      <h2 className="font-display font-bold text-xl">Activity Log</h2>
      <DataTable data={rows} columns={columns} searchKey="user_username" searchPlaceholder="Search activity..." />
    </div>
  );
};

export default AdminActivityLog;
