'use client';

import { Music } from "lucide-react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Music className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Lyricist AI</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              기능
            </Link>
            <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
              사용법
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}