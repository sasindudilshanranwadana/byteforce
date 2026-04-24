import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, differenceInDays, isPast } from 'date-fns';

/**
 * Merge Tailwind classes safely — handles conflicts.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as USD currency.
 * @param {number} amount
 * @param {boolean} compact - use compact notation for large numbers
 */
export function formatCurrency(amount, compact = false) {
  if (amount == null) return '$0';
  if (compact && amount >= 1000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a date string for display.
 * @param {string|Date} date
 * @param {string} fmt - date-fns format string
 */
export function formatDate(date, fmt = 'MMM d, yyyy') {
  if (!date) return '';
  try {
    return format(new Date(date), fmt);
  } catch {
    return '';
  }
}

/**
 * Get days remaining until a deadline.
 * Returns 0 if deadline has passed.
 * @param {string|Date} deadline
 */
export function getDaysLeft(deadline) {
  if (!deadline) return 0;
  const days = differenceInDays(new Date(deadline), new Date());
  return Math.max(0, days);
}

/**
 * Check if a deadline has passed.
 */
export function isExpired(deadline) {
  if (!deadline) return false;
  return isPast(new Date(deadline));
}

/**
 * Get relative time string, e.g. "3 days ago"
 */
export function timeAgo(date) {
  if (!date) return '';
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return '';
  }
}

/**
 * Calculate funding percentage, capped at 100.
 */
export function getFundingPercent(raised, goal) {
  if (!goal || goal <= 0) return 0;
  return Math.min(100, Math.round((raised / goal) * 100));
}

/**
 * Truncate text to a max length, appending "..."
 */
export function truncate(text, maxLength = 120) {
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength).trimEnd() + '...' : text;
}

/**
 * Get initials from a name for avatar fallback.
 */
export function getInitials(name) {
  if (!name) return '?';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

/**
 * Category metadata — label, emoji, color classes.
 */
export const CATEGORIES = [
  { value: 'technology', label: 'Technology', emoji: '💻', color: 'bg-blue-100 text-blue-700' },
  { value: 'arts', label: 'Arts & Creative', emoji: '🎨', color: 'bg-pink-100 text-pink-700' },
  { value: 'community', label: 'Community', emoji: '🤝', color: 'bg-green-100 text-green-700' },
  { value: 'education', label: 'Education', emoji: '📚', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'environment', label: 'Environment', emoji: '🌱', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'health', label: 'Health', emoji: '❤️', color: 'bg-red-100 text-red-700' },
  { value: 'gaming', label: 'Gaming', emoji: '🎮', color: 'bg-purple-100 text-purple-700' },
  { value: 'music', label: 'Music', emoji: '🎵', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'social', label: 'Social Impact', emoji: '🌍', color: 'bg-teal-100 text-teal-700' },
  { value: 'other', label: 'Other', emoji: '✨', color: 'bg-slate-100 text-slate-700' },
];

export function getCategoryMeta(value) {
  return CATEGORIES.find((c) => c.value === value) || CATEGORIES[CATEGORIES.length - 1];
}
