import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PATHS } from "@/lib/path";

export default function HomePage() {
  return (
    <section className="min-h-[90vh] flex items-center justify-center relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(120,119,198,0.1),transparent_50%)]" />

      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          {/* Badge */}
          <div className="inline-flex items-center rounded-full border border-border/50 bg-background/80 px-4 py-2 text-sm backdrop-blur-sm">
            <span className="mr-2 h-2 w-2 rounded-full bg-green-500"></span>
            Ready to deploy
          </div>

          {/* Main heading */}
          <div className="space-y-6">
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Better Auth
              <span className="block text-muted-foreground">Starter Kit</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Complete authentication solution with Next.js 15, Better Auth, and
              modern security practices. Get user management, social logins, and
              secure sessions out of the box.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="text-base px-8">
              <Link href={PATHS.signUp}>Get Started Free</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-base px-8"
            >
              <Link href={PATHS.signIn}>Sign In</Link>
            </Button>
          </div>

          {/* Tech stack badges */}
          <div className="flex flex-wrap justify-center gap-3 pt-8">
            {[
              "Next.js 15",
              "Better Auth",
              "TypeScript",
              "Tailwind CSS",
              "PostgreSQL",
            ].map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center rounded-md bg-muted/50 px-3 py-1 text-sm font-medium text-muted-foreground border border-border/50"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
