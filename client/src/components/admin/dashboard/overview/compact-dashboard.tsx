
import type React from "react"

import { Badge } from "@/components/ui/badge"
import {
    Users,
    Calendar,
    TrendingUp,
    TrendingDown,
    Target,

    CheckCircle,
    AlertTriangle,

    Activity,
    Hourglass,

} from "lucide-react"
import { AppCard } from "@/components/layout-ui/app-card"

// Types
import { ICombinedDashboardData } from "@/@types/dashboard.type"
import { BillingOverview, RemindersAnalyticsCard, SessionsAnalyticsCard } from "./cards"
import { useAuthUser } from "@/hooks/use-auth-user"
import { UserLevels, UserRole } from "#/modules/v1/users/enums/user.enum"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"

import RevenueIcon from '@/assets/icons/revenue.png';
import PendingPymentsIcon from '@/assets/icons/payments.png';
import TrainersIcon from '@/assets/icons/trainers.png';
import ClientsIcon from '@/assets/icons/clients.png';
import { Progress } from "@/components/ui/progress"
import { TSingleHandlerStore } from "@/stores"
import { IExtraProps } from "./dashboard-view"


interface CompactDashboardProps {
    store: TSingleHandlerStore<ICombinedDashboardData, IExtraProps>
}

// Compact metric display
function MetricRow({
    icon,
    label,
    value,
    change,
    trend,
    secondary,
}: {
    icon: React.ReactNode
    label: string
    value: string | number
    change?: string
    trend?: "up" | "down" | "neutral"
    secondary?: string
}) {
    return (
        <div className="flex items-center justify-between py-2 border-b last:border-b-0">
            <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="flex-shrink-0">{icon}</div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium  truncate">{label}</p>
                    {secondary && <p className="text-xs ">{secondary}</p>}
                </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-lg font-bold">{value}</span>
                {change && (
                    <Badge
                        variant={trend === "up" ? "default" : trend === "down" ? "destructive" : "secondary"}
                        className="text-xs px-1 py-0"
                    >
                        {trend === "up" && <TrendingUp className="h-3 w-3" />}
                        {trend === "down" && <TrendingDown className="h-3 w-3" />}
                        {change}
                    </Badge>
                )}
            </div>
        </div>
    )
}

