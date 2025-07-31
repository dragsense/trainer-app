import { useState, useRef, useCallback } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AppComboBoxProps<T> {
  value: T | T[] | string | string[] | number | number[] | undefined;
  onChange: (value: any) => void;
  items: T[];
  loading?: boolean;
  error?: string | null;
  placeholder?: string;
  searchPlaceholder?: string;
  getLabel: (item: T) => string;
  getKey: (item: T) => string;
  onSearchChange?: (search: string) => void;
  multiple?: boolean;
  searchType?: "local" | "api";
  disabled?: boolean;
  modal?: boolean;
}

export function AppComboBox<T>({
  value,
  onChange,
  items,
  loading,
  error,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  getLabel,
  getKey,
  onSearchChange,
  multiple = false,
  searchType = "local",
  disabled,
  modal = false,
}: AppComboBoxProps<T>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);

  // For popover width
  const [popoverWidth, setPopoverWidth] = useState<number | undefined>(undefined);
  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen && triggerRef.current) {
      setPopoverWidth(triggerRef.current.offsetWidth);
    }
  };

  // Handle search
  const handleSearchChange = useCallback(
    (val: string) => {
      setSearch(val);
      if (searchType === "api" && onSearchChange) {
        onSearchChange(val);
      }
    },
    [searchType, onSearchChange]
  );

  // Local filtering
  const filteredItems =
    searchType === "local"
      ? items.filter((item) =>
          getLabel(item).toLowerCase().includes(search.toLowerCase())
        )
      : items;

  // Multi-select logic
  const selectedKeys = multiple
    ? (Array.isArray(value) ? value.map(String) : [])
    : [];

  const selectedItems = multiple
    ? items.filter((item) => selectedKeys.includes(getKey(item)))
    : [];

  const maxTags = 5;
  const extraCount = multiple ? selectedItems.length - maxTags : 0;

  return (
    <Popover open={open} onOpenChange={handleOpenChange} modal={modal}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          className="w-full justify-between min-h-[40px] h-auto flex-nowrap overflow-hidden"
          disabled={disabled}
          style={{ textAlign: "left" }}
        >
          <span className="flex flex-wrap gap-1 items-center w-full">
            {multiple ? (
              <>
                {selectedItems.length === 0 && (
                  <span className="text-muted-foreground">{placeholder}</span>
                )}
                {selectedItems.slice(0, maxTags).map((item) => (
                  <Badge
                    key={getKey(item)}
                    variant="secondary"
                    className="truncate max-w-[120px]"
                    title={getLabel(item)}
                  >
                    {getLabel(item)}
                  </Badge>
                ))}
                {extraCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="truncate"
                    title={selectedItems.slice(maxTags).map(getLabel).join(", ")}
                  >
                    +{extraCount} more
                  </Badge>
                )}
              </>
            ) : (
              <span>
                {items.find((item) => getKey(item) === value)
                  ? getLabel(items.find((item) => getKey(item) === value)!)
                  : placeholder}
              </span>
            )}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0"
        style={popoverWidth ? { width: popoverWidth } : {}}
        align="start"
      >
        <Command>
          <CommandInput
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={handleSearchChange}
            disabled={disabled}
          />
          <CommandList>
            {loading ? (
              <div className="flex items-center justify-center p-4">
                Loading...
              </div>
            ) : error ? (
              <CommandEmpty className="py-6 text-center text-destructive">
                {error}
              </CommandEmpty>
            ) : filteredItems.length === 0 ? (
              <CommandEmpty>No results found</CommandEmpty>
            ) : (
              <div style={{ maxHeight: "300px", overflow: "auto" }}>
                <CommandGroup>
                  {filteredItems.map((item) => (
                    <CommandItem
                      key={getKey(item)}
                      onSelect={() => {
                        if (multiple) {
                          const key = getKey(item);
                          if (selectedKeys.includes(key)) {
                            onChange(selectedKeys.filter((k) => k !== key));
                          } else {
                            onChange([...selectedKeys, key]);
                          }
                        } else {
                          onChange(getKey(item));
                          setOpen(false);
                        }
                      }}
                      className="cursor-pointer"
                    >
                      {multiple && (
                        <Checkbox
                          checked={selectedKeys.includes(getKey(item))}
                          className="pointer-events-none"
                        />
                      )}
                      <span className="ml-2">{getLabel(item)}</span>
                      {!multiple && (
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4",
                            value === getKey(item) ? "opacity-100" : "opacity-0"
                          )}
                        />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}