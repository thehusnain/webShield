export function urlValidation(url) {
  // CHECKING IS URL IS EMPTY
  if (!url) {
    return { valid: false, error: 'URL is required' };
  }

  if (url.trim() === '') {
    return { valid: false, error: 'URL is required' };
  }

  // ALLOWING LOCAL HOST TO SCAN
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
      return { valid: true, url: url };
    }
  } catch (error) {}

  const cleanUrl = url.trim();
  const dots = cleanUrl.split('.').length - 1;

  // CHECKING FOR TOO MANY DOTS
  if (dots > 2) {
    return { valid: false, error: 'Invalid URL format - too many dots' };
  }
  // IF URL HAS DOUBLE DOT AT ONCE
  if (cleanUrl.includes('..')) {
    return { valid: false, error: 'Invalid URL format' };
  }

  if (cleanUrl.includes(' ')) {
    return { valid: false, error: 'Invalid URL format' };
  }

  // REMOVINNG HTTP AND HTTPS FROM URL FOR TOOL VALIDATION
  let domainOnly = cleanUrl;

  if (cleanUrl.startsWith('https://')) {
    domainOnly = cleanUrl.replace('https://', '');
  } else if (cleanUrl.startsWith('http://')) {
    domainOnly = cleanUrl.replace('http://', '');
  }

  const domainParts = domainOnly.split('.');

  if (domainParts.length < 2) {
    return {
      valid: false,
      error: 'Please enter a valid website domain like google.com',
    };
  }
  if (domainParts[1].length < 2) {
    return {
      valid: false,
      error: 'Please enter a valid website domain like google.com',
    };
  }

  if (domainOnly.length < 5) {
    return { valid: false, error: 'URL is too short to be valid' };
  }
  let finalUrl = cleanUrl;

  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    finalUrl = 'https://' + cleanUrl;
  }

  return { valid: true, url: finalUrl };
}
