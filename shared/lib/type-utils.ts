/**
 * Universal Type Utilities for Frontend and Backend
 * Works with both React and NestJS environments
 */

/**
 * Custom OmitType that works on both frontend and backend
 * This actually removes properties from the class definition
 */
export function createOmitType<T, K extends keyof T>(
  baseClass: new (...args: any[]) => T,
  omittedKeys: readonly K[]
) {
  // Create a new class that doesn't inherit the omitted properties
  class OmittedClass {
    constructor(...args: any[]) {
      // Create instance of base class
      const baseInstance = new baseClass(...args);
      
      // Copy only the properties that are NOT omitted
      Object.keys(baseInstance).forEach(key => {
        if (!omittedKeys.includes(key as K)) {
          (this as any)[key] = (baseInstance as any)[key];
        }
      });
      
      // Copy methods from base class
      Object.getOwnPropertyNames(baseClass.prototype).forEach(methodName => {
        if (methodName !== 'constructor' && typeof (baseInstance as any)[methodName] === 'function') {
          (this as any)[methodName] = (baseInstance as any)[methodName].bind(this);
        }
      });
    }
  }

  // Copy static properties
  Object.setPrototypeOf(OmittedClass, baseClass);
  Object.setPrototypeOf(OmittedClass.prototype, baseClass.prototype);

  return OmittedClass as any;
}

/**
 * Alternative: Simple class that extends without omitted properties
 */
export function omitType<T, K extends keyof T>(
  baseClass: new (...args: any[]) => T,
  omittedKeys: readonly K[]
) {
  return class extends baseClass {
    constructor(...args: any[]) {
      super(...args);
      // Remove omitted properties
      omittedKeys.forEach(key => {
        delete (this as any)[key];
      });
    }
  } as any;
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