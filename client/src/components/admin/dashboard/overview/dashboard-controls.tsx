import React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DatePicker } from "@/components/shared-ui/date-picker"
import type { DateRange } from "react-day-picker"

interface IDashboardControlsProps {
  period: "day" | "week" | "month" | "year"
  setPeriod: (period: "day" | "week" | "month" | "year") => void
  customRange?: DateRange
  setCustomRange: (fromDate?: Date, toDate?: Date) => void
}

export const DashboardControls: React.FC<IDashboardControlsProps> = ({
  period,
  setPeriod,
  customRange,
  setCustomRange,
}) => {
  const handleDateSelect = (date: Date | DateRange | undefined) => {

    if (!date) {
      setCustomRange()
      return;
    }

    if (date instanceof Date) {
      setCustomRange(date)
    } else if ("from" in date) {
      const { from, to } = date
      if (from && to) {
        setCustomRange(from, to)
      } else if (from) {
        setCustomRange(from)
      }
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-end">
      <div className="flex gap-2">
        <DatePicker
          value={customRange}
          onSelect={handleDateSelect}
          placeholder="Custom range"
          mode="range"
        />

        <Select
          value={period}
          onValueChange={(value: "day" | "week" | "month" | "year") =>
            setPeriod(value)
          }
        >
          <SelectTrigger className="w-32 bg-secondary">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Daily</SelectItem>
            <SelectItem value="week">Weekly</SelectItem>
            <SelectItem value="month">Monthly</SelectItem>
            <SelectItem value="year">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
