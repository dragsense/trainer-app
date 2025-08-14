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

type OptionValue = string | number;

interface Option {
    value: OptionValue;
    label: string;
}

/** ---- Props: discriminated by `multiple` ---- */
type BaseProps = {
    options: Option[];
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    emptyText?: string;
};

type MultiProps = BaseProps & {
    multiple: true;
    value: OptionValue[];
    onChange: (value: OptionValue[]) => void;
};

type SingleProps = BaseProps & {
    multiple?: false;
    value: OptionValue | undefined;
    onChange: (value: OptionValue | undefined) => void;
};

type AppSelectProps = MultiProps | SingleProps;

function toKey(v: OptionValue) {
    return String(v);
}

export function AppSelect({
    options,
    value,
    onChange,
    placeholder = "Select…",
    className,
    multiple = false,
    disabled = false,
    emptyText = "No options found.",
}: AppSelectProps) {
    const [open, setOpen] = React.useState(false);

    // Map value -> label (keys must be strings)
    const labelMap = React.useMemo(
        () => Object.fromEntries(options.map((o) => [toKey(o.value), o.label])),
        [options]
    );

    const isSelected = React.useCallback(
        (val: OptionValue) =>
            multiple
                ? (value as OptionValue[]).some((v) => toKey(v) === toKey(val))
                : toKey(value as OptionValue | undefined ?? "") === toKey(val),
        [multiple, value]
    );

    const toggle = (val: OptionValue) => {
        if (multiple) {
            const list = value as OptionValue[];
            const exists = list.some((v) => toKey(v) === toKey(val));
            const next = exists ? list.filter((v) => toKey(v) !== toKey(val)) : [...list, val];
            (onChange as (v: OptionValue[]) => void)(next);
        } else {
            const current = value as OptionValue | undefined;
            const next = current !== undefined && toKey(current) === toKey(val) ? undefined : val;
            (onChange as (v: OptionValue | undefined) => void)(next);
            setOpen(false);
        }
    };

    const clearAll = (e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation?.();
        if (multiple) {
            (onChange as (v: OptionValue[]) => void)([]);
        } else {
            (onChange as (v: OptionValue | undefined) => void)(undefined);
        }
    };

    const hasSelection = multiple
        ? (value as OptionValue[]).length > 0
        : value !== undefined && value !== null && value !== "";

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    disabled={disabled}
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "w-full h-auto min-h-10 py-2 pl-3 pr-2",
                        "justify-between items-start",
                        "text-left whitespace-normal",
                        "flex flex-wrap gap-1",
                        className
                    )}
                >
                    <div className="flex flex-1 items-center gap-1 flex-wrap">
                        {!hasSelection && (
                            <span className="text-muted-foreground">{placeholder}</span>
                        )}

                        {multiple ? (
                            (value as OptionValue[]).map((v) => {
                                const key = toKey(v);
                                return (
                                    <Badge
                                        key={key}
                                        variant="secondary"
                                        className="mr-1 mb-1 flex items-center gap-1"
                                    >
                                        {labelMap[key] ?? key}

                                    </Badge>
                                );
                            })
                        ) : (
                            hasSelection && (
                                <span>{labelMap[toKey(value as OptionValue)] ?? toKey(value as OptionValue)}</span>
                            )
                        )}
                    </div>

                    <div className="flex items-center gap-0 ml-auto">
                        {hasSelection && (
                            <Button variant="ghost" size="sm" onClick={clearAll}>
                            <X
                                className="h-4 w-4 shrink-0 opacity-60 hover:opacity-100"
                                
                            />
                            </Button>
                        )}
                        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                    </div>
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                {/* Use built-in cmdk filtering by providing item values */}
                <Command>
                    <CommandInput placeholder="Search…" />
                    <CommandEmpty>{emptyText}</CommandEmpty>
                    <CommandGroup className="w-100 max-h-60 overflow-y-auto">
                        {options.map((option) => {
                            const selected = isSelected(option.value);
                            return (
                                <CommandItem
                                    key={toKey(option.value)}
                                    value={`${option.label} ${toKey(option.value)}`}
                                    onSelect={() => toggle(option.value)}
                                    aria-selected={selected}
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
