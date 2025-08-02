import { PageInnerLayout } from "@/layouts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BarChart3, CreditCard, TrendingUp, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardOverview from "@/page-components/dashboard/DashboardOverview";
import { ADMIN_ROUTES } from "@/config/routes.config";

export default function DashboardPage() {
  return (
    <PageInnerLayout Header={<Header />}>
      {/* Quick Analytics Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 hover:shadow-md transition-shadow">
          <Link to={ADMIN_ROUTES.DASHBOARD_REVENUE} className="block">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Revenue Analytics</h3>
                <p className="text-sm text-muted-foreground">Detailed revenue tracking</p>
              </div>
            </div>
          </Link>
        </Card>

        <Card className="p-4 hover:shadow-md transition-shadow">
          <Link to={ADMIN_ROUTES.DASHBOARD_SESSIONS} className="block">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Session Analytics</h3>
                <p className="text-sm text-muted-foreground">Session performance metrics</p>
              </div>
            </div>
          </Link>
        </Card>

        <Card className="p-4 hover:shadow-md transition-shadow">
          <Link to={ADMIN_ROUTES.DASHBOARD_PAYMENTS} className="block">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CreditCard className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold">Payment Analytics</h3>
                <p className="text-sm text-muted-foreground">Payment method insights</p>
              </div>
            </div>
          </Link>
        </Card>

        <Card className="p-4 hover:shadow-md transition-shadow">
          <Link to={ADMIN_ROUTES.DASHBOARD_BILLING} className="block">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold">Billing Analytics</h3>
                <p className="text-sm text-muted-foreground">Comprehensive billing insights</p>
              </div>
            </div>
          </Link>
        </Card>
      </div>

      <DashboardOverview /> 
    </PageInnerLayout>
  );
}

const Header = () => (
  <div className="flex items-center justify-between">
   
    <div className="flex gap-2">
      <Button variant="outline" size="sm" asChild>
        <Link to={ADMIN_ROUTES.DASHBOARD_REVENUE}>
          <BarChart3 className="h-4 w-4 mr-2" />
          Analytics
        </Link>
      </Button>
    </div>
  </div>
);
