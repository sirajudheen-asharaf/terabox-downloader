// Validate TeraBox URL
export function isValidTeraBoxUrl(url: string): boolean {
  const teraboxPatterns = [
    /^https?:\/\/(www\.)?terabox\.com\//i,
    /^https?:\/\/(www\.)?1024terabox\.com\//i,
    /^https?:\/\/(www\.)?teraboxapp\.com\//i,
  ];

  return teraboxPatterns.some(pattern => pattern.test(url.trim()));
}

// Extract TeraBox URLs from text
export function extractTeraBoxUrls(text: string): string[] {
  const urlPattern = /https?:\/\/(?:www\.)?(terabox|1024terabox|teraboxapp)\.com\/[^\s]+/gi;
  const matches = text.match(urlPattern) || [];
  return [...new Set(matches)]; // Remove duplicates
}

// Parse Telegram JSON export
export function parseTelegramJson(content: string): string[] {
  try {
    const data = JSON.parse(content);
    let urls: string[] = [];

    // Handle different Telegram export formats
    if (data.messages && Array.isArray(data.messages)) {
      data.messages.forEach((msg: any) => {
        if (msg.text) {
          if (typeof msg.text === 'string') {
            urls.push(...extractTeraBoxUrls(msg.text));
          } else if (Array.isArray(msg.text)) {
            msg.text.forEach((item: any) => {
              if (typeof item === 'string') {
                urls.push(...extractTeraBoxUrls(item));
              } else if (item.text) {
                urls.push(...extractTeraBoxUrls(item.text));
              }
            });
          }
        }
      });
    }

    return [...new Set(urls)]; // Remove duplicates
  } catch (error) {
    throw new Error('Invalid JSON format');
  }
}

// Parse Telegram HTML export
export function parseTelegramHtml(content: string): string[] {
  const urls = extractTeraBoxUrls(content);
  return [...new Set(urls)];
}

// Parse plain text file
export function parsePlainText(content: string): string[] {
  const urls = extractTeraBoxUrls(content);
  return [...new Set(urls)];
}


// Process file and extract URLs
export async function processFile(file: File): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        let urls: string[] = [];

        if (file.name.endsWith('.json')) {
          urls = parseTelegramJson(content);
        } else if (file.name.endsWith('.html') || file.name.endsWith('.htm')) {
          urls = parseTelegramHtml(content);
        } else {
          urls = parsePlainText(content);
        }

        if (urls.length === 0) {
          reject(new Error('No TeraBox URLs found in file'));
        } else {
          resolve(urls);
        }
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}
