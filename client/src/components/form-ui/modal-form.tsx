// React
import { ReactNode } from "react";

// External Libraries
import { Loader2 } from "lucide-react";

// Types
import { IFormStoreApi } from "@/@types/handler-types";

// UI Components
import { AppDialog } from "@/components/layout-ui/app-dialog";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// Store
import { useStore } from "zustand";

interface IModalFormProps<TFormData, TResponse> {
  className?: string;
  open: boolean;
  onOpenChange: (state: boolean) => void;
  title: string;
  description?: string;
  footerContent?: ReactNode;
  children: ReactNode;
  width?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "full";
  formStore: IFormStoreApi<TFormData, TResponse>;
}

export function ModalForm<TFormData, TResponse>({
  open,
  onOpenChange,
  title,
  description,
  footerContent,
  children,
  width = "lg",
  formStore,
}: IModalFormProps<TFormData, TResponse>) {

  const { isSubmitting, error, onSubmit } = useStore(formStore);


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`sm:max-w-${width} max-h-[90vh] overflow-y-auto`}
      >
        <form onSubmit={onSubmit}>
          <AppDialog
            title={title}
            description={description}
            footerContent={
              <div>
                {footerContent}

                {error && (
                  <p className="text-sm font-medium text-red-500 my-2">{error.message}</p>
                )}
              </div>
            }
          >

            {isSubmitting && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}

            {children}

          </AppDialog>
        </form>
      </DialogContent>
    </Dialog>
  );
}
