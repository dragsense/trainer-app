import { useFormContext } from "react-hook-form";

// UI Components
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

// Utilities
import { cn } from "@/lib/utils";

// Types
import type { FieldConfig } from "@/@types/form/field.type";
import { EORDER_CLASSES } from "@/@types/enums/general.enum";

interface UseInputProps {
  fields: FieldConfig[];
  showRequiredAsterisk?: boolean;
  layout?: "vertical" | "horizontal";
}

export function useInput({
  fields,
  showRequiredAsterisk,
  layout = "vertical",
}: UseInputProps) {

  const inputs = fields.map((field) => {
    const fieldLayout = field.layout || layout;
    const labelOrderClass = field.lableOrder || EORDER_CLASSES.First;
    const inputFlex = labelOrderClass === EORDER_CLASSES.First ? "flex-1" : "";

    return (
      <FormField
        key={field.id}
        name={field.name}
        render={({ field: controllerField }) => {
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
                    placeholder={field.placeholder}
                    disabled={field.disabled}
                    className={commonClass}
                  />
                );

              case "select":
                return (
                  <Select
                    disabled={field.disabled}
                    onValueChange={controllerField.onChange}
                    value={controllerField.value}
                  >
                    <SelectTrigger className={commonClass}>
                      <SelectValue placeholder={field.placeholder || "Select..."} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                );

              case "switch":
                return (
                  <Switch
                    checked={controllerField.value}
                    onCheckedChange={controllerField.onChange}
                    disabled={field.disabled}
                  />
                );

              case "custom":
                return field.Component ? (
                  <field.Component
                    value={controllerField.value}
                    onChange={controllerField.onChange}
                    disabled={field.disabled}
                  />
                ) : null;

              default:
                return (
                  <Input
                    {...controllerField}
                    type={field.type}
                    placeholder={field.placeholder}
                    disabled={field.disabled}
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
                  fieldLayout === "vertical" ? "flex-col justify-center" : "items-center"
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
