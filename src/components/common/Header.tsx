"use client";

import { Music } from "lucide-react";
import Link from "next/link";

export default function Header() {
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
              Lyricist AI
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="#features"
              className="text-muted-foreground hover:text-primary transition-colors relative group"
            >
              <span>기능</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all"></span>
            </Link>
            <Link
              href="#how-it-works"
              className="text-muted-foreground hover:text-primary transition-colors relative group"
            >
              <span>사용법</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all"></span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
