"use client";

import {
  BarChart3,
  Home,
  LogOut,
  MoreHorizontal,
  PanelLeftOpen,
  Settings,
  Shield,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { signOut, useSession } from "@/lib/auth-client";
import { PATHS } from "@/lib/path";
import { cn } from "@/lib/utils";

interface SessionData {
  user?: {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
  };
}

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: SidebarItem[];
}

const sidebarItems: SidebarItem[] = [
  {
    title: "Dashboard",
    href: PATHS.dashboard,
    icon: BarChart3,
  },
  {
    title: "Profile",
    href: PATHS.profile,
    icon: User,
    children: [
      {
        title: "Security",
        href: PATHS.profileSecurity,
        icon: Shield,
      },
    ],
  },
  {
    title: "Settings",
    href: PATHS.settings,
    icon: Settings,
    children: [
      {
        title: "Members",
        href: PATHS.settingsMembers,
        icon: Users,
      },
    ],
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden">
        <MobileHeader session={session} />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <SidebarContent pathname={pathname} session={session} />
      </div>
    </>
  );
}

function MobileHeader({ session }: { session: SessionData | null }) {
  return (
    <div className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-x-4 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="-m-2.5 p-2.5">
            <span className="sr-only">Open sidebar</span>
            <PanelLeftOpen className="h-5 w-5" aria-hidden="true" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <MobileSidebarContent session={session} />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <h1 className="text-lg font-semibold tracking-tight">Dashboard</h1>
        </div>
        <div className="flex items-center gap-x-2 ml-auto">
          <ThemeToggle />
          {session?.user && (
            <Button variant="outline" size="sm" onClick={() => signOut()}>
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Sign Out</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function MobileSidebarContent({ session }: { session: SessionData | null }) {
  const pathname = usePathname();

  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-background px-6 pb-4">
      <div className="flex h-14 shrink-0 items-center border-b border-border/50">
        <h2 className="text-base font-semibold">Dashboard</h2>
      </div>
      <nav className="flex flex-1 flex-col">
        <ul className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul className="-mx-2 space-y-1">
              {sidebarItems.map((item) => (
                <SidebarNavItem
                  key={item.href}
                  item={item}
                  pathname={pathname}
                />
              ))}
            </ul>
          </li>
        </ul>
      </nav>
      {session?.user && (
        <div className="border-t border-border pt-4">
          <UserInfo session={session} />
        </div>
      )}
    </div>
  );
}

function SidebarContent({
  pathname,
  session,
}: {
  pathname: string;
  session: SessionData | null;
}) {
  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-background border-r border-border">
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center border-b border-border/50 px-6">
        <h2 className="text-base font-semibold">Dashboard</h2>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col px-6">
        <ul className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul className="-mx-2 space-y-1">
              {sidebarItems.map((item) => (
                <SidebarNavItem
                  key={item.href}
                  item={item}
                  pathname={pathname}
                />
              ))}
            </ul>
          </li>
        </ul>
      </nav>

      {/* User Info at Bottom */}
      {session?.user && (
        <div className="border-t border-border p-6">
          <UserInfo session={session} />
        </div>
      )}
    </div>
  );
}

function UserInfo({ session }: { session: SessionData | null }) {
  if (!session?.user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full h-auto p-3 justify-start hover:bg-muted/50"
        >
          <div className="flex items-center gap-3 w-full">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={session.user.image || undefined}
                alt={session.user.name || undefined}
              />
              <AvatarFallback className="text-xs">
                {session.user.name?.charAt(0)?.toUpperCase() ||
                  session.user.email.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium truncate">
                {session.user.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {session.user.email}
              </p>
            </div>
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuItem asChild>
          <Link href={PATHS.home} className="flex items-center">
            <Home className="h-4 w-4 mr-2" />
            Go to Home
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()} className="text-red-600">
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SidebarNavItem({
  item,
  pathname,
}: {
  item: SidebarItem;
  pathname: string;
}) {
  const isActive = pathname === item.href;
  const hasActiveChild = item.children?.some(
    (child) => pathname === child.href,
  );
  const isExpanded = isActive || hasActiveChild;

  return (
    <div>
      <Button
        asChild
        variant={isActive ? "secondary" : "ghost"}
        className={cn(
          "w-full justify-start font-normal h-10 px-3",
          isActive && "bg-secondary text-secondary-foreground",
        )}
      >
        <Link href={item.href}>
          <item.icon className="mr-3 h-4 w-4" />
          {item.title}
        </Link>
      </Button>
      {item.children && isExpanded && (
        <div className="ml-6 mt-1 space-y-1">
          {item.children.map((child) => (
            <Button
              key={child.href}
              asChild
              variant={pathname === child.href ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "w-full justify-start font-normal h-8 px-3",
                pathname === child.href &&
                  "bg-secondary text-secondary-foreground",
              )}
            >
              <Link href={child.href}>
                <child.icon className="mr-2 h-3 w-3" />
                {child.title}
              </Link>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
