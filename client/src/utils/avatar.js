/**
 * Helper to resolve user avatar URLs (Cloudinary URLs, local /uploads/ URLs, or Dicebear fallbacks)
 */
export const getAvatarUrl = (url, fallbackSeed = "dev") => {
  if (!url) {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fallbackSeed)}`;
  }
  if (url.startsWith("/uploads")) {
    const backendUrl = import.meta.env.VITE_SOCKET_URL || (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "") : "http://localhost:8000");
    return `${backendUrl}${url}`;
  }
  return url;
};
