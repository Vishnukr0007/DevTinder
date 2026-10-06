/**
 * Helper to resolve user avatar URLs (Cloudinary URLs, local /uploads/ URLs, or Dicebear fallbacks)
 */
export const getAvatarUrl = (url, fallbackSeed = "dev") => {
  if (!url) {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fallbackSeed)}`;
  }
  if (url.startsWith("/uploads")) {
    return `http://localhost:8000${url}`;
  }
  return url;
};
