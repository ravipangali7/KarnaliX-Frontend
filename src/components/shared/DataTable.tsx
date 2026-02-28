import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, ChevronLeft, ChevronRight, Plus, ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react";

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
  /** If provided, enables sorting by this key from the row object. */
  sortKey?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchKey?: keyof T;
  onAdd?: () => void;
  addLabel?: string;
  secondaryAction?: { label: string; onClick: () => void };
  pageSize?: number;
}

type SortDir = "asc" | "desc";

export function DataTable<T extends { id: string | number }>({
  data, columns, searchPlaceholder = "Search...", searchKey, onAdd, addLabel = "Add New", secondaryAction, pageSize = 10,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(0);
  };

  const filtered = useMemo(() => {
    let rows = searchKey
      ? data.filter((row) => String(row[searchKey]).toLowerCase().includes(search.toLowerCase()))
      : data;

    if (sortKey) {
      rows = [...rows].sort((a, b) => {
        const av = (a as Record<string, unknown>)[sortKey];
        const bv = (b as Record<string, unknown>)[sortKey];
        const an = Number(av);
        const bn = Number(bv);
        let cmp = 0;
        if (!isNaN(an) && !isNaN(bn)) {
          cmp = an - bn;
        } else {
          cmp = String(av ?? "").localeCompare(String(bv ?? ""));
        }
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return rows;
  }, [data, search, searchKey, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const pageData = filtered.slice(page * pageSize, (page + 1) * pageSize);

  const SortIcon = ({ col }: { col: Column<T> }) => {
    if (!col.sortKey) return null;
    if (sortKey !== col.sortKey) return <ChevronsUpDown className="h-3 w-3 ml-0.5 text-muted-foreground/50 inline" />;
    return sortDir === "asc"
      ? <ChevronUp className="h-3 w-3 ml-0.5 text-primary inline" />
      : <ChevronDown className="h-3 w-3 ml-0.5 text-primary inline" />;
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="pl-9 h-9 sm:h-9 text-sm min-h-[44px] sm:min-h-0"
          />
        </div>
        <div className="flex gap-2 shrink-0">
          {onAdd && (
            <Button onClick={onAdd} size="sm" className="gold-gradient text-primary-foreground gap-1 min-h-[44px] sm:min-h-9 px-4">
              <Plus className="h-3 w-3" /> {addLabel}
            </Button>
          )}
          {secondaryAction && (
            <Button onClick={secondaryAction.onClick} variant="outline" size="sm" className="gap-1 min-h-[44px] sm:min-h-9 px-4">
              {secondaryAction.label}
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-lg border overflow-hidden min-w-0">
        <div className="overflow-x-auto -mx-px" style={{ WebkitOverflowScrolling: "touch" }}>
          <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow className="bg-muted/50">
                {columns.map((col, i) => (
                  <TableHead
                    key={i}
                    className={`text-xs whitespace-nowrap ${col.className || ""} ${col.sortKey ? "cursor-pointer select-none hover:bg-muted/80 transition-colors" : ""}`}
                    onClick={col.sortKey ? () => handleSort(col.sortKey!) : undefined}
                  >
                    {col.header}
                    <SortIcon col={col} />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center text-sm text-muted-foreground py-8">
                    No data found
                  </TableCell>
                </TableRow>
              ) : (
                pageData.map((row) => (
                  <TableRow key={row.id} className="hover:bg-muted/30 transition-colors">
                    {columns.map((col, i) => (
                      <TableCell key={i} className={`text-sm ${col.className || ""}`}>
                        {typeof col.accessor === "function" ? col.accessor(row) : String(row[col.accessor] ?? "")}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{filtered.length} items</span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page === 0} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <span>{page + 1} / {totalPages}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
