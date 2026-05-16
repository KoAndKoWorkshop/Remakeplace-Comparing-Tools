import { normalizedCompareKey } from '@/utils/key'

function toMap(list) {
  const map = new Map()
  for (const item of list) {
    const key = normalizedCompareKey(item)
    if (!map.has(key)) {
      map.set(key, item)
      continue
    }

    const existing = map.get(key)
    map.set(key, {
      ...existing,
      quantity: Number(existing?.quantity || 0) + Number(item?.quantity || 0)
    })
  }
  return map
}

export function compareLists(left, right) {
  const leftMap = toMap(left)
  const rightMap = toMap(right)

  const added = []
  const removed = []
  const quantityChanged = []
  const toAdd = []

  for (const [key, rightItem] of rightMap.entries()) {
    const leftItem = leftMap.get(key)
    if (!leftItem) {
      added.push(rightItem)
      toAdd.push({
        ...rightItem,
        quantity: Number(rightItem?.quantity || 0)
      })
      continue
    }

    const leftQty = Number(leftItem?.quantity || 0)
    const rightQty = Number(rightItem?.quantity || 0)

    // Only keep increases where list B requires more than list A.
    if (rightQty > leftQty) {
      const deltaQty = rightQty - leftQty
      quantityChanged.push({
        key,
        leftQty,
        rightQty,
        deltaQty,
        item: rightItem
      })

      toAdd.push({
        ...rightItem,
        quantity: deltaQty
      })
    }
  }

  for (const [key, leftItem] of leftMap.entries()) {
    const rightItem = rightMap.get(key)
    if (!rightItem) {
      removed.push(leftItem)
      continue
    }

    const leftQty = Number(leftItem?.quantity || 0)
    const rightQty = Number(rightItem?.quantity || 0)

    // Keep decreases where old list B has more than new list A.
    if (leftQty > rightQty) {
      removed.push({
        ...leftItem,
        quantity: leftQty - rightQty
      })
    }
  }

  return { added, removed, quantityChanged, toAdd }
}
