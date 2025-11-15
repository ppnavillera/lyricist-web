// Gulim font loader for jsPDF (Korean support)
export const loadGulimFont = async (): Promise<string> => {
  const response = await fetch('/fonts/gulim.js');
  if (!response.ok) throw new Error('Failed to load font');

  const text = await response.text();

  // Extract the base64 font data from the file
  // Format: var _fonts = "base64data"
  const match = text.match(/var _fonts = "([^"]+)"/);

  if (!match || !match[1]) {
    throw new Error('Failed to parse font data');
  }

  return match[1];
};
