import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: string | number | undefined | null): string {
  if (amount === undefined || amount === null) return "Rs. 0.00";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "Rs. 0.00";
  return `Rs. ${num.toLocaleString("en-NP", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return String(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: string | null | undefined): string {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return String(date);
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "Paid":
      return "bg-green-100 text-green-800";
    case "Partially Paid":
      return "bg-yellow-100 text-yellow-800";
    case "Unpaid":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getMediaUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    return url;
  }
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://gharhisab.pythonanywhere.com";
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * Natural comparison for room numbers in ascending sequence.
 * Handles numbers (1, 2, 10), alphanumeric rooms (1A, 2B, Room 1),
 * and Nepali Devanagari numerals (१, २, १०).
 */
export function compareRoomNumbers(
  aRoomNumber?: string | number | null,
  bRoomNumber?: string | number | null
): number {
  const a = String(aRoomNumber ?? "").trim();
  const b = String(bRoomNumber ?? "").trim();

  const devanagariToStandard = (str: string) =>
    str.replace(/[०-९]/g, (d) => String("०१२३४५६७८९".indexOf(d)));

  const normA = devanagariToStandard(a);
  const normB = devanagariToStandard(b);

  return normA.localeCompare(normB, undefined, {
    numeric: true,
    sensitivity: "base",
  });
}
