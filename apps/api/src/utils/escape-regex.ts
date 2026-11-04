/**
 * Escape a user-provided string so it is matched literally in a MongoDB $regex.
 * Prevents regex injection / ReDoS through search and location filters.
 */
export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').slice(0, 100);
}
