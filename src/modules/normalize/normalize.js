import { getDyeIdByColor, getDyeNameByColor } from '@/modules/dye/dyeMap'
import { cleanColorRaw } from '@/utils/key'

function toNumber(value) {
  const num = Number(value)
  return Number.isFinite(num) ? num : 0
}

function addOrUpdate(map, key, seedItem) {
  if (map.has(key)) {
    map.get(key).quantity += 1
    return
  }

  map.set(key, {
    ...seedItem,
    quantity: 1
  })
}

function enrichDye(color) {
  if (!color) {
    return { dyeName: null, dyeId: null }
  }

  return {
    dyeName: getDyeNameByColor(color),
    dyeId: getDyeIdByColor(color)
  }
}

function groupedItemKey(itemId, name) {
  return `${itemId}|${name}`
}

function addGroupedItem(map, itemId, name) {
  const safeName = name || ''
  const key = groupedItemKey(itemId, safeName)

  addOrUpdate(map, key, {
    source: 'grouped',
    itemId,
    name: safeName,
    color: null,
    dyeName: null,
    dyeId: null,
    materialItemId: null,
    level: null,
    fixtureType: null
  })
}

function addMaterialItem(map, entry) {
  const materialItemId = toNumber(entry?.properties?.material?.itemId)
  if (materialItemId === 0) {
    return
  }

  const materialName = entry?.properties?.material?.name || ''
  addGroupedItem(map, materialItemId, materialName)
}

function addDyeItem(map, dyeId, dyeName) {
  const itemId = toNumber(dyeId)
  if (itemId === 0 || !dyeName || dyeName === 'Unknown Dye') {
    return
  }

  const key = groupedItemKey(itemId, dyeName)
  if (map.has(key)) {
    map.get(key).quantity += 1
    return
  }

  map.set(key, {
    source: 'dye',
    itemId,
    name: dyeName,
    quantity: 1,
    color: null,
    dyeName: null,
    dyeId: null,
    materialItemId: null,
    level: null,
    fixtureType: null
  })
}

export function normalizeReMarket(raw) {
  /** @type {Map<string, import('@/modules/types').NormalizedItem>} */
  const grouped = new Map()
  /** @type {Map<string, import('@/modules/types').NormalizedItem>} */
  const groupedDyes = new Map()

  const furniture = Array.isArray(raw?.interiorFurniture) ? raw.interiorFurniture : []
  for (const entry of furniture) {
    const itemId = toNumber(entry?.itemId)
    if (itemId === 0) {
      continue
    }

    const color = cleanColorRaw(entry?.properties?.color)
    const dye = enrichDye(color)

    addGroupedItem(grouped, itemId, entry?.name || '')
    addMaterialItem(grouped, entry)
    addDyeItem(groupedDyes, dye.dyeId, dye.dyeName)
  }

  const sources = [
    { key: 'interiorFixture', list: Array.isArray(raw?.interiorFixture) ? raw.interiorFixture : [] },
    { key: 'exteriorFixture', list: Array.isArray(raw?.exteriorFixture) ? raw.exteriorFixture : [] }
  ]

  for (const src of sources) {
    for (const entry of src.list) {
      const itemId = toNumber(entry?.itemId)
      if (itemId === 0) {
        continue
      }

      const color = cleanColorRaw(entry?.color)
      const dye = enrichDye(color)

      addGroupedItem(grouped, itemId, entry?.name || '')
      addDyeItem(groupedDyes, dye.dyeId, dye.dyeName)
    }
  }

  const merged = [...grouped.values(), ...groupedDyes.values()]
  return merged.sort((a, b) => a.itemId - b.itemId || a.name.localeCompare(b.name))
}
