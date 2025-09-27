// utils/date-range.ts

import { EAnalyticsPeriod } from "../enums";

export function safeDateFrom(value?: string | Date): Date | undefined {
  if (!value) return undefined;
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return undefined;
  return d;
}

/**
 * Resolve a start / end Date based on:
 * - explicit from/to (strings or Date) OR
 * - period: day | week | month | quarter | year
 *
 * Returned `start` is set to 00:00:00.000, `end` to 23:59:59.999 (inclusive).
 */
export function resolveDateRange(
  period?: EAnalyticsPeriod | string,
  from?: string | Date,
  to?: string | Date
): { start: Date; end: Date } {
  const now = new Date();
  const fromDate = safeDateFrom(from);
  const toDate = safeDateFrom(to);

  if (fromDate && toDate) {
    const start = new Date(fromDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(toDate);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  // normalize period string
  const p = (period ?? '').toString().toLowerCase();

  let start: Date;
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  switch (p) {
    case EAnalyticsPeriod.DAY:
    case 'day':
      start = new Date(now);
      start.setHours(0, 0, 0, 0);
      break;

    case EAnalyticsPeriod.WEEK:
    case 'week': {
      // assume week starts Monday
      const day = now.getDay(); // 0 (Sun) .. 6 (Sat)
      const diffToMonday = (day + 6) % 7; // 0 if Monday, 1 if Tuesday, ...
      start = new Date(now);
      start.setDate(now.getDate() - diffToMonday);
      start.setHours(0, 0, 0, 0);
      break;
    }

    case EAnalyticsPeriod.MONTH:
    case 'month':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      start.setHours(0, 0, 0, 0);
      break;

    case 'quarter': {
      const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
      start = new Date(now.getFullYear(), quarterStartMonth, 1);
      start.setHours(0, 0, 0, 0);
      break;
    }

    case EAnalyticsPeriod.YEAR:
    case 'year':
      start = new Date(now.getFullYear(), 0, 1);
      start.setHours(0, 0, 0, 0);
      break;

    default:
      // fallback to last 12 months
      start = new Date(now);
      start.setMonth(now.getMonth() - 12);
      start.setHours(0, 0, 0, 0);
  }

  return { start, end };
}
