import { Music, Brain, Edit3, Download } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    icon: Music,
    title: "정확한 음절 매칭",
    description: "MIDI 파일의 각 음표에 정확히 맞는 음절 수로 가사 생성",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: Brain,
    title: "AI 가사 생성",
    description: "장르, 분위기, 키워드를 반영한 개인화된 가사 자동 생성",
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-500/10",
  },
  {
    icon: Edit3,
    title: "직관적인 편집",
    description: "라인별 개별 수정과 실시간 음절 수 확인으로 쉬운 편집",
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-500/10",
  },
  {
    icon: Download,
    title: "다양한 내보내기",
    description: "TXT, PDF 다운로드 및 클립보드 복사 기능 제공",
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-500/10",
  },
];

export default function FeatureShowcase() {
  return (
    <section id="features" className="w-full max-w-6xl mx-auto">
      <div className="text-center space-y-4 mb-16">
        <h2 className="text-4xl font-bold">핵심 기능</h2>
        <p className="text-xl text-muted-foreground">
          멜로디에 완벽하게 맞는 가사를 만들어보세요
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <Card
            key={index}
            className="text-center card-hover border-border/50 relative overflow-hidden group"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* 배경 그라데이션 */}
            <div
              className={`absolute inset-0 ${feature.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
            ></div>

            <CardHeader className="relative z-10">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  {/* 글로우 효과 */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-full blur-xl opacity-50 group-hover:opacity-100 transition-opacity`}
                  ></div>

                  <div
                    className={`flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${feature.color} relative z-10 transform group-hover:scale-110 transition-transform`}
                  >
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {feature.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <CardDescription className="text-sm leading-relaxed">
                {feature.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
