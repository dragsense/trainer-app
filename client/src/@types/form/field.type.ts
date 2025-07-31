import { ReactNode } from "react";
import { EORDER_CLASSES } from "@/enums/general.enum";

export type FieldType =
  | "text"
  | "email"
  | "textarea"
  | "select"
  | "password"
  | "tel"
  | "custom"
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

export type FieldConfig = {
  id: string;
  label: string;
  name: string;
  type: FieldType;
  valueType?: "string" | "number" | "boolean" | "date" | "object";
  disabled?: boolean;
  layout?: "horizontal" | "vertical";
  lableOrder?: EORDER_CLASSES;
  placeholder?: string;
  options?: { label: string; value: string }[];
  defaultValue?: any;
  min?: number;
  max?: number;
  step?: number;
  required: boolean;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  bottomAdornment?: ReactNode;
  className?: string;
  listeners?: any;
  Component?: React.ComponentType<TCustomInputWrapper>;
};

export type TCustomInputWrapper = {
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
};


export type TDefaultValue<T> = {
  [K in keyof T]: {
    notIncluded?: boolean;
    notInput?: boolean;
    value: T[K];
  };
};