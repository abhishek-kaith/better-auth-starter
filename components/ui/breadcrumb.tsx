import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav className={cn("flex items-center space-x-1 text-sm", className)}>
      <Link
        href="/"
        className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      {items.map((item, index) => (
        <Fragment key={`${item.label}-${index}`}>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          {item.href && index < items.length - 1 ? (
            <Link
              href={item.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-foreground">{item.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
