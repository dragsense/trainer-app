// React
import { ReactNode } from "react";

// External Libraries
import { Loader2 } from "lucide-react";

//Types
import { IFormStoreApi } from "@/@types/handler-types";

// Utils
import { cn } from "@/lib/utils";

// Stores
import { useStore } from "zustand";


interface ISimpleFormProps<TFormData, TResponse> {
  className?: string;
  isSubmitting?: boolean;
  error?: string | null;
  children: ReactNode;
  buttons?: ReactNode;
  formStore: IFormStoreApi<TFormData, TResponse>;
}

export function SimpleForm<TFormData, TResponse>({
  className,
  children,
  formStore,
}: ISimpleFormProps<TFormData, TResponse>) {

  const { isSubmitting, error, onSubmit } = useStore(formStore);

  return (
    <form onSubmit={onSubmit}>
      <div className={cn("relative flex flex-col gap-6", className)}>

        {isSubmitting && (
          <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center rounded-lg">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}

        {children}

        {error && (
          <p className="text-sm font-medium text-red-500 my-2">{error.message}</p>
        )}
      </div>
    </form>
  );
}
