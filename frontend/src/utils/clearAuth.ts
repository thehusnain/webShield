// frontend/src/utils/clearAuth.ts (create new file)
export const clearAllAuth = () => {
  // Clear cookies
  document.cookie.split(";").forEach((c) => {
    document.cookie = c
      .replace(/^ +/, "")
      .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });
  
  // Clear local storage
  localStorage.clear();
  
  // Clear session storage
  sessionStorage.clear();
  
  console.log('All auth data cleared');
};