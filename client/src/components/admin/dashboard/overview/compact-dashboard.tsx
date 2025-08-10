
import type React from "react"

import { Badge } from "@/components/ui/badge"
import {
    Users,
    Calendar,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Target,
    Clock,
    CheckCircle,
    AlertTriangle,
    Bell,
    Activity,
    Hourglass,
} from "lucide-react"
import { AppCard } from "@/components/layout-ui/app-card"

// Types
import { ICombinedDashboardData } from "@/@types/dashboard.type"
import { BillingOverviewCard, FinancialSummaryCard, RemindersAnalyticsCard, SessionsAnalyticsCard } from "./cards"
import { useAuthUser } from "@/hooks/use-auth-user"
import { UserLevels, UserRole } from "#/modules/v1/users/enums/user.enum"
import { Button } from "@/components/ui/button"

interface CompactDashboardProps {
    data?: ICombinedDashboardData | null
    isLoading: boolean,
    error?: Error | null
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
    metrics,
    alert,
}: {
    title: string
    metrics: Array<{
        label: string
        value: string | number
        status?: "good" | "warning" | "danger"
        icon?: React.ReactNode
    }>
    alert?: string
}) {
    return (
        <AppCard>

            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                {title}
                {alert && <AlertTriangle className="h-4 w-4 text-amber-500" />}
            </h3>
            <div className="space-y-2">
                {metrics.map((metric, index) => (
                    <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {metric.icon && <span className="">{metric.icon}</span>}
                            <span className="text-xs ">{metric.label}</span>
                        </div>
                        <span
                            className={`text-sm font-bold ${metric.status === "good"
                                ? "text-green-600"
                                : metric.status === "warning"
                                    ? "text-amber-600"
                                    : metric.status === "danger"
                                        ? "text-red-600"
                                        : "text-gray-900"
                                }`}
                        >
                            {metric.value}
                        </span>
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


export default function CompactDashboard({ data, error, isLoading }: CompactDashboardProps) {
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






    const { stats, billing, reminders, sessions, financial } = data;
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
        <div className="space-y-4">
            {/* People & Capacity */}

            <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">


                <div className="space-y-4">
                    <RemindersAnalyticsCard data={reminders} loading={isLoading} />
                    <FinancialSummaryCard isAdmin={user?.level === UserLevels[UserRole.SUPER_ADMIN]} data={financial} loading={isLoading} />
                </div>

                <div className="space-y-4">
                    <AppCard>
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
                    </AppCard>



                    <AppCard>
                        <h3 className="font-semibold text-sm mb-3 text-emerald-700">Financial Health</h3>
                        <div className="space-y-1">
                            <MetricRow
                                icon={<CheckCircle className="h-4 w-4" />}
                                label="Paid"
                                value={`${overview.paidBillings}`}
                                change={`${metrics.paymentSuccessRate}%`}
                                trend={metrics.paymentSuccessRate > 80 ? "up" : metrics.paymentSuccessRate > 50 ? "neutral" : "down"}
                                secondary="Success rate"
                            />
                            <MetricRow
                                icon={<Clock className="h-4 w-4" />}
                                label="Pending"
                                value={`${overview.pendingBillings}`}
                                change={`${billingPendingRate}%`}
                                trend={Number.parseFloat(billingPendingRate) > 30 ? "down" : "neutral"}
                                secondary="Needs follow-up"
                            />
                            <MetricRow
                                icon={<DollarSign className="h-4 w-4" />}
                                label="Total Billings"
                                value={overview.totalBillings}
                                secondary={`$${avgRevenuePerClient} avg/client`}
                            />
                        </div>
                    </AppCard>

                    <KPICard
                        title="Performance Overview"
                        metrics={[
                            {
                                label: "Payment Overall Success Rate",
                                value: `${billing?.summary?.overallSuccessRate?.toFixed(1) || "0"}%`,
                                status: (billing?.summary?.overallSuccessRate || 0) > 85 ? "good" : "warning",
                                icon: <Target className="h-3 w-3" />,
                            },
                            {
                                label: "Session Completion",
                                value: `${metrics.sessionCompletionRate}%`,
                                status:
                                    metrics.sessionCompletionRate > 80 ? "good" : metrics.sessionCompletionRate > 50 ? "warning" : "danger",
                                icon: <Target className="h-3 w-3" />,
                            },
                            {
                                label: "Client Engagement",
                                value: `${activeClientRate}%`,
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
                                value: `${sessionUtilization}%`,
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

                    <BillingOverviewCard data={billing} loading={isLoading} />

                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">

                <div>
                    <SessionsAnalyticsCard data={sessions} loading={isLoading} />
                </div>
                <AppCard>

                    <h3 className="font-semibold text-sm mb-3 text-green-700">Sessions & Activity</h3>
                    <div className="space-y-1">
                        <MetricRow
                            icon={<Activity className="h-4 w-4" />}
                            label="Active Sessions"
                            value={overview.activeSessions}
                            change={`${sessionUtilization}%`}
                            trend={Number.parseFloat(sessionUtilization) > 80 ? "up" : "neutral"}
                            secondary="Currently running"
                        />
                        <MetricRow
                            icon={<CheckCircle className="h-4 w-4" />}
                            label="Completed"
                            value={overview.completedSessions}
                            secondary={`${metrics.sessionCompletionRate}% completion rate`}
                        />
                        <MetricRow
                            icon={<Target className="h-4 w-4" />}
                            label="Total Sessions"
                            value={overview.totalSessions}
                            secondary="All time"
                        />
                    </div>
                </AppCard>
            </div>




        </div>
    )
}
