// Nepali Bikram Sambat (BS) Calendar Utilities

// Calendar days per month for BS years 2070 to 2100
const BS_MONTH_DAYS: Record<number, number[]> = {
  2070: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2071: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2072: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2073: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2074: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2075: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2076: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2077: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2078: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2079: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2080: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2081: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2082: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2083: [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30],
  2084: [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30],
  2085: [31, 32, 31, 32, 30, 31, 30, 30, 29, 30, 30, 30],
  2086: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2087: [31, 31, 32, 31, 31, 31, 30, 29, 30, 30, 30, 30],
  2088: [30, 31, 32, 32, 30, 31, 30, 30, 29, 30, 30, 30],
  2089: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2090: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2091: [31, 31, 32, 31, 31, 31, 30, 30, 29, 30, 30, 30],
  2092: [30, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2093: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2094: [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30],
  2095: [31, 31, 32, 31, 31, 31, 30, 29, 30, 30, 30, 30],
  2096: [30, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2097: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2098: [31, 31, 32, 31, 31, 31, 29, 30, 29, 30, 29, 31],
  2099: [31, 31, 32, 31, 31, 31, 30, 29, 29, 30, 30, 30],
  2100: [31, 32, 31, 32, 30, 31, 30, 29, 30, 29, 30, 30],
};

// 2070-01-01 BS corresponds to 2013-04-14 AD UTC
const REF_AD_DATE = new Date(Date.UTC(2013, 3, 14));

/**
 * Converts a Gregorian Date (or date string) to a Bikram Sambat (BS) date string (YYYY-MM-DD).
 */
export function toNepaliDate(dateInput?: Date | string | null): string {
  let target: Date;
  if (!dateInput) {
    target = new Date();
  } else if (typeof dateInput === "string") {
    // If it already looks like a BS date (year >= 2060 and year <= 2100), return as-is
    const parts = dateInput.trim().split("-");
    if (parts.length >= 1 && parseInt(parts[0]) >= 2060) {
      return dateInput.trim();
    }
    target = new Date(dateInput);
  } else {
    target = dateInput;
  }

  if (isNaN(target.getTime())) {
    return "";
  }

  // Calculate day difference using UTC to avoid timezone shift
  const targetUtc = new Date(Date.UTC(target.getFullYear(), target.getMonth(), target.getDate()));
  let diffDays = Math.round((targetUtc.getTime() - REF_AD_DATE.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return "";
  }

  let bsYear = 2070;
  let bsMonth = 1;
  let bsDay = 1;

  while (diffDays > 0 && BS_MONTH_DAYS[bsYear]) {
    const daysInYear = BS_MONTH_DAYS[bsYear].reduce((a, b) => a + b, 0);
    if (diffDays >= daysInYear) {
      diffDays -= daysInYear;
      bsYear++;
    } else {
      for (let m = 0; m < 12; m++) {
        const daysInMonth = BS_MONTH_DAYS[bsYear][m];
        if (diffDays >= daysInMonth) {
          diffDays -= daysInMonth;
          bsMonth++;
        } else {
          bsDay += diffDays;
          diffDays = 0;
          break;
        }
      }
    }
  }

  const mm = String(bsMonth).padStart(2, "0");
  const dd = String(bsDay).padStart(2, "0");
  return `${bsYear}-${mm}-${dd}`;
}

/**
 * Gets today's Nepali date (YYYY-MM-DD), with optional fallback to server date.
 */
export function getTodayNepaliDate(serverDate?: string | null): string {
  if (serverDate && serverDate.trim().length > 0) {
    const parts = serverDate.trim().split("-");
    if (parts.length >= 1 && parseInt(parts[0]) >= 2060) {
      return serverDate.trim();
    }
  }
  return toNepaliDate(new Date());
}

export const NEPALI_MONTH_NAMES_NE = [
  "बैशाख", "जेठ", "असार", "साउन", "भदौ", "असोज",
  "कार्तिक", "मंसिर", "पुस", "माघ", "फागुन", "चैत"
];

export const NEPALI_MONTH_NAMES_EN = [
  "Baishakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin",
  "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"
];

/**
 * Format a BS month string (e.g. "2083-04" or "2083-04-10") into readable text:
 * "Shrawan 2083 (साउन २०८३)" or locale specific.
 */
export function formatNepaliMonth(monthStr?: string | null, lang: "en" | "ne" | "both" = "both"): string {
  if (!monthStr) return "";
  const parts = monthStr.trim().split("-");
  if (parts.length < 2) return monthStr;
  const year = parseInt(parts[0], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  if (isNaN(year) || isNaN(monthIdx) || monthIdx < 0 || monthIdx > 11) {
    return monthStr;
  }
  const enName = NEPALI_MONTH_NAMES_EN[monthIdx];
  const neName = NEPALI_MONTH_NAMES_NE[monthIdx];

  if (lang === "en") return `${enName} ${year}`;
  if (lang === "ne") return `${year} ${neName}`;
  return `${enName} ${year} (${neName})`;
}

/**
 * Gets the previous Nepali BS month string (YYYY-MM).
 */
export function getPrevNepaliMonth(monthStr: string): string {
  if (!monthStr || monthStr === "all") return "";
  const parts = monthStr.split("-");
  let year = parseInt(parts[0], 10);
  let month = parseInt(parts[1], 10);
  if (isNaN(year) || isNaN(month)) return monthStr;
  if (month === 1) {
    year -= 1;
    month = 12;
  } else {
    month -= 1;
  }
  return `${year}-${String(month).padStart(2, "0")}`;
}

/**
 * Gets the next Nepali BS month string (YYYY-MM).
 */
export function getNextNepaliMonth(monthStr: string): string {
  if (!monthStr || monthStr === "all") return "";
  const parts = monthStr.split("-");
  let year = parseInt(parts[0], 10);
  let month = parseInt(parts[1], 10);
  if (isNaN(year) || isNaN(month)) return monthStr;
  if (month === 12) {
    year += 1;
    month = 1;
  } else {
    month += 1;
  }
  return `${year}-${String(month).padStart(2, "0")}`;
}

