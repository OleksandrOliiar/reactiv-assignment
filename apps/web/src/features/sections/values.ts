import { hexColorSchema } from '@reactiv/contracts';

/**
 * A six-digit color for the picker and preview. `#RGB` is expanded because
 * `<input type="color">` only accepts `#RRGGBB`. Invalid drafts return undefined.
 */
export function safeHexColor(value: string): string | undefined {
  const parsed = hexColorSchema.safeParse(value);
  if (!parsed.success) return undefined;
  if (parsed.data.length === 4) {
    const [red, green, blue] = parsed.data.slice(1);
    return `#${red}${red}${green}${green}${blue}${blue}`;
  }
  return parsed.data;
}
