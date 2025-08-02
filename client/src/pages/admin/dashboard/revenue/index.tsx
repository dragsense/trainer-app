import { PageInnerLayout } from "@/layouts";
import { RevenueChart } from "@/page-components";

export default function RevenueAnalyticsPage() {
  return (
    <PageInnerLayout Header={<Header />}>
      <RevenueChart />
    </PageInnerLayout>
  );
}

const Header = () => null;
