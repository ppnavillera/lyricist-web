'use client';

import { Music, Brain, Edit3, Download } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslations } from 'next-intl';

const featureIcons = [Music, Brain, Edit3, Download];
const featureColors = [
  { color: "from-blue-500 to-cyan-500", bgColor: "bg-blue-500/10" },
  { color: "from-purple-500 to-pink-500", bgColor: "bg-purple-500/10" },
  { color: "from-green-500 to-emerald-500", bgColor: "bg-green-500/10" },
  { color: "from-orange-500 to-red-500", bgColor: "bg-orange-500/10" },
];

export default function FeatureShowcase() {
  const t = useTranslations('features');

  const features = [
    {
      key: 'accurateMatching',
      icon: featureIcons[0],
      ...featureColors[0],
    },
    {
      key: 'aiGeneration',
      icon: featureIcons[1],
      ...featureColors[1],
    },
    {
      key: 'intuitiveEdit',
      icon: featureIcons[2],
      ...featureColors[2],
    },
    {
      key: 'export',
      icon: featureIcons[3],
      ...featureColors[3],
    },
  ];

  return (
    <section id="features" className="w-full max-w-6xl mx-auto">
      <div className="text-center space-y-4 mb-16">
        <h2 className="text-4xl font-bold">{t('title')}</h2>
        <p className="text-xl text-muted-foreground">
          {t('subtitle')}
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
                {t(`${feature.key}.title`)}
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <CardDescription className="text-sm leading-relaxed">
                {t(`${feature.key}.description`)}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
