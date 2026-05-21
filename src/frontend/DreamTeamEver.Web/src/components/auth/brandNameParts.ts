/** Split "The Dream Team Ever" → main "The Dream Team" + accent "Ever". */
export function brandNameParts(
  fullName: string,
  options?: { nonBreakingMain?: boolean },
): { main: string; accent: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length <= 1) {
    return { main: fullName, accent: '' }
  }
  const mainJoiner = options?.nonBreakingMain ? '\u00a0' : ' '
  return {
    main: parts.slice(0, -1).join(mainJoiner),
    accent: parts[parts.length - 1] ?? '',
  }
}