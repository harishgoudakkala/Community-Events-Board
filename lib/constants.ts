// Shared by server and client. No Node-only imports.

export const CATEGORIES = ["Music", "Workshop", "Food", "Sports", "Kids"] as const;
export type Category = (typeof CATEGORIES)[number];

// Full class strings so Tailwind can see them.
export const CATEGORY_STYLES: Record<Category, { emoji: string; badge: string }> = {
  Music: { emoji: "🎵", badge: "bg-violet-100 text-violet-800" },
  Workshop: { emoji: "🛠️", badge: "bg-sky-100 text-sky-800" },
  Food: { emoji: "🍜", badge: "bg-amber-100 text-amber-800" },
  Sports: { emoji: "🏅", badge: "bg-emerald-100 text-emerald-800" },
  Kids: { emoji: "🧸", badge: "bg-pink-100 text-pink-800" },
};

// ---- Event card designer ----
export const THEMES = [
  { key: "sunset", label: "Sunset", gradient: "bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600" },
  { key: "ocean", label: "Ocean", gradient: "bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-700" },
  { key: "forest", label: "Forest", gradient: "bg-gradient-to-br from-emerald-400 via-teal-600 to-slate-800" },
] as const;
export type ThemeKey = (typeof THEMES)[number]["key"];
export const DEFAULT_THEME: ThemeKey = "sunset";

export const STICKERS = [
  { key: "party", emoji: "🎉", label: "Party popper" },
  { key: "guitar", emoji: "🎸", label: "Guitar" },
  { key: "pizza", emoji: "🍕", label: "Pizza" },
  { key: "star", emoji: "⭐", label: "Star" },
  { key: "balloon", emoji: "🎈", label: "Balloon" },
] as const;
export type StickerKey = (typeof STICKERS)[number]["key"];

export const MAX_STICKERS = 3;

export const DEFAULT_PAGE_SIZE = 6;
