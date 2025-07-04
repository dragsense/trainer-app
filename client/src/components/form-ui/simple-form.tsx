// React
import { ReactNode } from "react";

// External Libraries
import { Loader2 } from "lucide-react";

// Layout Components
import { AppForm } from "../layout-ui/app-form";

// Utils
import { cn } from "@/lib/utils";


interface FormProps {
  className?: string;
  isSubmitting?: boolean;
  error?: string | null;
  children: ReactNode;
  buttons?: ReactNode;
  form: any;
}

export function SimpleForm({
  className,
  isSubmitting,
  error,
  children,
  buttons,
  form,
}: FormProps) {

  return (
    <div className={cn("relative flex flex-col gap-6", className)}>
      {isSubmitting && (
        <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center rounded-lg">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}

      <AppForm
        isSubmitting={isSubmitting}
        form={form}
        buttons={buttons}
      >
        {children}
      </AppForm>

      {error && (
        <p className="text-sm font-medium text-red-500 my-2">{error}</p>
      )}
    </div>
  );
}
