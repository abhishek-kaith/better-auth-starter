import type { Metadata } from "next";
import { Inconsolata, Poppins, Tinos } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "@/styles/global.css";
import Provider from "@/components/provider";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";

const poppins = Poppins({
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

const inconsolata = Inconsolata({
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-inconsolata",
});

const tinos = Tinos({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-tinos",
});

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
  icons: siteConfig.logo,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body
        className={cn(
          "antialiased",
          poppins.variable,
          inconsolata.variable,
          tinos.variable,
        )}
      >
        <Toaster position="top-center" />
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
