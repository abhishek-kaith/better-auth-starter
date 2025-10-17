import type { ReactNode } from "react";
import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
