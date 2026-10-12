import { z } from "zod";
import { CATEGORIES, DEFAULT_PAGE_SIZE, MAX_STICKERS, STICKERS, THEMES } from "./constants";

const category = z.enum(CATEGORIES, { errorMap: () => ({ message: "Pick one of the listed categories." }) });

export const signupSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(254),
  // bcrypt only uses the first 72 bytes, so we cap the length instead of silently truncating.
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(72, "Password must be at most 72 characters."),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password.").max(200),
});

export const adminLoginSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, "Enter the admin email."),
  password: z.string().min(1, "Enter the admin password."),
});

export const createEventSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters.").max(120),
  category,
  city: z.string().trim().min(2, "Enter a city.").max(60),
  // ISO 8601 with an offset, e.g. 2026-10-18T18:30:00+05:30
  startsAt: z
    .string()
    .datetime({ offset: true, message: "Enter a valid date and time." })
    .transform((v) => new Date(v).toISOString()),
  price: z.coerce
    .number({ invalid_type_error: "Enter the price in rupees." })
    .int("Price must be a whole number of rupees.")
    .min(0, "Price cannot be negative.")
    .max(10_000_000, "Price is too large."),
  description: z.string().trim().min(10, "Description must be at least 10 characters.").max(2000),
  imageUrl: z
    .string()
    .trim()
    .url("Enter a full image URL, starting with https://")
    .max(500)
    .refine((v) => /^https?:\/\//i.test(v), "Image URL must start with http:// or https://"),
});

export const setActiveSchema = z.object({
  isActive: z.boolean({ required_error: "isActive (true/false) is required." }),
});

export const favouritesSchema = z.object({
  categories: z
    .array(category)
    .min(1, "Pick at least one category.")
    .transform((list) => Array.from(new Set(list))),
});

export const cardDesignSchema = z.object({
  theme: z.enum(THEMES.map((t) => t.key) as [string, ...string[]], {
    errorMap: () => ({ message: "Unknown theme." }),
  }),
  stickers: z
    .array(z.enum(STICKERS.map((s) => s.key) as [string, ...string[]], {
      errorMap: () => ({ message: "Unknown sticker." }),
    }))
    .max(MAX_STICKERS, `You can add at most ${MAX_STICKERS} stickers.`),
});

// Query-string params. Empty strings are treated as "not provided".
const emptyToUndefined = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);

export const eventsQuerySchema = z.object({
  category: z.preprocess(emptyToUndefined, category.optional()),
  city: z.preprocess(emptyToUndefined, z.string().trim().max(60).optional()),
  q: z.preprocess(emptyToUndefined, z.string().trim().max(100).optional()),
  page: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).default(1)),
  pageSize: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).max(50).default(DEFAULT_PAGE_SIZE)),
});

export const pageQuerySchema = z.object({
  page: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).default(1)),
  pageSize: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).max(50).default(DEFAULT_PAGE_SIZE)),
});
