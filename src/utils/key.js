export function cleanColorRaw(input) {
  if (typeof input !== 'string') {
    return null
  }

  const value = input.trim()
  return value ? value : null
}

export function furnitureGroupKey(source, itemId, color, materialItemId) {
  return [source, itemId, color || '', materialItemId ?? ''].join('|')
}

export function fixtureGroupKey(source, itemId, fixtureType, level, color) {
  return [source, itemId, fixtureType || '', level || '', color || ''].join('|')
}

export function normalizedCompareKey(item) {
  if (item.source === 'grouped' || item.source === 'dye') {
    return [item.source, item.itemId, item.name || ''].join('|')
  }

  if (item.source === 'interiorFurniture') {
    return furnitureGroupKey(item.source, item.itemId, item.color, item.materialItemId)
  }

  if (item.source === 'interiorFixture' || item.source === 'exteriorFixture') {
    return fixtureGroupKey(
      item.source,
      item.itemId,
      item.fixtureType,
      item.level,
      item.color
    )
  }

  return [item.source || '', item.itemId || '', item.name || ''].join('|')
}
