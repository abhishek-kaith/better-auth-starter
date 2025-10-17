import { ThemeToggle } from "@/components/theme-toggle";
import { Breadcrumb, type BreadcrumbItem } from "@/components/ui/breadcrumb";

interface DashboardPageContainerProps {
  breadcrumbItems: BreadcrumbItem[];
  children: React.ReactNode;
}

export function DashboardPageContainer({
  breadcrumbItems,
  children,
}: DashboardPageContainerProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Sticky Breadcrumbs - Minimal like Linear/Vercel */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/50">
        <div className="flex h-14 items-center justify-between px-6">
          <Breadcrumb items={breadcrumbItems} />
          {/* Theme toggle only visible on desktop */}
          <div className="hidden lg:block">
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Page Content with consistent padding like modern dashboards */}
      <div className="flex-1 space-y-6 p-6">{children}</div>
    </div>
  );
}
