import dyes from '@/data/dye.json'

const dyeByColor = new Map(
  dyes.map((dye) => [normalizeColorHex(dye.color), { name: dye.name, id: dye.id }])
)

export function normalizeColorHex(input) {
  if (input === null || input === undefined) {
    return null
  }

  const stripped = String(input).toUpperCase().replace(/[^0-9A-F]/g, '')
  if (!stripped) {
    return null
  }

  if (stripped.length >= 8) {
    return stripped.slice(0, 6)
  }

  if (stripped.length >= 6) {
    return stripped.slice(0, 6)
  }

  return null
}

export function getDyeNameByColor(input) {
  const normalized = normalizeColorHex(input)
  if (!normalized) {
    return null
  }

  const match = dyeByColor.get(normalized)
  return match ? match.name : 'Unknown Dye'
}

export function getDyeIdByColor(input) {
  const normalized = normalizeColorHex(input)
  if (!normalized) {
    return null
  }

  const match = dyeByColor.get(normalized)
  return match ? match.id : '-'
}
