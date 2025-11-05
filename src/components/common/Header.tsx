"use client";

import {
  Music,
  User,
  LogOut,
  FolderOpen,
  UserCircle,
  Languages,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslations, useLocale } from "next-intl";
import { useTransition } from "react";

export default function Header() {
  const { user, loading, login, logout } = useAuth();
  const t = useTranslations();
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();

  const toggleLocale = () => {
    const newLocale = locale === "ko" ? "en" : "ko";
    startTransition(() => {
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
      window.location.reload();
    });
  };

  return (
    <header className="border-b border-border/50 glass sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center space-x-3 hover:opacity-80 transition-all group"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg group-hover:blur-xl transition-all"></div>
              <Music className="h-8 w-8 text-primary relative z-10" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t("common.appName")}
            </span>
          </Link>

          <nav className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-8">
              {user ? (
                <>
                  <Link
                    href="/projects"
                    className="text-muted-foreground hover:text-primary transition-colors relative group"
                  >
                    <span>{t("header.projects")}</span>
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all"></span>
                  </Link>
                </>
              ) : (
                <>
                  {/* <Link
                    href="#features"
                    className="text-muted-foreground hover:text-primary transition-colors relative group"
                  >
                    <span>{t('header.features')}</span>
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all"></span>
                  </Link>
                  <Link
                    href="#how-it-works"
                    className="text-muted-foreground hover:text-primary transition-colors relative group"
                  >
                    <span>{t('header.howItWorks')}</span>
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all"></span>
                  </Link> */}
                </>
              )}
            </div>

            {/* Language Switcher */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLocale}
              disabled={isPending}
              className="flex items-center gap-2"
            >
              <Languages className="h-4 w-4" />
              <span className="text-sm font-medium">
                {locale.toUpperCase()}
              </span>
            </Button>

            {!loading && (
              <>
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex items-center space-x-2"
                      >
                        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <span className="hidden md:inline">{user.name}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <div className="px-2 py-1.5">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.phone}
                        </p>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/projects">
                          <FolderOpen className="w-4 h-4 mr-2" />
                          {t("header.myProjects")}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/profile">
                          <UserCircle className="w-4 h-4 mr-2" />
                          {t("header.profile")}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={logout}
                        className="cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        {t("common.logout")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button onClick={login} size="sm">
                    {t("common.login")}
                  </Button>
                )}
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
