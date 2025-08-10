

import { useState } from "react";
import { ChevronDownIcon, Star } from "lucide-react";


// UI Components
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";

// Utilities
import { cn } from "@/lib/utils";

// Types
import type { TFieldConfig } from "@/@types/form/field.type";
import { EORDER_CLASSES } from "@/enums/general.enum";

// App Layout Components
import { AppSelect } from "@/components/layout-ui/app-select";
import { useWatch } from "react-hook-form";

interface UseInputProps {
  fields: TFieldConfig[];
  showRequiredAsterisk?: boolean;
  layout?: "vertical" | "horizontal";
}

export function useInput({
  fields,
  showRequiredAsterisk,
  layout = "vertical",
}: UseInputProps) {


  const convertValue = (input: unknown, type?: string): any => {
    const getValue = (val: any) => {
      if (val === "") return val;
      if (type === "number") return Number(val);
      if (type === "boolean") return !!val;
      if (type === "date") return new Date(val);
      return val;
    };

    let rawValue: any =
      input && typeof input === "object" && "target" in input
        ? (input as any).target.value
        : input;


    return Array.isArray(rawValue)
      ? rawValue.map(getValue)
      : getValue(rawValue);
  };



  const inputs = fields.map((field, index) => {

    const fieldLayout = field.layout || layout;
    const labelOrderClass = field.lableOrder || EORDER_CLASSES.First;
    const inputFlex = labelOrderClass === EORDER_CLASSES.First ? "flex-1" : "";

    return (
      <FormField
        key={field.id}
        name={field.name}

        render={({ field: controllerField }) => {

          const [open, setOpen] = useState<boolean>(false);
          const values = useWatch();

          const isVisible = field.visible ? field.visible({ values }) : true;
          const isDisabled = typeof field.disabled === "function" ? field.disabled({ values }) : field.disabled;

          const onChangeHandler = (value: any) => {
            const parsed = convertValue(value, field.valueType);
            // Trigger RHF control
            controllerField.onChange(parsed);
            field?.onChange?.(parsed);
          };
          const commonClass = cn(
            field.startAdornment && "pl-10",
            field.endAdornment && "pr-10",
            field.className
          );

          const renderInput = () => {
            switch (field.type) {
              case "textarea":
                return (
                  <Textarea
                    {...controllerField}
                    onChange={onChangeHandler}
                    placeholder={field.placeholder}
                    disabled={isDisabled}
                    className={commonClass}
                  />
                );

              case "select":
                return (
                  <AppSelect
                    value={controllerField.value || []}
                    onChange={onChangeHandler}
                    options={field.options || []}
                  />
                );
              case "multiSelect":
                return (
                  <AppSelect
                    value={controllerField.value || []}
                    onChange={onChangeHandler}
                    options={field.options || []}
                    multiple={true}
                  />
                );

              case "switch":
                return (
                  <Switch
                    checked={controllerField.value}
                    onCheckedChange={onChangeHandler}
                    disabled={isDisabled}
                  />
                );
              case "rating":
                return (
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Button
                        key={star}
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => controllerField.onChange(star)}
                        className="text-yellow-500 hover:scale-110 transition-transform"
                      >
                        {star <= controllerField.value ? <Star fill="yellow" /> : <Star />}
                      </Button>
                    ))}
                  </div>
                );
              case "file":
                return (
                  <div
                    className={cn(
                      "border border-dashed border-muted rounded-lg p-4 text-center cursor-pointer hover:bg-muted transition-colors",
                      field.className
                    )}
                  >
                    <Input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) controllerField.onChange(file);
                      }}
                      disabled={isDisabled}
                      className="hidden"
                      id={`file-input-${field.id}`}
                    />
                    <Label htmlFor={`file-input-${field.id}`} className="block cursor-pointer">
                      {controllerField.value ? (
                        <div className="text-sm">{controllerField.value.name}</div>
                      ) : (
                        <div className="text-muted-foreground">
                          📂 Drop or click to upload
                        </div>
                      )}
                    </Label>
                  </div>
                );
              case "slider":
                return (
                  <div className="space-y-1">
                    <Slider
                      defaultValue={[controllerField.value ?? field.defaultValue ?? 0]}
                      value={[controllerField.value]}
                      onValueChange={(val) => controllerField.onChange(val[0])}
                      min={field.min ?? 0}
                      max={field.max ?? 100}
                      step={field.step ?? 1}
                      disabled={isDisabled}
                    />
                    <div className="text-sm text-muted-foreground text-right">
                      {controllerField.value ?? 0}
                    </div>
                  </div>
                );
              case "date":
                return (
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        id="date-picker"
                        className="w-32 justify-between font-normal"
                      >
                        {controllerField.value
                          ? new Date(controllerField.value).toLocaleDateString()
                          : "Select date"}
                        <ChevronDownIcon />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={controllerField.value}
                        captionLayout="dropdown"
                        onSelect={(date) => {
                          controllerField.onChange(date);
                          setOpen(false)
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                );
              case "datetime":
                return (
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-auto justify-between font-normal"
                      >
                        {controllerField.value
                          ? new Date(controllerField.value).toLocaleString()
                          : "Select date & time"}
                        <ChevronDownIcon className="ml-2 h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-auto p-4 space-y-2" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          controllerField.value ? new Date(controllerField.value) : undefined
                        }
                        onSelect={(date) => {
                          if (date) {
                            const current = new Date(controllerField.value || new Date());
                            date.setHours(current.getHours());
                            date.setMinutes(current.getMinutes());
                            controllerField.onChange(date);
                          }
                        }}
                      />

                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Time:</Label>
                        <Input
                          type="time"
                          className="border rounded px-2 py-1 text-sm"
                          value={
                            controllerField.value
                              ? new Date(controllerField.value)
                                .toTimeString()
                                .slice(0, 5)
                              : ""
                          }
                          onChange={(e) => {
                            const [hours, minutes] = e.target.value.split(":").map(Number);
                            const date = controllerField.value
                              ? new Date(controllerField.value)
                              : new Date();
                            date.setHours(hours);
                            date.setMinutes(minutes);
                            controllerField.onChange(date);
                          }}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                );

              case "custom":
                return field.Component ? (
                  <field.Component
                    value={controllerField.value}
                    onChange={onChangeHandler}
                    disabled={isDisabled}
                  />
                ) : null;

              default:
                return (
                  <Input
                    {...controllerField}
                    value={controllerField.value?.toString() || ""}
                    type={field.type}
                    onChange={onChangeHandler}
                    placeholder={field.placeholder}
                    disabled={isDisabled}
                    className={commonClass}
                  />
                );
            }
          };

          return (
            <FormItem>
              <div
                className={cn(
                  "gap-2 flex",
                  fieldLayout === "vertical" ? "flex-col justify-center" : "items-center",
                  isVisible ? "" : "hidden"
                )}
              >
                {field.label && (
                  <FormLabel className={`text-muted-foreground ${labelOrderClass}`}>
                    {field.label}
                    {showRequiredAsterisk && field.required && (
                      <span className="text-red-500">*</span>
                    )}
                  </FormLabel>
                )}

                <FormControl className={inputFlex}>
                  <div className="relative">
                    {field.startAdornment && (
                      <div className="absolute left-3 top-2.5 flex items-center pointer-events-none">
                        {field.startAdornment}
                      </div>
                    )}

                    {renderInput()}

                    {field.endAdornment && field.type !== "select" && (
                      <div className="absolute right-3 top-2.5 flex items-center">
                        {field.endAdornment}
                      </div>
                    )}
                  </div>
                </FormControl>
              </div>

              <FormMessage />
              {field.bottomAdornment && (
                <FormDescription>{field.bottomAdornment}</FormDescription>
              )}
            </FormItem>
          );
        }}
      />
    );
  });

  return { inputs };
}
