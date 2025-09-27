/**
 * Custom OmitType utility that works on both frontend and backend
 * This replaces NestJS Swagger's OmitType for shared DTOs
 */

export function OmitType<T, K extends keyof T>(
  classRef: new (...args: any[]) => T,
  keys: readonly K[]
): new (...args: any[]) => Omit<T, K> {
  // Create a new class that extends the base class
  class OmittedClass {
    constructor(...args: any[]) {
      // Copy properties from the base class instance
      const baseInstance = new classRef(...args);
      
      // Copy all properties except the omitted ones
      Object.keys(baseInstance).forEach(key => {
        if (!keys.includes(key as K)) {
          (this as any)[key] = (baseInstance as any)[key];
        }
      });
      
      // Copy all methods from the base class
      Object.getOwnPropertyNames(classRef.prototype).forEach(methodName => {
        if (methodName !== 'constructor' && typeof (baseInstance as any)[methodName] === 'function') {
          (this as any)[methodName] = (baseInstance as any)[methodName].bind(this);
        }
      });
    }
  }

  // Copy static properties and methods
  Object.setPrototypeOf(OmittedClass, classRef);
  Object.setPrototypeOf(OmittedClass.prototype, classRef.prototype);

  return OmittedClass as any;
}

/**
 * Alternative: Use TypeScript utility types for type-only operations
 */
export type OmitType<T, K extends keyof T> = Omit<T, K>;

/**
 * Alternative: Use class-validator's built-in utilities
 */
export function createOmittedClass<T, K extends keyof T>(
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
  };
}
