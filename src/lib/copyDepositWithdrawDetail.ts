import { buildPaymentDetailsCopyText } from "@/components/shared/PaymentDetailsPanel";

export type PaymentModeDetailRow = Record<string, unknown> & {
  payment_method?: number;
  payment_method_name?: string;
  details?: Record<string, unknown>;
  status_display?: string;
  status?: string;
  qr_image_url?: string;
};

function line(label: string, value: string | undefined | null): string | null {
  const v = (value ?? "").trim();
  return v ? `${label}: ${v}` : null;
}

function appendPaymentBlockFromPmd(
  lines: string[],
  pmd: PaymentModeDetailRow | null | undefined,
  opts: {
    fallbackMethod?: string;
    paymentModeQrNote?: boolean;
  }
): void {
  if (!pmd && !opts.fallbackMethod) return;
  const detailsObj =
    pmd?.details != null && typeof pmd.details === "object" ? (pmd.details as Record<string, unknown>) : null;
  const hasDetailKeys = !!detailsObj && Object.keys(detailsObj).length > 0;
  const methodName = String(pmd?.payment_method_name ?? opts.fallbackMethod ?? "").trim();
  const statusRaw = pmd ? String(pmd.status_display ?? pmd.status ?? "").trim() : "";
  const qrNote = pmd?.qr_image_url || opts.paymentModeQrNote ? "[QR image available in app]" : undefined;
  const block = buildPaymentDetailsCopyText({
    methodName: methodName || undefined,
    details: hasDetailKeys ? detailsObj : null,
    statusLabel: statusRaw || undefined,
    qrNote,
  });
  if (block.trim()) {
    lines.push(block);
  } else if (methodName) {
    lines.push(`Method: ${methodName}`);
  }
}

/** Plain-text report for a deposit list row (admin client request). */
export function buildDepositRowCopyText(row: Record<string, unknown>): string {
  const lines: string[] = ["=== DEPOSIT REQUEST ==="];
  const l = (a: string, b: unknown) => {
    const s = line(a, b != null ? String(b) : "");
    if (s) lines.push(s);
  };
  l("Username", row.user_username ?? row.username);
  l("Name", row.user_name);
  l("Phone", row.user_phone);
  l("Email", row.user_email);
  l("WhatsApp", row.user_whatsapp_number);
  lines.push("");
  l("Transaction ID", row.id);
  l("Amount", row.amount != null ? `₹${Number(row.amount).toLocaleString()}` : "");
  l("Status", row.status);
  l("Request date", row.created_at ? new Date(String(row.created_at)).toLocaleString() : "");
  l("Reference ID", row.reference_id);
  l("Remarks", row.remarks);
  l("Payment method (summary)", row.payment_mode_name ?? row.payment_mode);
  lines.push("");
  lines.push("--- Payment details ---");
  const pmd = row.payment_mode_detail as PaymentModeDetailRow | null | undefined;
  appendPaymentBlockFromPmd(lines, pmd, {
    fallbackMethod: String(row.payment_mode_name ?? row.payment_mode ?? "").trim(),
    paymentModeQrNote: Boolean(row.payment_mode_qr_image),
  });
  if (row.screenshot) {
    lines.push("Screenshot: attached");
  } else {
    lines.push("Screenshot: none");
  }
  return lines.filter(Boolean).join("\n");
}

/** Plain-text report for a withdrawal list row (admin client request). */
export function buildWithdrawRowCopyText(row: Record<string, unknown>): string {
  const lines: string[] = ["=== WITHDRAWAL REQUEST ==="];
  const l = (a: string, b: unknown) => {
    const s = line(a, b != null ? String(b) : "");
    if (s) lines.push(s);
  };
  l("Username", row.user_username ?? row.username);
  l("Name", row.user_name);
  l("Phone", row.user_phone);
  l("Email", row.user_email);
  l("WhatsApp", row.user_whatsapp_number);
  lines.push("");
  l("Transaction ID", row.id);
  l("Amount", row.amount != null ? `₹${Number(row.amount).toLocaleString()}` : "");
  l("Status", row.status);
  l("Date", row.created_at ? new Date(String(row.created_at)).toLocaleString() : "");
  l("Reference ID", row.reference_id);
  l("Remarks", row.remarks);
  const accountStr = String(row.account_details ?? row.accountDetails ?? "").trim();
  l("Payment method (summary)", row.payment_mode_name ?? row.payment_mode);
  lines.push("");
  lines.push("--- Payment details ---");
  const pmd = row.payment_mode_detail as PaymentModeDetailRow | null | undefined;
  const fallbackMethod = String(row.payment_mode_name ?? row.payment_mode ?? "").trim();
  const detailsObj =
    pmd?.details != null && typeof pmd.details === "object" ? (pmd.details as Record<string, unknown>) : null;
  const hasDetailKeys = !!detailsObj && Object.keys(detailsObj).length > 0;
  const methodName = String(pmd?.payment_method_name ?? fallbackMethod).trim();
  const statusRaw = pmd ? String(pmd.status_display ?? pmd.status ?? "").trim() : "";
  const pmdQr = Boolean(pmd?.qr_image_url);
  const rowQr = Boolean(row.payment_mode_qr_image);
  const summaryText = !hasDetailKeys && accountStr ? accountStr : undefined;
  const block = buildPaymentDetailsCopyText({
    methodName: methodName || undefined,
    details: hasDetailKeys ? detailsObj : null,
    statusLabel: statusRaw || undefined,
    summaryText,
    summaryLabel: "Account / payment details",
    qrNote: pmdQr || rowQr ? "[QR image available in app]" : undefined,
  });
  if (block.trim()) {
    lines.push(block);
  } else if (accountStr) {
    lines.push(`Account / payment details: ${accountStr}`);
  } else if (methodName) {
    lines.push(`Method: ${methodName}`);
  } else {
    lines.push("(No structured payment details on file)");
  }
  return lines.join("\n");
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
