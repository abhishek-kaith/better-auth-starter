import type { Metadata } from "next";
import { Inconsolata, Poppins, Tinos } from "next/font/google";
import "@/styles/global.css";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";
import Provider from "@/components/provider";

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
    <html lang="en">
      <body
        className={cn(
          "antialiased",
          poppins.variable,
          inconsolata.variable,
          tinos.variable,
        )}
      >
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
