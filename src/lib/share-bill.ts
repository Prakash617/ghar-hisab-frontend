import { formatCurrency } from "@/lib/utils";

export type BillCardMode = "receipt" | "bill";

export interface CardRenderInput {
  mode: BillCardMode;
  receipt?: Record<string, any> | null;
  bill?: Record<string, any> | null;
  roomLabel?: string;
  houseLabel?: string;
  tenantName?: string;
  qrUrl?: string | null;
  meterPhotoUrl?: string | null;
}

export interface PendingNoticeCardInput {
  tenantName?: string;
  roomLabel?: string;
  houseLabel?: string;
  unpaidBills: Array<Record<string, any>>;
  openingDue?: number;
  totalPending?: number;
  qrUrl?: string | null;
}

/**
 * Normalize Nepal/international phone strings to clean country-prefixed digits
 * so wa.me/<digits> opens the tenant's chat directly.
 */
export function formatMessagingPhone(raw?: string | null): string {
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 10 && digits.startsWith("9")) {
    return `977${digits}`;
  }
  if (digits.startsWith("00")) {
    return digits.slice(2);
  }
  return digits;
}

async function loadImageForCanvas(url?: string | null): Promise<HTMLImageElement | null> {
  if (!url) return null;
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  } catch {
    return null;
  }
}

