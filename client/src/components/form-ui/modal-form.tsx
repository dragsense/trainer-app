// React
import { ReactNode } from "react";
import { useShallow } from 'zustand/shallow';

// External Libraries
import { Loader2 } from "lucide-react";


// UI Components
import { AppDialog } from "@/components/layout-ui/app-dialog";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// Store
import { TFormHandlerStore } from "@/stores";

// Utility Function
import { cn } from "@/lib/utils";


type TDialogWidth = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";


const widthMap: Record<string, string> = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
  "2xl": "sm:max-w-2xl",
  "3xl": "sm:max-w-3xl",
};

interface IModalFormProps<TFormData, TResponse> {
  className?: string;
  open: boolean;
  onOpenChange: (state: boolean) => void;
  title: string;
  description?: string;
  footerContent?: ReactNode;
  children: ReactNode;
  width?: TDialogWidth;
  formStore: TFormHandlerStore<TFormData, TResponse>;
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


    const { onSubmit } = formStore(useShallow(state => ({
     
      onSubmit: state.onSubmit
    })));



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(`max-h-[90vh] overflow-y-auto`, widthMap[width] || "sm:max-w-lg")}
      >
        <form onSubmit={onSubmit}>
          <AppDialog
            title={title}
            description={description}
            footerContent={
              <div>
                {footerContent}

                {false && (
                  <p className="text-sm font-medium text-red-500 my-2">{"error.message"}</p>
                )}
              </div>
            }
          >

            {false && (
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
