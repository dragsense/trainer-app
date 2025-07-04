import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  value?: Date;
  onSelect?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  fromDate?: Date;
  toDate?: Date;
  required?: boolean;
  showClear?: boolean;
}

export function DatePicker({
  value,
  onSelect,
  placeholder = "Pick a date",
  className,
  disabled = false,
  fromDate,
  toDate,
  required = false,
  showClear = true,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [internalDate, setInternalDate] = React.useState<Date | undefined>(
    value
  );

  const handleSelect = (date: Date | undefined) => {
    const newDate = date;
    setInternalDate(newDate);
    onSelect?.(newDate);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInternalDate(undefined);
    onSelect?.(undefined);
  };

  React.useEffect(() => {
    if (value !== internalDate) {
      setInternalDate(value);
    }
  }, [value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "justify-start text-left font-normal",
            !internalDate && "text-muted-foreground",
            className
          )}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {internalDate ? (
                format(internalDate, "PPP")
              ) : (
                <span>{placeholder}</span>
              )}
              {required && !internalDate && (
                <span className="ml-2 text-red-500">*</span>
              )}
            </div>
            {showClear && internalDate && (
              <div
                className="h-4 w-4 p-0 ml-2 rounded-full hover:bg-transparent"
                onClick={handleClear}
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </div>
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={internalDate}
          onSelect={handleSelect}
          initialFocus
          disabled={(date) => {
            if (fromDate && date < fromDate) return true;
            if (toDate && date > toDate) return true;
            return false;
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
