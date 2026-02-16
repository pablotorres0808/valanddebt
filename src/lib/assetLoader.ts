/**
 * AssetLoader Utility
 * Manages loading and caching of game assets.
 * Replace placeholder URLs with your Figma PNGs.
 */

// === ASSET URLS ===
// Replace these with your actual PNG paths from Figma
// e.g. import playerImg from "@/assets/player.png";
export const ASSET_URLS = {
  player: '/placeholder.svg',   // Replace with: player.png
  house: '/placeholder.svg',    // Replace with: house.png
  debt: '/placeholder.svg',     // Replace with: debt.png
} as const;

type AssetKey = keyof typeof ASSET_URLS;

const imageCache = new Map<string, HTMLImageElement>();

/**
 * Load a single image and cache it
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  if (imageCache.has(src)) {
    return Promise.resolve(imageCache.get(src)!);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Load all game assets
 */
export async function loadAllAssets(): Promise<Record<AssetKey, HTMLImageElement>> {
  const entries = Object.entries(ASSET_URLS) as [AssetKey, string][];
  const results = await Promise.all(
    entries.map(async ([key, url]) => {
      const img = await loadImage(url);
      return [key, img] as const;
    })
  );
  return Object.fromEntries(results) as Record<AssetKey, HTMLImageElement>;
}
