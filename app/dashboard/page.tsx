import { DashboardPageContainer } from "@/components/layout/dashboard-page-container";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function DashboardPage() {
  const breadcrumbItems = [{ label: "Dashboard" }];

  return (
    <DashboardPageContainer breadcrumbItems={breadcrumbItems}>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Welcome to your Dashboard</CardTitle>
            <CardDescription>
              Manage your authentication, organization, and user settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Get started by configuring your organization settings or managing
              team members.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardPageContainer>
  );
}

export default DashboardPage;