export function buildCardPlainSummary({
  mode,
  receipt,
  bill,
  roomLabel,
  houseLabel,
  tenantName,
  receiptTitle = "Payment Receipt",
  billTitle = "Monthly Rent & Utility Bill",
  portalUrl,
  extraNote,
}: CardRenderInput & {
  receiptTitle?: string;
  billTitle?: string;
  portalUrl?: string;
  extraNote?: string;
}): string {
  const isReceipt = mode === "receipt" && receipt;
  const resolvedRoom = roomLabel || receipt?.room_name || receipt?.room_number || bill?.roomName || "";
  const resolvedHouse = houseLabel || receipt?.house_name || bill?.houseName || "";
  const resolvedTenant = tenantName || receipt?.tenant_name || bill?.tenant_name || "";

  if (isReceipt) {
    const allocs = (receipt.allocations || [])
      .map(
        (a: Record<string, any>) =>
          `  - ${a.allocation_label || "Bill"}: ${formatCurrency(a.allocated_amount)}`
      )
      .join("\n");
    return [
      `GharHisab - ${receiptTitle} #${receipt.id}`,
      resolvedTenant ? `Tenant: ${resolvedTenant}` : "",
      resolvedRoom ? `Room: ${resolvedRoom}${resolvedHouse ? ` (${resolvedHouse})` : ""}` : "",
      `Date (BS): ${receipt.received_date || "-"}`,
      `Amount Received: ${formatCurrency(receipt.amount)}`,
      `Allocated: ${formatCurrency(receipt.allocated_amount)} | Advance: ${formatCurrency(receipt.unapplied_amount)}`,
      allocs ? `Settled:\n${allocs}` : "",
      receipt.remarks ? `Note: ${receipt.remarks}` : "",
      portalUrl ? `View statement: ${portalUrl}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (bill) {
    const billDue = Math.max(
      (parseFloat(bill.amount || bill.total || "0") || 0) -
        (parseFloat(bill.total_paid || "0") || 0),
      0
    );
    return [
      `GharHisab - ${billTitle}`,
      resolvedTenant ? `Tenant: ${resolvedTenant}` : "",
      resolvedRoom ? `Room: ${resolvedRoom}${resolvedHouse ? ` (${resolvedHouse})` : ""}` : "",
      `Billing Date (BS): ${bill.billing_month || "-"}`,
      `Electricity: ${bill.previous_units ?? 0} -> ${bill.current_units ?? 0} (${formatCurrency(bill.electricity)})`,
      `Rent: ${formatCurrency(bill.rent)} | Water: ${formatCurrency(bill.water)} | Waste: ${formatCurrency(bill.waste)}`,
      parseFloat(bill.extra_charge || "0") > 0
        ? `Extra (${bill.extra_charge_label || "Other"}): ${formatCurrency(bill.extra_charge)}`
        : "",
      `Total Bill: ${formatCurrency(bill.amount || bill.total)}`,
      `Paid: ${formatCurrency(bill.total_paid || 0)} | Due: ${formatCurrency(billDue)}`,
      `Status: ${bill.status}`,
      extraNote?.trim() ? `Note: ${extraNote.trim()}` : "",
      portalUrl ? `View online bill & QR: ${portalUrl}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  return "";
}

/**
 * Render a clean, high-resolution PNG card for either a monthly bill or payment receipt.
 */
export async function renderCardCanvasBlob({
  mode,
  receipt,
  bill,
  roomLabel,
  houseLabel,
  tenantName,
  qrUrl,
  meterPhotoUrl,
}: CardRenderInput): Promise<Blob | null> {
  const isReceipt = mode === "receipt" && receipt;
  const resolvedRoom = roomLabel || receipt?.room_name || receipt?.room_number || bill?.roomName || "";
  const resolvedHouse = houseLabel || receipt?.house_name || bill?.houseName || "";
  const resolvedTenant = tenantName || receipt?.tenant_name || bill?.tenant_name || "";

  const rows: Array<{ label: string; value: string; highlight?: boolean }> = [];

  if (isReceipt) {
    rows.push({ label: "Receipt #", value: `#${receipt.id}` });
    rows.push({ label: "Date (BS)", value: String(receipt.received_date || "-") });
    if (resolvedTenant) rows.push({ label: "Tenant", value: resolvedTenant });
    if (resolvedRoom) {
      rows.push({
        label: "Room",
        value: `${resolvedRoom}${resolvedHouse ? ` (${resolvedHouse})` : ""}`,
      });
    }
    rows.push({
      label: "Amount Received",
      value: formatCurrency(receipt.amount),
      highlight: true,
    });
    rows.push({
      label: "Allocated / Advance",
      value: `${formatCurrency(receipt.allocated_amount)} / ${formatCurrency(receipt.unapplied_amount)}`,
    });
    for (const a of (receipt.allocations || []).slice(0, 6)) {
      rows.push({
        label: `Applied: ${a.allocation_label || "Bill"}`,
        value: formatCurrency(a.allocated_amount),
      });
    }
    if (receipt.remarks) rows.push({ label: "Note", value: String(receipt.remarks).slice(0, 48) });
  } else if (bill) {
    const billDue = Math.max(
      (parseFloat(bill.amount || bill.total || "0") || 0) -
        (parseFloat(bill.total_paid || "0") || 0),
      0
    );
    rows.push({ label: "Billing Month (BS)", value: String(bill.billing_month || "-") });
    if (resolvedTenant) rows.push({ label: "Tenant", value: resolvedTenant });
    if (resolvedRoom) {
      rows.push({
        label: "Room",
        value: `${resolvedRoom}${resolvedHouse ? ` (${resolvedHouse})` : ""}`,
      });
    }
    rows.push({ label: "Rent", value: formatCurrency(bill.rent) });
    rows.push({
      label: `Electricity (${bill.previous_units ?? 0} -> ${bill.current_units ?? 0})`,
      value: formatCurrency(bill.electricity),
    });
    if (parseFloat(bill.water || "0") > 0) {
      rows.push({ label: "Water", value: formatCurrency(bill.water) });
    }
    if (parseFloat(bill.waste || "0") > 0) {
      rows.push({ label: "Waste", value: formatCurrency(bill.waste) });
    }
    if (parseFloat(bill.internet || "0") > 0) {
      rows.push({ label: "Internet", value: formatCurrency(bill.internet) });
    }
    if (parseFloat(bill.extra_charge || "0") > 0) {
      rows.push({
        label: bill.extra_charge_label || "Extra",
        value: formatCurrency(bill.extra_charge),
      });
    }
    rows.push({
      label: "Total Bill",
      value: formatCurrency(bill.amount || bill.total),
      highlight: true,
    });
    rows.push({
      label: "Paid / Balance Due",
      value: `${formatCurrency(bill.total_paid || 0)} / ${formatCurrency(billDue)}`,
    });
    rows.push({ label: "Status", value: String(bill.status || "") });
  } else {
    return null;
  }

  const [qrImg, meterImg] = await Promise.all([
    loadImageForCanvas(qrUrl),
    !isReceipt ? loadImageForCanvas(meterPhotoUrl) : Promise.resolve(null),
  ]);

  const width = 760;
  const mediaCount = (qrImg ? 1 : 0) + (meterImg ? 1 : 0);
  const mediaBlockHeight = mediaCount > 0 ? 235 : 0;
  const height = 160 + rows.length * 44 + mediaBlockHeight + 60;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#0284c7";
  ctx.fillRect(0, 0, width, 108);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 28px sans-serif";
  ctx.fillText("GharHisab", 36, 48);
  ctx.font = "18px sans-serif";
  ctx.fillStyle = "#e0f2fe";
  ctx.fillText(
    isReceipt ? "Payment Receipt" : "Monthly Rent & Utility Bill",
    36,
    82
  );

  let y = 148;
  for (const row of rows) {
    if (row.highlight) {
      ctx.fillStyle = "#f0f9ff";
      ctx.fillRect(28, y - 28, width - 56, 40);
    }
    ctx.font = row.highlight ? "bold 19px sans-serif" : "17px sans-serif";
    ctx.fillStyle = row.highlight ? "#0369a1" : "#475569";
    ctx.fillText(row.label, 38, y);

    ctx.font = row.highlight ? "bold 21px sans-serif" : "bold 17px sans-serif";
    ctx.fillStyle = row.highlight ? "#0f172a" : "#1e293b";
    const textWidth = ctx.measureText(row.value).width;
    ctx.fillText(row.value, width - 38 - textWidth, y);

    ctx.strokeStyle = "#e2e8f0";
    ctx.beginPath();
    ctx.moveTo(36, y + 14);
    ctx.lineTo(width - 36, y + 14);
    ctx.stroke();

    y += 44;
  }

  if (mediaCount === 2 && qrImg && meterImg) {
    const col1X = width / 4;
    const col2X = (width * 3) / 4;
    ctx.fillStyle = "#334155";
    ctx.font = "bold 15px sans-serif";
    const meterCaption = "Sub-Meter Photo Proof";
    const qrCaption = "Scan QR to Pay";
    ctx.fillText(meterCaption, col1X - ctx.measureText(meterCaption).width / 2, y + 22);
    ctx.fillText(qrCaption, col2X - ctx.measureText(qrCaption).width / 2, y + 22);
    ctx.drawImage(meterImg, col1X - 85, y + 36, 170, 170);
    ctx.drawImage(qrImg, col2X - 85, y + 36, 170, 170);
  } else if (qrImg) {
    ctx.fillStyle = "#334155";
    ctx.font = "bold 16px sans-serif";
    const caption = "Scan QR to Pay";
    ctx.fillText(caption, (width - ctx.measureText(caption).width) / 2, y + 22);
    ctx.drawImage(qrImg, (width - 170) / 2, y + 36, 170, 170);
  } else if (meterImg) {
    ctx.fillStyle = "#334155";
    ctx.font = "bold 16px sans-serif";
    const caption = "Sub-Meter Photo Proof";
    ctx.fillText(caption, (width - ctx.measureText(caption).width) / 2, y + 22);
    ctx.drawImage(meterImg, (width - 170) / 2, y + 36, 170, 170);
  }

  ctx.fillStyle = "#94a3b8";
  ctx.font = "13px sans-serif";
  ctx.fillText("Generated by GharHisab", 36, height - 22);

  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

/**
 * Render a combined Pending Bills Statement PNG image for pending-notice WhatsApp / Viber sends.
 */
export async function renderPendingNoticeCanvasBlob({
  tenantName,
  roomLabel,
  houseLabel,
  unpaidBills,
  openingDue = 0,
  totalPending = 0,
  qrUrl,
}: PendingNoticeCardInput): Promise<Blob | null> {
  const rows: Array<{ label: string; value: string; highlight?: boolean }> = [];
  if (tenantName) rows.push({ label: "Tenant", value: tenantName });
  if (roomLabel) {
    rows.push({
      label: "Room",
      value: `${roomLabel}${houseLabel ? ` (${houseLabel})` : ""}`,
    });
  }
  if (openingDue > 0) {
    rows.push({ label: "Opening Balance Due", value: formatCurrency(openingDue) });
  }
  for (const bill of unpaidBills.slice(0, 8)) {
    const due = Math.max(
      (parseFloat(bill.amount || bill.total || "0") || 0) -
        (parseFloat(bill.total_paid || "0") || 0),
      0
    );
    rows.push({
      label: `Bill ${bill.billing_month || "-"} (${bill.status || "Unpaid"})`,
      value: formatCurrency(due),
    });
  }
  if (unpaidBills.length > 8) {
    rows.push({
      label: `+ ${unpaidBills.length - 8} more pending bill(s)`,
      value: "...",
    });
  }
  rows.push({
    label: "Total Amount Due",
    value: formatCurrency(totalPending),
    highlight: true,
  });

  const qrImg = await loadImageForCanvas(qrUrl);
  const width = 760;
  const qrBlockHeight = qrImg ? 230 : 0;
  const height = 160 + rows.length * 44 + qrBlockHeight + 60;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#0369a1";
  ctx.fillRect(0, 0, width, 108);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 28px sans-serif";
  ctx.fillText("GharHisab", 36, 48);
  ctx.font = "18px sans-serif";
  ctx.fillStyle = "#e0f2fe";
  ctx.fillText("Pending Rent & Utility Bills Notice", 36, 82);

  let y = 148;
  for (const row of rows) {
    if (row.highlight) {
      ctx.fillStyle = "#fff1f2";
      ctx.fillRect(28, y - 28, width - 56, 40);
    }
    ctx.font = row.highlight ? "bold 19px sans-serif" : "17px sans-serif";
    ctx.fillStyle = row.highlight ? "#be123c" : "#475569";
    ctx.fillText(row.label, 38, y);

    ctx.font = row.highlight ? "bold 21px sans-serif" : "bold 17px sans-serif";
    ctx.fillStyle = row.highlight ? "#9f1239" : "#1e293b";
    const textWidth = ctx.measureText(row.value).width;
    ctx.fillText(row.value, width - 38 - textWidth, y);

    ctx.strokeStyle = "#e2e8f0";
    ctx.beginPath();
    ctx.moveTo(36, y + 14);
    ctx.lineTo(width - 36, y + 14);
    ctx.stroke();

    y += 44;
  }

  if (qrImg) {
    ctx.fillStyle = "#334155";
    ctx.font = "bold 16px sans-serif";
    const caption = "Scan QR to Pay";
    ctx.fillText(caption, (width - ctx.measureText(caption).width) / 2, y + 22);
    ctx.drawImage(qrImg, (width - 170) / 2, y + 36, 170, 170);
  }

  ctx.fillStyle = "#94a3b8";
  ctx.font = "13px sans-serif";
  ctx.fillText("Generated by GharHisab", 36, height - 22);

  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

export function triggerPngDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Deliver a generated PNG bill/receipt image along with summary text via WhatsApp or Viber.
 * Uses Web Share API file attachment on mobile devices when available, and otherwise
 * copies the PNG image to clipboard (or downloads fallback PNG) and opens the messaging app.
 */
export async function deliverImageToMessagingApp({
  channel,
  blob,
  filename,
  summary,
  phone,
  title = "GharHisab Bill",
}: {
  channel: "whatsapp" | "viber";
  blob: Blob | null;
  filename: string;
  summary: string;
  phone?: string | null;
  title?: string;
}): Promise<"native_share" | "clipboard_and_link" | "download_and_link" | "aborted"> {
  const isMobileUa =
    typeof navigator !== "undefined" &&
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

  if (blob && isMobileUa && typeof navigator !== "undefined" && "share" in navigator) {
    const file = new File([blob], filename, { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title,
          text: summary,
        });
        return "native_share";
      } catch (err: any) {
        if (err?.name === "AbortError") {
          return "aborted";
        }
      }
    }
  }

  let copiedImage = false;
  if (
    blob &&
    typeof navigator !== "undefined" &&
    navigator.clipboard &&
    typeof ClipboardItem !== "undefined"
  ) {
    try {
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      copiedImage = true;
    } catch {
      copiedImage = false;
    }
  }

  if (blob && !copiedImage) {
    triggerPngDownload(blob, filename);
  }

  const digits = formatMessagingPhone(phone);
  const targetUrl =
    channel === "whatsapp"
      ? `https://wa.me/${digits}?text=${encodeURIComponent(summary)}`
      : `viber://forward?text=${encodeURIComponent(summary)}`;

  window.open(targetUrl, "_blank", "noopener,noreferrer");

  return copiedImage ? "clipboard_and_link" : "download_and_link";
}
