/** Join class names — lightweight alternative to clsx + tailwind-merge */
export function cn(...parts) {
  return parts.filter(Boolean).join(' ')
}
