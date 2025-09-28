/**
 * Frontend-compatible Type Utilities
 * Works with React and other frontend frameworks
 */

/**
 * Frontend-compatible OmitType
 * Creates a new class with omitted properties
 */
export function createOmitType<T extends Record<string, any>, K extends keyof T>(
  baseClass: new (...args: any[]) => T,
  omittedKeys: readonly K[]
): new (...args: any[]) => Omit<T, K> {
  class OmittedClass {
    constructor(...args: any[]) {
      // Create instance of base class
      const baseInstance = new baseClass(...args);
      
      // Copy all properties except omitted ones
      Object.keys(baseInstance).forEach(key => {
        if (!omittedKeys.includes(key as K)) {
          (this as any)[key] = (baseInstance as any)[key];
        }
      });
    }
  }
  
  return OmittedClass as any;
}

/**
 * Frontend-compatible PartialType
 * Creates a new class with all properties optional
 */
export function createPartialType<T extends Record<string, any>>(
  baseClass: new (...args: any[]) => T
): new (...args: any[]) => Partial<T> {
  class PartialClass {
    constructor(...args: any[]) {
      // Create instance of base class
      const baseInstance = new baseClass(...args);
      
      // Copy all properties
      Object.keys(baseInstance).forEach(key => {
        (this as any)[key] = (baseInstance as any)[key];
      });
    }
  }
  
  return PartialClass as any;
}

/**
 * TypeScript-only utility types (compile-time only)
 */
export type OmitType<T, K extends keyof T> = Omit<T, K>;
export type PickType<T, K extends keyof T> = Pick<T, K>;
export type PartialType<T> = Partial<T>;

/**
 * Runtime type utilities
 */
export function omit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: readonly K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
}

export function pick<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: readonly K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    result[key] = obj[key];
  });
  return result;
}