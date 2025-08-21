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