// React
import { useEffect, useState } from "react";

// External Icons
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";

// Utils
import { cn } from "@/lib/utils";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";


interface AppComboBoxProps<T> {
  value?: string;
  onChange: (value: T) => void;
  items: T[];
  loading?: boolean;
  disabled?: boolean;
  error?: string | null;
  placeholder?: string;
  searchPlaceholder?: string;
  getLabel?: (item: T) => string;
  getKey?: (item: T) => string;
  onSearchChange: (searchTerm: string) => void;
  modal?: boolean
}

export function AppComboBox<T>({
  value,
  onChange,
  items,
  loading,
  error,
  disabled,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  getLabel = (item) => String(item),
  getKey = (item) => String(item),
  onSearchChange,
  modal = false
}: AppComboBoxProps<T>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={modal}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between"
          disabled={disabled}
        >
          {value ? value : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput
            placeholder={searchPlaceholder}
            value={search}
            disabled={disabled}
            onValueChange={setSearch}
          />
          <CommandList>
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </div>
            ) : error ? (
              <CommandEmpty className="py-6 text-center text-destructive">
                {error}
              </CommandEmpty>
            ) : items.length === 0 ? (
              <CommandEmpty>No results found</CommandEmpty>
            ) : (
              <CommandGroup>
                {items.map((item) => (
                  <CommandItem
                    key={getKey(item)}
                    onSelect={() => {
                      onChange(item);
                      setOpen(false);
                    }}
                  >
                    {getLabel(item)}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        value === item ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
