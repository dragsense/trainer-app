import { formatValue } from "@shared/lib/utils";

export function pickKeys<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Partial<T> {
  return keys.reduce((acc, key) => {
    if (key in obj) acc[key] = obj[key];
    return acc;
  }, {} as Partial<T>);
}


export function strictDeepMerge<T extends Record<string, any>>(target: T, source?: Partial<T>): T {
  if (!source) return { ...target };

  const result: any = Array.isArray(target) ? [...target] : { ...target };

  (Object.keys(target) as (keyof T)[]).forEach((key) => {
    const targetValue = target[key];
    const sourceValue = source[key];

    if (
      sourceValue &&
      typeof targetValue === "object" &&
      targetValue !== null &&
      !Array.isArray(targetValue)
    ) {
      // Recursively merge nested objects
      result[key] = strictDeepMerge(targetValue as any, sourceValue as any);
    } else if (sourceValue !== undefined) {
      result[key] = sourceValue as T[typeof key];
    } else {
      result[key] = targetValue; // keep default if missing
    }
  });

  return result;
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

      // Handle nested objects
      if (field && typeof field === "object" && "isNested" in initField) {
        if (Array.isArray(field)) {
          // Handle array of nested objects
          result[key] = {
            value: (response?.[key] || field).map((item: any, index: number) => {
              const arrayItem = field[index] || field[0];
              return {
                isNested: arrayItem.isNested,
                value: extractValues(item, arrayItem.value)
              };
            })
          };
        } else {
          // Handle single nested object
          result[key] = {
            isNested: initField.isNested,
            value: extractValues(response?.[key] ?? {}, field)
          };
        }
      } else {
        // Handle primitive values
        result[key] = {
          value: response?.[key] !== undefined ? response[key] : field,
        };
      }
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

      // Handle arrays
      if (Array.isArray(value)) {
        result[key] = value.map((item: any) => {
          if (item && typeof item === "object" && "isNested" in item) {
            return unwrapValues(item.value);
          } else if (item && typeof item === "object" && "value" in item) {
            return unwrapValues(item);
          } else {
            return item;
          }
        });
      }
      // Handle nested objects
      else if (value && typeof value === "object" && !(value instanceof Date)) {
        result[key] = unwrapValues(value);
      }
      // Handle primitive values
      else {
        result[key] = value;
      }
    }
  }

  return result;
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
