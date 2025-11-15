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

export function formatDate(date: Date, locale: string = 'ko'): string {
  const localeCode = locale === 'en' ? 'en-US' : 'ko-KR';
  return new Intl.DateTimeFormat(localeCode, {
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

export interface PDFTranslations {
  title: string;
  project: string;
  file: string;
  createdAt: string;
  completedAt: string;
  inProgress: string;
  genre: string;
  mood: string;
  keywords: string;
  totalSyllables: string;
  sectionsCount: string;
  lyricsHeader: string;
  syllables: string;
  footer: string;
}

export async function exportToPDF(data: PDFExportData, filename: string, translations: PDFTranslations) {
  const { default: jsPDF } = await import('jspdf');
  const { loadGulimFont } = await import('./fonts/NotoSansKR-Regular');

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Load and add Korean font (Gulim)
  try {
    const fontBase64 = await loadGulimFont();
    doc.addFileToVFS('Gulim.ttf', fontBase64);
    doc.addFont('Gulim.ttf', 'Gulim', 'normal');
    doc.setFont('Gulim');
  } catch (error) {
    console.error('Failed to load Korean font:', error);
  }

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  let yPosition = margin;
  let fontLoaded = false;

  // Check if font was loaded
  try {
    doc.setFont('Gulim');
    fontLoaded = true;
    console.log('Using Gulim font');
  } catch (e) {
    console.warn('Gulim font not available, using default');
  }

  const addText = (text: string, fontSize: number = 11, isBold: boolean = false, align: 'left' | 'center' = 'left') => {
    doc.setFontSize(fontSize);

    // Ensure font is set for each text
    if (fontLoaded) {
      try {
        doc.setFont('Gulim', 'normal');
      } catch (e) {
        console.warn('Failed to set font');
      }
    }

    const lines = doc.splitTextToSize(text, maxWidth);

    lines.forEach((line: string) => {
      if (yPosition + 10 > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
        // Reset font on new page
        if (fontLoaded) {
          try {
            doc.setFont('Gulim', 'normal');
          } catch (e) {
            console.warn('Failed to set font on new page');
          }
        }
      }

      if (align === 'center') {
        const textWidth = doc.getTextWidth(line);
        doc.text(line, (pageWidth - textWidth) / 2, yPosition);
      } else {
        doc.text(line, margin, yPosition);
      }

      yPosition += fontSize * 0.5;
    });
  };

  const addSpace = (space: number = 5) => {
    yPosition += space;
  };

  // Title
  doc.setFontSize(18);
  const title = translations.title;
  const titleWidth = doc.getTextWidth(title);
  doc.text(title, (pageWidth - titleWidth) / 2, yPosition);
  yPosition += 15;
  addSpace(10);

  // Project Info
  doc.setFontSize(14);
  addText(`${translations.project}: ${data.projectName}`, 14, true);
  addSpace(8);

  addText(`${translations.file}: ${data.fileName}`, 11);
  addSpace(5);
  addText(`${translations.createdAt}: ${data.createdAt}`, 11);
  addSpace(5);
  addText(`${translations.completedAt}: ${data.completedAt || translations.inProgress}`, 11);
  addSpace(10);

  // Theme Info
  if (data.genres.length > 0) {
    addText(`${translations.genre}: ${data.genres.join(', ')}`, 11);
    addSpace(5);
  }
  if (data.moods.length > 0) {
    addText(`${translations.mood}: ${data.moods.join(', ')}`, 11);
    addSpace(5);
  }
  if (data.keywords.length > 0) {
    addText(`${translations.keywords}: ${data.keywords.join(', ')}`, 11);
    addSpace(5);
  }

  // Stats
  addSpace(5);
  addText(`${translations.totalSyllables}: ${data.totalSyllables}`, 11);
  addSpace(5);
  addText(translations.sectionsCount.replace('{count}', data.structures.length.toString()), 11);
  addSpace(15);

  // Lyrics Header
  doc.setFontSize(14);
  const lyricsHeader = translations.lyricsHeader;
  const headerWidth = doc.getTextWidth(lyricsHeader);
  doc.text(lyricsHeader, (pageWidth - headerWidth) / 2, yPosition);
  yPosition += 10;
  addSpace(10);

  // Lyrics Content
  data.structures.forEach((structure, index) => {
    if (index > 0) addSpace(10);

    doc.setFontSize(12);
    addText(`[${structure.name}] (${structure.syllableCount} ${translations.syllables})`, 12, true);
    addSpace(5);

    doc.setFontSize(11);
    // Split lyrics by newlines and add each line
    const lyricsLines = structure.lyrics.split('\n');
    lyricsLines.forEach(line => {
      if (line.trim()) {
        addText(line, 11);
        addSpace(3);
      } else {
        addSpace(3);
      }
    });
  });

  // Footer
  addSpace(20);
  doc.setFontSize(9);
  doc.setTextColor(128, 128, 128);
  const footer = translations.footer;
  const footerWidth = doc.getTextWidth(footer);
  doc.text(footer, (pageWidth - footerWidth) / 2, pageHeight - 15);

  doc.save(filename);
}