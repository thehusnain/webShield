export function urlValidation(url) {
  if (!url || url.trim() === "") {
    return { valid: false, error: "URL is required" };
  }
   const parsed = new URL(url);

    // allow localhost and private IPs for lab testing
    if (
      parsed.hostname === "localhost" ||
      parsed.hostname === "127.0.0.1"
    ) {
      return { valid: true, url };
    }


  const cleanUrl = url.trim();
  if ((cleanUrl.match(/\./g) || []).length > 2) {
    return { valid: false, error: "Invalid URL format - too many dots" };
  }
  const domainOnly = cleanUrl.replace("https://", "").replace("http://", "");
  const domainParts = domainOnly.split(".");
  if (domainParts.length < 2 || domainParts[1].length < 2) {
    return {
      valid: false,
      error: "Please enter a valid website domain like google.com",
    };
  }
  if (domainOnly.length < 5) {
    return { valid: false, error: "URL is too short to be valid" };
  }
  if (cleanUrl.includes("..") || cleanUrl.includes(" ")) {
    return { valid: false, error: "Invalid URL format" };
  }

  let finalUrl = cleanUrl;
  if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
    finalUrl = "https://" + cleanUrl;
  }

  return { valid: true, url: finalUrl };
}
