import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function countSyllables(text: string): number {
  if (!text || text.trim() === '') return 0;
  
  // Korean syllable counting - each Hangul character is typically one syllable
  const koreanRegex = /[가-힣]/g;
  const koreanMatches = text.match(koreanRegex);
  const koreanSyllables = koreanMatches ? koreanMatches.length : 0;
  
  // English syllable counting (simplified)
  const englishText = text.replace(/[가-힣]/g, '').toLowerCase();
  const englishWords = englishText.match(/[a-z]+/g);
  let englishSyllables = 0;
  
  if (englishWords) {
    englishSyllables = englishWords.reduce((total, word) => {
      // Simple English syllable counting
      const vowels = word.match(/[aeiouy]+/g);
      let syllables = vowels ? vowels.length : 0;
      if (word.endsWith('e')) syllables -= 1;
      return total + Math.max(1, syllables);
    }, 0);
  }
  
  return koreanSyllables + englishSyllables;
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function downloadAsFile(content: string, filename: string, contentType: string = 'text/plain') {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function validateMidiFile(file: File): boolean {
  const validExtensions = ['.mid', '.midi'];
  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  return validExtensions.includes(extension);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export interface PDFExportData {
  projectName: string;
  fileName: string;
  createdAt: string;
  completedAt?: string;
  genres: string[];
  moods: string[];
  keywords: string[];
  totalSyllables: number;
  structures: Array<{
    name: string;
    lyrics: string;
    syllableCount: number;
  }>;
}

export async function exportToPDF(data: PDFExportData, filename: string) {
  // Dynamic imports to avoid SSR issues
  const { default: jsPDF } = await import('jspdf');
  const { default: html2canvas } = await import('html2canvas');

  // Create HTML content
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.width = '800px';
  container.style.padding = '40px';
  container.style.backgroundColor = '#ffffff';
  container.style.fontFamily = 'Arial, sans-serif';

  let html = `
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">🎵 Lyricist AI - 가사 프로젝트</h1>
    </div>

    <div style="margin-bottom: 30px;">
      <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 15px;">프로젝트: ${data.projectName}</h2>
      <p style="margin: 5px 0;">파일: ${data.fileName}</p>
      <p style="margin: 5px 0;">생성일: ${data.createdAt}</p>
      <p style="margin: 5px 0;">완료일: ${data.completedAt || '진행중'}</p>
    </div>
  `;

  if (data.genres.length > 0 || data.moods.length > 0 || data.keywords.length > 0) {
    html += '<div style="margin-bottom: 30px;">';
    if (data.genres.length > 0) {
      html += `<p style="margin: 5px 0;">장르: ${data.genres.join(', ')}</p>`;
    }
    if (data.moods.length > 0) {
      html += `<p style="margin: 5px 0;">분위기: ${data.moods.join(', ')}</p>`;
    }
    if (data.keywords.length > 0) {
      html += `<p style="margin: 5px 0;">키워드: ${data.keywords.join(', ')}</p>`;
    }
    html += '</div>';
  }

  html += `
    <div style="margin-bottom: 30px;">
      <p style="margin: 5px 0;">총 음절 수: ${data.totalSyllables}</p>
      <p style="margin: 5px 0;">총 ${data.structures.length}개 구간</p>
    </div>

    <h2 style="font-size: 18px; font-weight: bold; margin: 30px 0 20px 0; text-align: center;">=== 가사 ===</h2>
  `;

  data.structures.forEach((structure) => {
    html += `
      <div style="margin-bottom: 25px;">
        <h3 style="font-size: 14px; font-weight: bold; margin-bottom: 10px;">[${structure.name}] (${structure.syllableCount} 음절)</h3>
        <p style="line-height: 1.8; white-space: pre-line;">${structure.lyrics}</p>
      </div>
    `;
  });

  html += `
    <div style="text-align: center; margin-top: 50px; color: #888; font-size: 12px;">
      Generated with Lyricist AI
    </div>
  `;

  container.innerHTML = html;
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
  } finally {
    document.body.removeChild(container);
  }
}