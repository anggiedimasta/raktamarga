/**
 * Generate a unique family code
 */
export function generateFamilyCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Exclude confusing chars
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * Validate family code format
 */
export function isValidFamilyCode(code: string): boolean {
  return /^[A-Z0-9]{6,12}$/.test(code)
}

/**
 * Format date to Indonesian format (DD/MM/YYYY)
 */
export function formatDateId(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

/**
 * Format number to Indonesian locale
 */
export function formatNumberId(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num)
}
