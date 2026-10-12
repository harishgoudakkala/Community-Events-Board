import { NextResponse } from "next/server";
import { ZodError, type ZodTypeAny, type z } from "zod";

/** An error that should be shown to the API caller as-is. */
export class ApiError extends Error {
  status: number;
  fields?: Record<string, string>;

  constructor(status: number, message: string, fields?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

export function json<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

function firstFieldErrors(error: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}

/** Parse + validate with zod, turning failures into a 400 with per-field messages. */
export function parse<S extends ZodTypeAny>(schema: S, input: unknown): z.infer<S> {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new ApiError(400, "Please fix the highlighted fields.", firstFieldErrors(result.error));
  }
  return result.data;
}

export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new ApiError(400, "Request body must be valid JSON.");
  }
}

export function parseId(raw: string): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) throw new ApiError(404, "Not found.");
  return id;
}

/**
 * Wraps a route handler body so every failure becomes the same JSON shape:
 *   { error: string, fields?: { [field]: message } }
 */
export async function run(fn: () => Promise<Response>): Promise<Response> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(
        { error: err.message, ...(err.fields ? { fields: err.fields } : {}) },
        { status: err.status }
      );
    }
    console.error("[api] unexpected error:", err);
    return NextResponse.json({ error: "Something went wrong on our side." }, { status: 500 });
  }
}
