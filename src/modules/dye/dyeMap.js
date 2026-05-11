import dyes from '@/data/dye.json'
import standardSpectrumDyes from '@/data/standardSpectrumDye.json'
import wideSpectrum1Dyes from '@/data/wideSpectrum1Dye.json'
import wideSpectrum2Dyes from '@/data/wideSpectrum2Dye.json'

const SPECTRUM_SET = {
  standard: { name: 'Standard Spectrum Dye', id: '52254' },
  wide1: { name: 'Wide Spectrum #1 Dye', id: '52255' },
  wide2: { name: 'Wide Spectrum #2 Dye', id: '52256' }
}

const legacyDyeByColor = new Map(
  dyes
    .map((dye) => [normalizeColorHex(dye.color), { name: dye.name, id: dye.id }])
    .filter(([color]) => Boolean(color))
)

const spectrumSetByDyeId = new Map()

for (const dye of standardSpectrumDyes) {
  if (dye?.id) {
    spectrumSetByDyeId.set(String(dye.id), SPECTRUM_SET.standard)
  }
}

for (const dye of wideSpectrum1Dyes) {
  if (dye?.id) {
    spectrumSetByDyeId.set(String(dye.id), SPECTRUM_SET.wide1)
  }
}

for (const dye of wideSpectrum2Dyes) {
  if (dye?.id) {
    spectrumSetByDyeId.set(String(dye.id), SPECTRUM_SET.wide2)
  }
}

const spectrumSetByColor = new Map()

for (const dye of dyes) {
  const color = normalizeColorHex(dye?.color)
  if (!color || !dye?.id) {
    continue
  }

  const setInfo = spectrumSetByDyeId.get(String(dye.id))
  if (setInfo) {
    spectrumSetByColor.set(color, setInfo)
  }
}

for (const dye of standardSpectrumDyes) {
  const color = normalizeColorHex(dye?.color)
  if (color) {
    spectrumSetByColor.set(color, SPECTRUM_SET.standard)
  }
}

for (const dye of wideSpectrum1Dyes) {
  const color = normalizeColorHex(dye?.color)
  if (color) {
    spectrumSetByColor.set(color, SPECTRUM_SET.wide1)
  }
}

for (const dye of wideSpectrum2Dyes) {
  const color = normalizeColorHex(dye?.color)
  if (color) {
    spectrumSetByColor.set(color, SPECTRUM_SET.wide2)
  }
}

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

  const match = spectrumSetByColor.get(normalized)
  return match ? match.name : 'Unknown Dye'
}

export function getDyeIdByColor(input) {
  const normalized = normalizeColorHex(input)
  if (!normalized) {
    return null
  }

  const match = spectrumSetByColor.get(normalized)
  return match ? match.id : '-'
}

// Legacy helpers kept for backward compatibility with old per-dye mapping behavior.
export function getDyeNameByColorLegacy(input) {
  const normalized = normalizeColorHex(input)
  if (!normalized) {
    return null
  }

  const match = legacyDyeByColor.get(normalized)
  return match ? match.name : 'Unknown Dye'
}

// Legacy helpers kept for backward compatibility with old per-dye mapping behavior.
export function getDyeIdByColorLegacy(input) {
  const normalized = normalizeColorHex(input)
  if (!normalized) {
    return null
  }

  const match = legacyDyeByColor.get(normalized)
  return match ? match.id : '-'
}
