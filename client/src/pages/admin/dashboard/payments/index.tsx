import { PageInnerLayout } from "@/layouts";
import { PaymentMethodsAnalytics } from "@/page-components";

export default function PaymentAnalyticsPage() {
  return (
    <PageInnerLayout Header={<Header />}>
      <PaymentMethodsAnalytics />
    </PageInnerLayout>
  );
}

const Header = () => null;
