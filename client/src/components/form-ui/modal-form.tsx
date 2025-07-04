// React
import { ReactNode } from "react";

// External Libraries
import { Loader2 } from "lucide-react";

// Layout Components
import { AppForm } from "../layout/app-form";

// Utils
import { cn } from "@/lib/utils";
import { AppFormModal } from "../layout/app-form-dialog";

interface FormProps {
  className?: string;
  isSubmitting?: boolean;
  open: boolean;
  onOpenChange: (state: boolean) => void;
  error?: string | null;
  title: string;
  description?: string;
  footerContent: ReactNode;
  children: ReactNode;
  buttons?: ReactNode;
  form: any;
  width?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "full";
}

export function ModalForm({
  open,
  onOpenChange,
  isSubmitting,
  error,
  title,
  description,
  footerContent,
  children,
  buttons,
  form,
  width = "2xl",
}: FormProps) {
  return (
    <AppFormModal
      title={title}
      description={description}
      open={open}
      onOpenChange={onOpenChange}
      width={width}
      footerContent={footerContent}
      isSubmitting={isSubmitting}
      form={form}
    >
      {isSubmitting && (
        <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center rounded-lg">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}

      {children}

      {error && (
        <p className="text-sm font-medium text-red-500 my-2">{error}</p>
      )}
    </AppFormModal>
  );
}
