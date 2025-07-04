import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function matchRoutePath(pattern: string, path: string): boolean {
  const patternParts = pattern.split("/");
  const pathParts = path.split("/");

  if (patternParts.length !== pathParts.length) return false;

  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i] !== pathParts[i] && !patternParts[i].startsWith(":")) {
      return false;
    }
  }

  return true;
}

type RouteParam = Record<string, string | number>;

export function buildRoutePath(path: string, params?: RouteParam, queryParams?: Record<string, string | number>): string {
  let result = path;

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      let valueStr = String(value);
      result = result.replace(`:${key}`, valueStr);
    }
  }

  if (queryParams) {
    const queryString = Object.entries(queryParams)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    if (queryString) {
      result += `?${queryString}`;
    }
  }

  return result;
}