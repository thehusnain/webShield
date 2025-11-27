export function urlValidation(url) {
    if (!url || url.trim() === '') {
        return { valid: false, error: 'URL is required' };
 }
    const cleanUrl = url.trim();  
if ( cleanUrl.includes('..') ||  cleanUrl.includes(' ')) {
    return { valid: false, error: 'Invalid URL format' };
}
    
    let finalUrl = cleanUrl;
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        finalUrl = 'https://' + cleanUrl;
    }
return { valid : true, url: finalUrl };
}