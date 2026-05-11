import { getDatacenterByWorld } from '@/data/worldToDatacenter'

function toNumberOrZero(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function normalizeServerName(value) {
  const serverName = String(value || '').trim()
  return serverName || 'Unknown'
}

function normalizeItemName(value) {
  const itemName = String(value || '').trim()
  return itemName || 'Unknown Item'
}

function buildGroupedCardsFromEntries(entries) {
  const dcMap = new Map()

  for (const entry of entries) {
    const dcName = String(entry?.dcName || 'Other').trim() || 'Other'
    const serverName = normalizeServerName(entry?.serverName)
    const itemId = Number(entry?.itemId)
    const itemName = normalizeItemName(entry?.itemName)
    const quantity = toNumberOrZero(entry?.quantity)
    const unitPrice = toNumberOrZero(entry?.unitPrice)
    const subtotal = toNumberOrZero(entry?.subtotal)

    if (!quantity || !unitPrice) {
      continue
    }

    if (!dcMap.has(dcName)) {
      dcMap.set(dcName, {
        dcName,
        grandTotal: 0,
        serversMap: new Map()
      })
    }

    const dc = dcMap.get(dcName)
    if (!dc.serversMap.has(serverName)) {
      dc.serversMap.set(serverName, {
        serverName,
        totalCost: 0,
        itemsMap: new Map()
      })
    }

    const server = dc.serversMap.get(serverName)
    const itemKey = Number.isFinite(itemId) && itemId > 0 ? `${itemId}|${itemName}` : itemName

    if (!server.itemsMap.has(itemKey)) {
      server.itemsMap.set(itemKey, {
        itemId: Number.isFinite(itemId) ? itemId : null,
        itemName,
        quantity: 0,
        totalCost: 0,
        unitPrice: 0,
        isCheapestServer: false
      })
    }

    const item = server.itemsMap.get(itemKey)
    item.quantity += quantity
    item.totalCost += subtotal || quantity * unitPrice
    item.unitPrice = item.quantity > 0 ? item.totalCost / item.quantity : unitPrice

    server.totalCost += subtotal || quantity * unitPrice
    dc.grandTotal += subtotal || quantity * unitPrice
  }

  const cheapestServerByItem = new Map()

  for (const dc of dcMap.values()) {
    for (const server of dc.serversMap.values()) {
      for (const item of server.itemsMap.values()) {
        const key = item.itemId !== null ? `${item.itemId}|${item.itemName}` : item.itemName
        const currentCheapest = cheapestServerByItem.get(key)

        if (!currentCheapest || item.unitPrice < currentCheapest.unitPrice) {
          cheapestServerByItem.set(key, {
            unitPrice: item.unitPrice,
            serverName: server.serverName,
            dcName: dc.dcName
          })
        }
      }
    }
  }

  const datacenters = []

  for (const dc of dcMap.values()) {
    const servers = []

    for (const server of dc.serversMap.values()) {
      const items = Array.from(server.itemsMap.values())
        .map((item) => {
          const key = item.itemId !== null ? `${item.itemId}|${item.itemName}` : item.itemName
          const cheapest = cheapestServerByItem.get(key)
          return {
            ...item,
            isCheapestServer: Boolean(
              cheapest && cheapest.serverName === server.serverName && cheapest.dcName === dc.dcName
            )
          }
        })
        .sort((a, b) => a.itemName.localeCompare(b.itemName))

      servers.push({
        serverName: server.serverName,
        totalCost: server.totalCost,
        items
      })
    }

    servers.sort((a, b) => a.serverName.localeCompare(b.serverName))

    datacenters.push({
      dcName: dc.dcName,
      grandTotal: dc.grandTotal,
      servers
    })
  }

  return datacenters.sort((a, b) => a.dcName.localeCompare(b.dcName))
}

export function transformPriceRowsToDcCards(priceRows, options = {}) {
  const rows = Array.isArray(priceRows) ? priceRows : []
  const adjustUnitPrice = typeof options.adjustUnitPrice === 'function'
    ? options.adjustUnitPrice
    : (value) => value
  const adjustSubtotal = typeof options.adjustSubtotal === 'function'
    ? options.adjustSubtotal
    : (value) => value

  const entries = []

  for (const row of rows) {
    const itemId = Number(row?.itemId)
    const itemName = normalizeItemName(row?.itemName)
    const planRows = Array.isArray(row?.purchasePlanRows) ? row.purchasePlanRows : []

    for (const plan of planRows) {
      const serverName = normalizeServerName(plan?.worldName)
      const quantity = toNumberOrZero(plan?.quantity)
      const unitPrice = toNumberOrZero(adjustUnitPrice(plan?.pricePerUnit, quantity, row, plan))
      const subtotal = toNumberOrZero(adjustSubtotal(plan?.subtotal, quantity, row, plan))

      if (quantity <= 0 || unitPrice <= 0) {
        continue
      }

      entries.push({
        dcName: getDatacenterByWorld(serverName),
        serverName,
        itemId,
        itemName,
        quantity,
        unitPrice,
        subtotal: subtotal > 0 ? subtotal : quantity * unitPrice
      })
    }
  }

  return buildGroupedCardsFromEntries(entries)
}

export function transformUniversalisItemsToDcCards(itemsById, options = {}) {
  const items = itemsById && typeof itemsById === 'object' ? itemsById : {}
  const resolveItemName = typeof options.resolveItemName === 'function'
    ? options.resolveItemName
    : (itemId) => String(itemId)

  const entries = []

  for (const [itemIdRaw, itemPayload] of Object.entries(items)) {
    const itemId = Number(itemIdRaw)
    const itemName = normalizeItemName(resolveItemName(itemId, itemPayload))
    const listings = Array.isArray(itemPayload?.listings) ? itemPayload.listings : []

    for (const listing of listings) {
      const serverName = normalizeServerName(listing?.worldName)
      const quantity = toNumberOrZero(listing?.quantity)
      const unitPrice = toNumberOrZero(
        listing?.pricePerUnit ?? listing?.pricePerUnitNQ ?? listing?.pricePerUnitHQ
      )

      if (quantity <= 0 || unitPrice <= 0) {
        continue
      }

      entries.push({
        dcName: getDatacenterByWorld(serverName),
        serverName,
        itemId,
        itemName,
        quantity,
        unitPrice,
        subtotal: quantity * unitPrice
      })
    }
  }

  return buildGroupedCardsFromEntries(entries)
}
