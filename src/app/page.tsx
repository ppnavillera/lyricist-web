import MidiUploadSection from "@/components/upload/MidiUploadSection";
import FeatureShowcase from "@/components/landing/FeatureShowcase";
import Header from "@/components/common/Header";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8">
          <div className="text-center space-y-4 max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              🎵 Lyricist AI
            </h1>
            <p className="text-xl text-muted-foreground">
              MIDI 파일의 멜로디를 분석하여 각 음표에 완벽하게 맞는 가사를 자동으로 생성하는 AI 기반 웹 서비스
            </p>
          </div>
          
          <MidiUploadSection />
          
          <FeatureShowcase />
        </div>
      </main>
    </div>
  );
}
