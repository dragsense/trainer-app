import { EORDER_CLASSES } from "@/@types/enums/general.enum";
import { ReactNode } from "react";

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
  | "radio";

export type FieldConfig = {
  id: string;
  label: string;
  name: string;
  type: FieldType;
  disabled?: boolean;
  layout?: "horizental" | "vertical";
  lableOrder?: EORDER_CLASSES;
  placeholder?: string;
  options?: { label: string; value: string }[];
  defaultValue?: string;
  required: boolean;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  bottomAdornment?: ReactNode;
  className?: string;
  listeners?: any;
  Component?: React.ComponentType<CustomInputWrapper>;
};

export type CustomInputWrapper = {
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
};
