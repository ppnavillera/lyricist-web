import { Music, Brain, Edit3, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    icon: Music,
    title: '정확한 음절 매칭',
    description: 'MIDI 파일의 각 음표에 정확히 맞는 음절 수로 가사 생성',
  },
  {
    icon: Brain,
    title: 'AI 가사 생성',
    description: '장르, 분위기, 키워드를 반영한 개인화된 가사 자동 생성',
  },
  {
    icon: Edit3,
    title: '직관적인 편집',
    description: '라인별 개별 수정과 실시간 음절 수 확인으로 쉬운 편집',
  },
  {
    icon: Download,
    title: '다양한 내보내기',
    description: 'TXT, PDF 다운로드 및 클립보드 복사 기능 제공',
  },
];

export default function FeatureShowcase() {
  return (
    <section id="features" className="w-full max-w-6xl">
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-3xl font-bold">핵심 기능</h2>
        <p className="text-muted-foreground">
          멜로디에 완벽하게 맞는 가사를 만들어보세요
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
              <CardTitle className="text-lg">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                {feature.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}