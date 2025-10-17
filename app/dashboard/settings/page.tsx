import { DashboardPageContainer } from "@/components/layout/dashboard-page-container";
import { PATHS } from "@/lib/path";
import { OrganizationSettings } from "./organization-settings";

function OrganizationPage() {
  const breadcrumbItems = [
    { label: "Dashboard", href: PATHS.dashboard },
    { label: "Settings", href: PATHS.settings },
  ];

  return (
    <DashboardPageContainer breadcrumbItems={breadcrumbItems}>
      <OrganizationSettings />
    </DashboardPageContainer>
  );
}

export default OrganizationPage;
