import { ReactNode } from "react";
import { EORDER_CLASSES } from "@/enums/general.enum";

export type TFieldType =
  | "text"
  | "email"
  | "textarea"
  | "select"
  | "password"
  | "tel"
  | "custom"
  | "nested"
  | "number"
  | "date"
  | "time"
  | "switch"
  | "checked"
  | "radio"
  | "file"
  | "checkbox"
  | "multiSelect"
  | "url"
  | "rating"
  | "slider"
  | "datetime";

export type TCustomInputWrapper = {
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
};

// Base field shared by all
type BaseField<T> = {
  id: keyof T & string;
  name: keyof T & string;
  label: string;
  valueType?: "string" | "number" | "boolean" | "date" | "object";
  required: boolean | ((ctx: { values: Record<string, any> }) => boolean);
  placeholder?: string;
  defaultValue?: any;
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean | ((ctx: { values: Record<string, any> }) => boolean);
  layout?: "horizontal" | "vertical";
  lableOrder?: EORDER_CLASSES;
  visible?: (ctx: { values: Record<string, any> }) => boolean;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  bottomAdornment?: ReactNode;
  className?: string;
  onChange?: (value: any) => void;
};

type NestedSubFields<T> =
  { [K in keyof T as T[K] extends object ? K : never]: TFieldConfig<T[K]> }[keyof { [K in keyof T as T[K] extends object ? K : never]: any }];

// Nested field must have subFields
type NestedField<T> = BaseField<T> & {
  type: "nested";
  subFields: NestedSubFields<T>[];
  Component?: never;
};

// Custom field must have Component
type CustomField<T> = BaseField<T> & {
  type: "custom";
  Component: React.ComponentType<TCustomInputWrapper>;
  subFields?: never;
};

// Primitive field cannot have subFields or Component
type PrimitiveField<T, Type extends Exclude<TFieldType, "nested" | "custom"> = Exclude<TFieldType, "nested" | "custom">> =
  BaseField<T> & {
    type: Type;
    subFields?: never;
    Component?: never;
  };

// TFieldConfig union type
export type TFieldConfig<T = any> = NestedField<T> | CustomField<T> | PrimitiveField<T>;

export type TDefaultValue<T> = {
  [K in keyof T]: T[K] extends object
  ? {
    isNested: boolean;
    notIncluded?: boolean;
    value: TDefaultValue<T[K]>;
  }
  : {
    notIncluded?: boolean;
    value: T[K];
  };
};