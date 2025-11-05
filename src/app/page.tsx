'use client';

import MidiUploadSection from "@/components/upload/MidiUploadSection";
import FeatureShowcase from "@/components/landing/FeatureShowcase";
import Header from "@/components/common/Header";
import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* 배경 그라데이션 효과 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow"></div>
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-glow"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <Header />

      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-12">
          <div className="text-center space-y-6 max-w-3xl animate-slide-up">
            <div className="inline-block">
              <span className="text-6xl md:text-7xl font-bold gradient-text">
                {t('home.title')}
              </span>
            </div>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              {t('home.subtitle')}
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span>{t('home.badge1')}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                <span>{t('home.badge2')}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                <span>{t('home.badge3')}</span>
              </div>
            </div>
          </div>

          <div
            className="w-full animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            <MidiUploadSection />
          </div>

          <div
            className="w-full animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            <FeatureShowcase />
          </div>
        </div>
      </main>
    </div>
  );
}