// Ultra-compact KPI card
function KPICard({
    title,
    subtitle,
    metrics,
    alert,
}: {
    title: string,
    subtitle: string
    metrics: Array<{
        label: string
        value: number
        status?: "good" | "warning" | "danger"
        icon?: React.ReactNode
    }>
    alert?: string
}) {
    return (
        <AppCard className="h-fit">

            <div className="mb-2">
                <h3 className="font-semibold text-md flex items-center gap-2">
                    {title}
                    {alert && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                </h3>
                {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>
            <div className="space-y-2">
                {metrics.map((metric, index) => (
                    <div key={index} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-5 justify-between">
                        <div className="flex flex-1 items-center gap-2">
                            {metric.icon && <span className="">{metric.icon}</span>}
                            <span className="text-xs ">{metric.label}</span>

                        </div>
                        <div
                            className={`text-sm flex-1 text-right bg-secondary/20 font-bold ${metric.status === "good"
                                ? "text-foreground/70"
                                : metric.status === "warning"
                                    ? "text-foreground/80"
                                    : metric.status === "danger"
                                        ? "text-foreground/90"
                                        : "text-foreground"
                                }`}
                        >
                            <span className="px-2">{metric.value}%</span>
                            <Progress className="bg-secondary/20" subClassName="bg-secondary" value={metric.value} />

                        </div>
                    </div>
                ))}
            </div>
            {alert && (
                <div className="mt-3 p-2 bg-amber-50 rounded text-xs text-amber-700 border-l-2 border-amber-200">{alert}</div>
            )}

        </AppCard>
    )
}

const ClientDashboardPlaceholder = () => {
    return (
        <div className="flex items-center justify-center min-h-[60vh] p-6">
            <AppCard
                header={
                    <div className="flex items-center gap-3">
                        <Hourglass className="w-6 h-6 text-muted-foreground" />
                        <h2 className="text-xl font-semibold">Client Dashboard</h2>
                    </div>
                }
                footer={
                    <Button onClick={() => window.location.reload()}>
                        Refresh when ready
                    </Button>
                }
                className="max-w-md w-full text-center"
            >
                <p className="text-muted-foreground mb-3">
                    Your client dashboard is under construction and will be available soon.
                </p>
                <p className="text-sm text-muted-foreground">
                    We’re working on bringing you insights, schedules, and progress tracking right here.
                    Check back later for updates!
                </p>
            </AppCard>
        </div>
    );
};


export default function CompactDashboard({ store }: CompactDashboardProps) {

    const period = store((state) => state.extra.period)
    const customRange = store((state) => state.extra.customRange)
    const isLoading = store((state) => state.isLoading)
    const data = store((state) => state.response)
    const error = store((state) => state.error)


    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <AppCard key={i}>
                        <div className="p-4">
                            <div className="animate-pulse space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4" />
                                <div className="h-6 bg-gray-200 rounded w-1/2" />
                                <div className="h-3 bg-gray-200 rounded w-full" />
                            </div>
                        </div>
                    </AppCard>
                ))}
            </div>
        )
    }

    const { user } = useAuthUser();


    if (user?.level === UserLevels[UserRole.USER]) {
        return (
            <ClientDashboardPlaceholder />
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <p className="text-red-500 mb-4">Error: {error.message}</p>
            </div>
        );
    }

    if (!data) {
        return <div>No dashboard data available</div>;
    }



    const periodLabel = period
        ? `${period.charAt(0).toUpperCase() + period.slice(1)} Overview`
        : '';

    const dynamicDateLabel = customRange ? `${customRange.from?.toDateString()} - ${customRange.to?.toDateString()}` : periodLabel

    const { stats, billing, reminders, sessions } = data;
    const { overview, metrics } = stats;

    // Calculate derived metrics
    const clientTrainerRatio =
        overview.totalTrainers > 0 ? (overview.totalClients / overview.totalTrainers).toFixed(1) : "0"
    const activeClientRate =
        overview.totalClients > 0 ? ((overview.totalActiveClients / overview.totalClients) * 100).toFixed(1) : "0"
    const activeTrainerRate =
        overview.totalTrainers > 0 ? ((overview.totalActiveTrainers / overview.totalTrainers) * 100).toFixed(1) : "0"
    const sessionUtilization =
        overview.totalSessions > 0 ? ((overview.activeSessions / overview.totalSessions) * 100).toFixed(1) : "0"
    const billingPendingRate =
        overview.totalBillings > 0 ? ((overview.pendingBillings / overview.totalBillings) * 100).toFixed(1) : "0"
    const avgRevenuePerClient =
        overview.totalClients > 0 && overview.paidBillings > 0
            ? (overview.paidBillings / overview.totalClients).toFixed(0)
            : "0"

    return (
        <div className="space-y-6">
            {/* People & Capacity */}

            <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">


                <div className="space-y-2">

                    <AppCard
                        className="gap-2"
                        header={
                            <div>
                                <h2 className="font-semibold text-md">Summary</h2>
                                <p className="text-xs text-muted-foreground">{dynamicDateLabel}</p>
                            </div>
                        }
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">

                            <AppCard
                                className="flex-1 gap-2 bg-primary/30 shadow-2xl"
                                header={<span className="text-sm font-medium">Total Revenue</span>}
                                footer={<p className="text-sm text-muted-foreground">{`${billing.revenue.transactions} transactions`}</p>}
                            >
                                <div className="space-y-2">
                                    <img src={RevenueIcon} />
                                    <div className="text-2xl font-bold">{formatCurrency(billing.revenue.total / 100)}</div>
                                </div>
                            </AppCard>

                            <AppCard
                                className="flex-1 gap-2 bg-[#FFE2E5] shadow-2xl"
                                header={<span className="text-sm font-medium">Pending BIllings</span>}
                                footer={<p className="text-sm text-muted-foreground">{`${billing.summary.pending_billings} awaiting`}</p>}
                            >
                                <div className="space-y-2">
                                    <img src={PendingPymentsIcon} />
                                    <div className="text-2xl font-bold">{formatCurrency(billing.summary.total_pending / 100)}</div>
                                </div>
                            </AppCard>


                            <AppCard
                                className="flex-1 gap-2 bg-secondary/30 shadow-2xl"
                                header={<span className="text-sm font-medium">Total Trainers</span>}
                                footer={<p className="text-sm text-muted-foreground">{`Active ${activeClientRate}%`}</p>}
                            >
                                <div className="space-y-2">
                                    <img src={TrainersIcon} />
                                    <div className="text-2xl font-bold">{overview.totalTrainers}</div>
                                </div>
                            </AppCard>


                            <AppCard
                                className="flex-1 gap-2 bg-[#DCFCE7] shadow-2xl"
                                header={<span className="text-sm font-medium">Total Clients</span>}
                                footer={<p className="text-sm text-muted-foreground">{`Active ${overview.totalActiveClients}/${overview.totalClients}`}</p>}
                            >
                                <div className="space-y-2">
                                    <img src={ClientsIcon} />
                                    <div className="text-2xl font-bold">{overview.totalClients}</div>
                                </div>
                            </AppCard>


                        </div>
                    </AppCard>


                </div>


                <KPICard
                    title="Performance Overview"
                    subtitle={dynamicDateLabel}
                    metrics={[
                        {
                            label: "Session Completion",
                            value: metrics.sessionCompletionRate,
                            status:
                                metrics.sessionCompletionRate > 80 ? "good" : metrics.sessionCompletionRate > 50 ? "warning" : "danger",
                            icon: <Calendar className="h-3 w-3" />,
                        },
                        {
                            label: "Client Engagement",
                            value: +activeClientRate,
                            status:
                                Number.parseFloat(activeClientRate) > 80
                                    ? "good"
                                    : Number.parseFloat(activeClientRate) > 60
                                        ? "warning"
                                        : "danger",
                            icon: <Users className="h-3 w-3" />,
                        },

                        {
                            label: "Session Utilization",
                            value: +sessionUtilization,
                            status:
                                Number.parseFloat(sessionUtilization) > 80
                                    ? "good"
                                    : Number.parseFloat(sessionUtilization) > 60
                                        ? "warning"
                                        : "danger",
                            icon: <Calendar className="h-3 w-3" />,
                        },

                    ]}
                    alert={
                        metrics.sessionCompletionRate === 0 && overview.totalSessions > 0
                            ? "No sessions completed yet - check session management"
                            : metrics.paymentSuccessRate === 0 && overview.totalBillings > 0
                                ? "Payment processing needs attention"
                                : Number.parseFloat(billingPendingRate) > 50
                                    ? `${billingPendingRate}% of billings are pending`
                                    : overview.totalReminders > 5
                                        ? "High number of pending reminders"
                                        : undefined
                    }
                />

                {/*  <AppCard>
                        <h3 className="font-semibold text-sm mb-3 text-blue-700">People & Engagement</h3>
                        <div className="space-y-1">
                            {user?.level === UserLevels[UserRole.SUPER_ADMIN] && <MetricRow
                                icon={<Users className="h-4 w-4" />}
                                label="Trainers"
                                value={`${overview.totalActiveTrainers}/${overview.totalTrainers}`}
                                change={`${activeTrainerRate}%`}
                                trend={Number.parseFloat(activeTrainerRate) > 80 ? "up" : "neutral"}
                                secondary={`${clientTrainerRatio}:1 ratio`}
                            />}
                            <MetricRow
                                icon={<Users className="h-4 w-4" />}
                                label="Clients"
                                value={`${overview.totalActiveClients}/${overview.totalClients}`}
                                change={`${activeClientRate}%`}
                                trend={Number.parseFloat(activeClientRate) > 70 ? "up" : "down"}
                                secondary={`${metrics.averageSessionsPerClient} avg sessions`}
                            />
                            <MetricRow
                                icon={<Bell className="h-4 w-4" />}
                                label="Reminders"
                                value={overview.totalReminders}
                                secondary="Pending notifications"
                            />
                        </div>
                    </AppCard> */}


            </div>

            <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">

                <div>
                    <SessionsAnalyticsCard dynamicDateLabel={dynamicDateLabel} data={sessions} loading={isLoading} />
                </div>
                <RemindersAnalyticsCard dynamicDateLabel={dynamicDateLabel} data={reminders} loading={isLoading} />
            </div>

            <BillingOverview dynamicDateLabel={dynamicDateLabel} isAdmin={user?.level === UserLevels[UserRole.SUPER_ADMIN]} data={billing} loading={isLoading} />




        </div>
    )
}
