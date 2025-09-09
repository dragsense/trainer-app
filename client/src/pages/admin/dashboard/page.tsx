import { Period } from "@/@types/dashboard.type"
import { DashboardControls } from "@/components/admin"
import { PageInnerLayout } from "@/layouts"
import { DashboardOverview } from "@/page-components/dashboard"
import { useState } from "react"
import type { DateRange } from "react-day-picker"


export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>("month")
  const [customRange, setCustomRange] = useState<DateRange | undefined>()

  return (
    <PageInnerLayout
      Header={
        <Header
          period={period}
          setPeriod={setPeriod}
          customRange={customRange}
          setCustomRange={setCustomRange}
        />
      }
    >
      <DashboardOverview period={period} customRange={customRange}  />
    </PageInnerLayout>
  )
}

interface HeaderProps {
  period: Period
  setPeriod: React.Dispatch<React.SetStateAction<Period>>
  customRange?: DateRange
  setCustomRange: React.Dispatch<React.SetStateAction<DateRange | undefined>>
}

const Header = ({
  period,
  setPeriod,
  customRange,
  setCustomRange,
}: HeaderProps) => (
  <DashboardControls
    period={period}
    setPeriod={setPeriod}
    customRange={customRange}
    setCustomRange={(fromDate, toDate) =>
      fromDate ? setCustomRange({ from: fromDate, to: toDate }) : setCustomRange(undefined)
    }
  />
)
