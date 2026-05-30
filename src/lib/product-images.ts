export const PLACEHOLDER_IMAGE = "/placeholder-product.png"

export function parseLegacyImageUrls(input?: string | null): string[] {
  if (!input) {
    return []
  }

  return input
    .split(/[\r\n|]+/)
    .map((url) => url.trim())
    .filter((url) => url.length > 0)
}

export function getPrimaryLegacyImageUrl(input?: string | null): string | null {
  const urls = parseLegacyImageUrls(input)
  return urls.length > 0 ? urls[0] : null
}

export function getSafeImageSrc(input?: string | null): string {
  const primary = getPrimaryLegacyImageUrl(input)

  if (!primary) return PLACEHOLDER_IMAGE

  return primary.trim()
}
