const TEAMCRAFT_IMPORT_BASE_URL = 'https://ffxivteamcraft.com/import/'

export function toTeamcraftImportString(items) {
  const requirementMap = new Map()

  for (const item of Array.isArray(items) ? items : []) {
    const itemId = Number(item?.itemId)
    const quantity = Number(item?.quantity)
    const receiptIdRaw = item?.receiptId
    const receiptId = receiptIdRaw === null || receiptIdRaw === undefined || receiptIdRaw === ''
      ? ''
      : Number(receiptIdRaw)

    if (!Number.isFinite(itemId) || itemId <= 0) {
      continue
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      continue
    }

    if (receiptId !== '' && (!Number.isFinite(receiptId) || receiptId <= 0)) {
      continue
    }

    const key = `${itemId}|${receiptId}`
    if (requirementMap.has(key)) {
      requirementMap.get(key).quantity += quantity
      continue
    }

    requirementMap.set(key, {
      itemId,
      receiptId,
      quantity
    })
  }

  return Array.from(requirementMap.values())
    .map((entry) => `${entry.itemId},${entry.receiptId},${entry.quantity}`)
    .join(';')
}

export function toTeamcraftImportUrl(items) {
  const importString = toTeamcraftImportString(items)
  if (!importString) {
    return ''
  }

  return `${TEAMCRAFT_IMPORT_BASE_URL}${btoa(importString)}`
}
