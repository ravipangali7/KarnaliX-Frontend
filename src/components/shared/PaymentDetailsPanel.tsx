import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export function buildPaymentDetailsCopyText(opts: {
  methodName?: string;
  details?: Record<string, unknown> | null;
  statusLabel?: string;
  qrNote?: string;
}): string {
  const lines: string[] = [];
  if (opts.methodName) lines.push(`Method: ${opts.methodName}`);
  if (opts.statusLabel) lines.push(`Status: ${opts.statusLabel}`);
  if (opts.details && typeof opts.details === "object") {
    for (const [k, v] of Object.entries(opts.details)) {
      lines.push(`${k.replace(/_/g, " ")}: ${String(v ?? "")}`);
    }
  }
  if (opts.qrNote) lines.push(opts.qrNote);
  return lines.join("\n");
}

type PaymentDetailsPanelProps = {
  methodName?: string;
  details?: Record<string, unknown> | null;
  statusLabel?: string;
  qrUrl?: string | null;
  qrAlt?: string;
  className?: string;
};

export function PaymentDetailsPanel({ methodName, details, statusLabel, qrUrl, qrAlt = "Payment QR", className }: PaymentDetailsPanelProps) {
  const hasDetails = details != null && typeof details === "object" && Object.keys(details).length > 0;
  const copyText = buildPaymentDetailsCopyText({
    methodName,
    details: hasDetails ? details : null,
    statusLabel,
    qrNote: qrUrl ? "[QR image available in app]" : undefined,
  });

  const copyAll = async () => {
    if (!copyText.trim()) {
      toast({ title: "Nothing to copy", variant: "destructive" });
      return;
    }
    try {
      await navigator.clipboard.writeText(copyText);
      toast({ title: "Copied payment details." });
    } catch {
      toast({ title: "Could not copy", variant: "destructive" });
    }
  };

  return (
    <div className={`rounded-lg border border-border bg-muted/20 p-3 space-y-3 ${className ?? ""}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Payment details</p>
        <Button type="button" variant="secondary" size="sm" className="h-8 text-xs" onClick={copyAll}>
          Copy all
        </Button>
      </div>
      {methodName && (
        <p className="text-sm">
          <span className="text-muted-foreground text-xs block">Name</span>
          <span className="font-medium">{methodName}</span>
        </p>
      )}
      {statusLabel && (
        <p className="text-sm">
          <span className="text-muted-foreground text-xs block">Status</span>
          <span className="font-medium">{statusLabel}</span>
        </p>
      )}
      {hasDetails && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          {Object.entries(details!).map(([k, v]) => (
            <div key={k} className={k.length > 14 ? "sm:col-span-2" : ""}>
              <span className="text-muted-foreground text-xs capitalize block">{k.replace(/_/g, " ")}</span>
              <span className="font-mono font-medium break-all">{String(v ?? "")}</span>
            </div>
          ))}
        </div>
      )}
      {qrUrl && (
        <div>
          <span className="text-muted-foreground text-xs block">QR</span>
          <img src={qrUrl} alt={qrAlt} className="w-32 h-32 object-contain rounded-lg mt-1 border border-border" />
        </div>
      )}
    </div>
  );
}
