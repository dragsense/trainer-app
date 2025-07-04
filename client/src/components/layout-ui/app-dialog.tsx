// React
import { ReactNode } from "react";

// Custom UI Components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";


const widthClasses = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
  "2xl": "sm:max-w-2xl",
  "3xl": "sm:max-w-3xl",
  "4xl": "sm:max-w-4xl",
  full: "sm:max-w-full",
};

interface ModalProps {
  open: boolean;
  onOpenChange: (state: boolean) => void;
  title: string | ReactNode;
  description?: string;
  footerContent?: ReactNode;
  children: ReactNode;
  width?: keyof typeof widthClasses;
}

export const AppModal = ({
  open,
  onOpenChange,
  title,
  description,
  footerContent,
  children,
  width = "md",
}: ModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} >
      <DialogContent
        className={`${widthClasses[width]} max-h-[90vh] overflow-y-auto`}
      >
        <DialogHeader>
          {typeof title === "string" ? (
            <DialogTitle>{title}</DialogTitle>
          ) : (
            title
          )}
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {children}

        {footerContent && (
          <DialogFooter className="mt-6">{footerContent}</DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
