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

  for (const [key, rightItem] of rightMap.entries()) {
    const leftItem = leftMap.get(key)
    if (!leftItem) {
      added.push(rightItem)
      continue
    }

    if (leftItem.quantity !== rightItem.quantity) {
      quantityChanged.push({
        key,
        leftQty: leftItem.quantity,
        rightQty: rightItem.quantity,
        item: rightItem
      })
    }
  }

  for (const [key, leftItem] of leftMap.entries()) {
    if (!rightMap.has(key)) {
      removed.push(leftItem)
    }
  }

  return { added, removed, quantityChanged }
}
