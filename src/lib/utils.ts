import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Humanize snake_case or lowercase labels to Title Case in Spanish UI
export function humanizeLabel(value?: string): string {
  if (!value) return '';
  const spaced = value.replace(/_/g, ' ');
  const lower = spaced.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}
