/**
 * Frontend-compatible OmitType utility
 * This replaces NestJS Swagger's OmitType for shared DTOs
 */

// Type-only utility (compile-time only)
export type OmitType<T, K extends keyof T> = Omit<T, K>;

// Runtime utility for creating classes with omitted properties
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
 * Frontend-compatible PartialType utility
 */
export type PartialType<T> = Partial<T>;

// Runtime utility for creating classes with partial properties
export function createPartialType<T extends Record<string, any>>(
  baseClass: new (...args: any[]) => T
): new (...args: any[]) => Partial<T> {
  // For now, just return the base class as-is
  // The TypeScript type system will handle the Partial<T> typing
  // This is a simpler approach that works with class-validator
  return baseClass as any;
}
