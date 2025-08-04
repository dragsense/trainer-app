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

export type TFieldConfig = {
  id: string;
  label: string;
  name: string;
  type: TFieldType;
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
    value: T[K];
  };
};