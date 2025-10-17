"use client";

import { Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import ProfileDropdown from "@/components/profile-dropdown";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { PATHS } from "@/lib/path";

export default function UserActions() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

  const auth = {
    login: { title: "Login", url: PATHS.signIn },
    signup: { title: "Sign up", url: PATHS.signUp },
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        aria-label="Toggle theme"
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all duration-500 dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all duration-500 dark:rotate-0 dark:scale-100" />
      </Button>

      {session ? (
        <ProfileDropdown
          user={{
            name: session.user.name ?? "User",
            email: session.user.email,
            avatar: session.user.image ?? undefined,
          }}
        />
      ) : (
        <>
          <Button asChild variant="outline" size="sm">
            <Link href={auth.login.url}>{auth.login.title}</Link>
          </Button>
          <Button asChild size="sm">
            <Link href={auth.signup.url}>{auth.signup.title}</Link>
          </Button>
        </>
      )}
    </div>
  );
}
