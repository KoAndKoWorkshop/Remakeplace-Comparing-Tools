import { normalizedCompareKey } from '@/utils/key'

function toMap(list) {
  const map = new Map()
  for (const item of list) {
    map.set(normalizedCompareKey(item), item)
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
    if (!rightMap.has(key)) {
      removed.push(leftItem)
    }
  }

  return { added, removed, quantityChanged, toAdd }
}
