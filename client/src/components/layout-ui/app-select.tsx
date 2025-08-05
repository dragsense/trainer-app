import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface Option {
    value: string;
    label: string;
}

/** ---- Props: discriminated by `multiple` ---- */
type BaseProps = {
    options: Option[];
    placeholder?: string;
    className?: string;
};

type MultiProps = BaseProps & {
    multiple: true;
    value: string[];
    onChange: (value: string[]) => void;
};

type SingleProps = BaseProps & {
    multiple?: false;
    value: string | undefined;
    onChange: (value: string | undefined) => void;
};

type AppSelectProps = MultiProps | SingleProps;

export function AppSelect({
    options,
    value,
    onChange,
    placeholder = "Select…",
    className,
    multiple = false,
}: AppSelectProps) {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState("");

    const onClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (multiple) {
            (onChange as (v: string[]) => void)([]);
        } else {
            (onChange as (v: string | undefined) => void)(undefined);
        }
    };

    const handleSelect = (optionValue: string) => {
        if (multiple) {
            const v = value as string[];
            const exists = v.includes(optionValue);
            const updated = exists ? v.filter((i) => i !== optionValue) : [...v, optionValue];
            (onChange as (v: string[]) => void)(updated);
        } else {
            const current = value as string | undefined;
            const next = current === optionValue ? undefined : optionValue;
            (onChange as (v: string | undefined) => void)(next);
            setOpen(false);
        }
    };

    const isSelected = (optVal: string) =>
        multiple
            ? (value as string[]).includes(optVal)
            : (value as string | undefined) === optVal;

    const selectedLabels =
        multiple
            ? (value as string[]).map(
                (v) => options.find((o) => o.value === v)?.label ?? v
            )
            : options.find((o) => o.value === value)?.label;

    const hasSelection = multiple ? (value as string[]).length > 0 : !!value;

    const filtered = React.useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return options;
        return options.filter(
            (o) =>
                o.label.toLowerCase().includes(q) ||
                o.value.toLowerCase().includes(q)
        );
    }, [options, search]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between", className)}
                >
                    <div className="flex items-center gap-1 flex-wrap text-left">
                        {!hasSelection && <span className="text-muted-foreground">{placeholder}</span>}

                        {multiple ? (
                            hasSelection &&
                            (value as string[]).map((item) => (
                                <Badge key={item} variant="secondary" className="mr-1 mb-1">
                                    {options.find((o) => o.value === item)?.label ?? item}
                                </Badge>
                            ))
                        ) : (
                            hasSelection && <span>{selectedLabels}</span>
                        )}
                    </div>

                    <div className="flex items-center gap-1">
                        {hasSelection && (
                            <X
                                className="h-4 w-4 opacity-60 hover:opacity-100"
                                onClick={onClear}
                            />
                        )}
                        <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
                    </div>
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command shouldFilter={false}>
                    <CommandInput
                        value={search}
                        onValueChange={setSearch}
                        placeholder="Search…"
                    />
                    <CommandEmpty>No options found.</CommandEmpty>
                    <CommandGroup>
                        {filtered.map((option) => {
                            const selected = isSelected(option.value);
                            return (
                                <CommandItem
                                    key={option.value}
                                    onSelect={() => handleSelect(option.value)}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selected ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            );
                        })}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
