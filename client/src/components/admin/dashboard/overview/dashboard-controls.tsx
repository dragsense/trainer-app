import React, { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DatePicker } from "@/components/shared-ui/date-picker"
import type { DateRange } from "react-day-picker"
import { ICombinedDashboardData } from "@/@types/dashboard.type"
import { AnalyticsPeriod } from "#/modules/v1/dashboard/enums/dashboard-analytics.enum";

import { IExtraProps } from "./dashboard-view"
import { TSingleHandlerStore } from "@/stores"

interface IDashboardControlsProps {
  store: TSingleHandlerStore<ICombinedDashboardData, IExtraProps>
}

export const DashboardControls: React.FC<IDashboardControlsProps> = ({
  store
}) => {

  const period = store((state) => state.extra.period)
  const customRange = store((state) => state.extra.customRange)
  const setExtra = store((state) => state.setExtra)

  const handleDateSelect = (date: Date | DateRange | undefined) => {

    if (!date) {
      setExtra('customRange')
      return;
    }

    if (date instanceof Date) {
      setExtra('customRange', { from: date })
    } else if ("from" in date) {
      const { from, to } = date

      if (from && to && from.getTime() !== to.getTime()) {
        setExtra('customRange', { from, to })
      } else if (from) {
        setExtra('customRange', { from })
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
          onValueChange={(value: AnalyticsPeriod) =>
            setExtra('period', value)
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
