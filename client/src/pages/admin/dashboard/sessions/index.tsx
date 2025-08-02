import { PageInnerLayout } from "@/layouts";
import { SessionAnalytics } from "@/page-components/dashboard";

export default function SessionAnalyticsPage() {
  return (
    <PageInnerLayout Header={<Header />}>
      <SessionAnalytics />
    </PageInnerLayout>
  );
}

const Header = () => null;
