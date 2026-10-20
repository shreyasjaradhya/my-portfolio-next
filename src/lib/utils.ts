/**
 * Utility function to combine class names, following shadcn/ui convention
 * without requiring external dependencies like clsx or tailwind-merge.
 */
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(" ");
}
