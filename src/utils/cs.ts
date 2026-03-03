import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind/clsx className helper (shadcn-style)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
