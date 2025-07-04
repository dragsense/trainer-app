import { DatePicker } from "@/components/ui/date-picker";

interface TableDateFilterProps {
  placeholder?: string;
  onSelect: (date: Date | undefined) => void;
  value?: Date;
}

export function TableDateFilter({
  placeholder = "Pick a date",
  onSelect,
  value,
}: TableDateFilterProps) {
  return (
    <DatePicker value={value} placeholder={placeholder} onSelect={onSelect} />
  );
}
