export function pickKeys<T extends object, K extends keyof T>(
    obj: T,
    keys: K[]
): Partial<T> {
    return keys.reduce((acc, key) => {
        if (key in obj) acc[key] = obj[key];
        return acc;
    }, {} as Partial<T>);
}




function formatValue(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString().split("T")[0];
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  return String(value);
}

export function generateQueryParams(
  queryParams: URLSearchParams,
  params: Record<string, any>
) {
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;

    if (Array.isArray(value)) {
      value.forEach((v) => {
        if (v !== undefined && v !== null && v !== "")
          queryParams.append(key, formatValue(v));
      });
    } else if (typeof value === "object" && !(value instanceof Date)) {
      // flatten 1-level objects (e.g. customRange.from / customRange.to)
      Object.entries(value).forEach(([nestedKey, nestedValue]) => {
        if (nestedValue !== undefined && nestedValue !== null && nestedValue !== "")
          queryParams.append(nestedKey, formatValue(nestedValue));
      });
    } else {
      queryParams.append(key, formatValue(value));
    }
  });
}
