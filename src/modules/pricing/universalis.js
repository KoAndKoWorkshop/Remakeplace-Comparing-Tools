function toNumberOrNull(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function toNumberOrZero(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function toIsoOrNull(value) {
  if (!value) {
    return null
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

function mapItemPrice(requirement, payload) {
  const listings = Array.isArray(payload?.listings) ? payload.listings : []

  const sortedListings = listings
    .map((listing) => ({
      pricePerUnit: toNumberOrZero(
        listing?.pricePerUnit ?? listing?.pricePerUnitNQ ?? listing?.pricePerUnitHQ
      ),
      quantity: toNumberOrZero(listing?.quantity),
      worldName: listing?.worldName || null
    }))
    .filter((listing) => listing.pricePerUnit > 0 && listing.quantity > 0)
    .sort((a, b) => a.pricePerUnit - b.pricePerUnit)

  let remaining = requirement.requiredQuantity
  let fulfilledQuantity = 0
  let totalCost = 0
  const picks = []

  for (const listing of sortedListings) {
    if (remaining <= 0) {
      break
    }

    const take = Math.min(remaining, listing.quantity)
    remaining -= take
    fulfilledQuantity += take
    totalCost += take * listing.pricePerUnit
    picks.push({
      quantity: take,
      pricePerUnit: listing.pricePerUnit,
      worldName: listing.worldName,
      subtotal: take * listing.pricePerUnit
    })
  }

  const averageUnitPrice = fulfilledQuantity > 0 ? totalCost / fulfilledQuantity : null

  return {
    itemId: Number(requirement.itemId),
    itemName: requirement.itemName,
    requiredQuantity: requirement.requiredQuantity,
    fulfilledQuantity,
    remainingQuantity: remaining,
    minPrice: toNumberOrNull(payload?.minPrice ?? payload?.minPriceNQ ?? payload?.minPriceHQ),
    averageUnitPrice: toNumberOrNull(averageUnitPrice),
    totalCost: toNumberOrNull(totalCost),
    lastUploadTime: toIsoOrNull(payload?.lastUploadTime ?? payload?.lastUpload),
    purchasePlanRows: picks,
    purchasePlan: picks
      .map((pick) => `${pick.quantity}x${pick.pricePerUnit}${pick.worldName ? `@${pick.worldName}` : ''}`)
      .join(' | ')
  }
}

function splitChunks(arr, size) {
  const chunks = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

export async function fetchUniversalisPrices(server, requiredItems) {
  const cleanServer = String(server || '').trim()
  if (!cleanServer) {
    throw new Error('Server is required.')
  }

  const requirements = Array.isArray(requiredItems)
    ? requiredItems
        .map((item) => ({
          itemId: Number(item?.itemId),
          itemName: String(item?.itemName || ''),
          requiredQuantity: toNumberOrZero(item?.requiredQuantity)
        }))
        .filter((item) => Number.isFinite(item.itemId) && item.itemId > 0 && item.requiredQuantity > 0)
    : []

  const ids = Array.from(new Set(requirements.map((item) => item.itemId)))

  if (!ids.length) {
    return []
  }

  const chunks = splitChunks(ids, 100)
  const rows = []

  for (const chunk of chunks) {
    const url = `https://universalis.app/api/v2/${encodeURIComponent(cleanServer)}/${chunk.join(',')}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Universalis request failed: ${response.status}`)
    }

    const json = await response.json()
    const items = json?.items && typeof json.items === 'object' ? json.items : {}

    for (const id of chunk) {
      for (const requirement of requirements.filter((item) => item.itemId === id)) {
        rows.push(mapItemPrice(requirement, items[id] || {}))
      }
    }
  }

  return rows
}
