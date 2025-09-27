// Stub for TypeORM decorators to prevent frontend errors
export const Entity = (name?: string) => (target: any) => {};
export const Column = (options?: any) => (target: any, propertyKey: string) => {};
export const PrimaryGeneratedColumn = (options?: any) => (target: any, propertyKey: string) => {};
export const CreateDateColumn = (options?: any) => (target: any, propertyKey: string) => {};
export const UpdateDateColumn = (options?: any) => (target: any, propertyKey: string) => {};
export const ManyToOne = (type: any, options?: any) => (target: any, propertyKey: string) => {};
export const OneToOne = (type: any, options?: any) => (target: any, propertyKey: string) => {};
export const OneToMany = (type: any, options?: any) => (target: any, propertyKey: string) => {};
export const ManyToMany = (type: any, options?: any) => (target: any, propertyKey: string) => {};
export const JoinColumn = (options?: any) => (target: any, propertyKey: string) => {};
export const JoinTable = (options?: any) => (target: any, propertyKey: string) => {};
export const Index = (options?: any) => (target: any, propertyKey: string) => {};
export const Unique = (options?: any) => (target: any, propertyKey: string) => {};

// Stub for BaseEntity class
export class BaseEntity {
  // Empty stub class for frontend compatibility
}
