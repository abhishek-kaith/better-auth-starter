import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { PATHS } from "@/lib/path";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <Link href={PATHS.home} className="inline-block">
            <Image
              src={siteConfig.logo}
              alt={siteConfig.name}
              width={64}
              height={64}
              className="mx-auto h-16 w-auto"
            />
          </Link>
        </div>
        <div className="bg-background  shadow-sm rounded-lg overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}

