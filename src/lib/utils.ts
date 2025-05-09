import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines multiple class values into a single string using clsx and tailwind-merge
 * @param inputs Array of class values to be combined
 * @returns A string of combined and optimized class names
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Formats time in milliseconds to mm:ss format
 * @param timeInMilliseconds Time value in milliseconds
 * @returns Formatted time string in mm:ss format
 */
export function formatTime(timeInMilliseconds: number): string {
  if (timeInMilliseconds < 0) {
    return '0:00';
  }
  
  const totalSeconds = Math.floor(timeInMilliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Truncates text to a specified length and adds ellipsis
 * @param text Text to truncate
 * @param maxLength Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) {
    return text;
  }
  
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Debounces a function call
 * @param func Function to debounce
 * @param wait Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T, 
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
  };
}