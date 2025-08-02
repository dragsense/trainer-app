import { PageInnerLayout } from "@/layouts";
import DashboardOverview from "@/page-components/dashboard/dashboard-overview";

export default function DashboardPage() {
  return (
    <PageInnerLayout Header={<Header />}>
      <DashboardOverview /> 
    </PageInnerLayout>
  );
}

const Header = () => null;