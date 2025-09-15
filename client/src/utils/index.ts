export function pickKeys<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Partial<T> {
  return keys.reduce((acc, key) => {
    if (key in obj) acc[key] = obj[key];
    return acc;
  }, {} as Partial<T>);
}

export function extractValues<T extends object>(
  response: any,
  initialValues: T
): any {
  const result: any = {};

  for (const key in initialValues) {
    const initField = initialValues[key];

    if (initField && typeof initField === "object" && "value" in initField) {
      const field = initField.value;
      if (field && typeof field === "object" && "isNested" in initField) {
        result[key] = { value: extractValues(response?.[key] ?? {}, field) }
      } else
        result[key] = {
          value: response?.[key] !== undefined ? response[key] : initField.value,
        };
    }


  }

  return result;
}

export function unwrapValues<T extends object>(formValues: T): any {
  const result: any = {};

  for (const key in formValues) {
    const field = (formValues as any)[key];

    if (field && typeof field === "object" && "value" in field) {
      const value = field.value;
      if (value && typeof value === "object" && !Array.isArray(value)) {
        result[key] = unwrapValues(value);
      } else
        result[key] = field.value;
    }
  }

  return result;
}


export function flatten<T>(arr: (T | T[])[]): T[] {
  return arr.reduce<T[]>((acc, item) => {
    if (Array.isArray(item)) return acc.concat(flatten(item));
    return acc.concat(item);
  }, []);
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
      generateQueryParams(queryParams, value);
    } else {
      queryParams.append(key, formatValue(value));
    }
  });
}
