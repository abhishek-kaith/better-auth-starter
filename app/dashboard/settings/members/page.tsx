import { DashboardPageContainer } from "@/components/layout/dashboard-page-container";
import { PATHS } from "@/lib/path";
import { MemberManagement } from "../member-management";

function MembersPage() {
  const breadcrumbItems = [
    { label: "Dashboard", href: PATHS.dashboard },
    { label: "Settings", href: PATHS.settings },
    { label: "Members" },
  ];

  return (
    <DashboardPageContainer breadcrumbItems={breadcrumbItems}>
      <MemberManagement />
    </DashboardPageContainer>
  );
}

export default MembersPage;
