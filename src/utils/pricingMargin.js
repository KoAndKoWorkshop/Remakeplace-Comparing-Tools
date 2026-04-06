function toFiniteNumber(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

export function roundUp(value) {
  const n = toFiniteNumber(value)
  return n === null ? null : Math.ceil(n)
}

export function parsePriceMarginInput(input) {
  const text = String(input ?? '').trim()

  if (!text) {
    return {
      isValid: true,
      type: 'none',
      value: 0,
      error: ''
    }
  }

  if (text.includes('%')) {
    const percentText = text.replace('%', '').trim()
    const percentValue = toFiniteNumber(percentText)

    if (percentValue === null) {
      return {
        isValid: false,
        type: 'percent',
        value: 0,
        error: 'Invalid margin. Use a number like 10 or percentage like 10%.'
      }
    }

    return {
      isValid: true,
      type: 'percent',
      value: percentValue / 100,
      error: ''
    }
  }

  const flatValue = toFiniteNumber(text)
  if (flatValue === null) {
    return {
      isValid: false,
      type: 'flat',
      value: 0,
      error: 'Invalid margin. Use a number like 10 or percentage like 10%.'
    }
  }

  return {
    isValid: true,
    type: 'flat',
    value: flatValue,
    error: ''
  }
}

export function adjustUnitPrice(baseUnitPrice, marginRule) {
  const unit = toFiniteNumber(baseUnitPrice)
  if (unit === null) {
    return null
  }

  if (!marginRule?.isValid || marginRule.type === 'none') {
    return unit
  }

  if (marginRule.type === 'percent') {
    return unit * (1 + marginRule.value)
  }

  return unit + marginRule.value
}

export function adjustTotalCost(baseTotalCost, quantity, marginRule) {
  const total = toFiniteNumber(baseTotalCost)
  const qty = toFiniteNumber(quantity)

  if (total === null) {
    return null
  }

  if (!marginRule?.isValid || marginRule.type === 'none') {
    return total
  }

  if (marginRule.type === 'percent') {
    return total * (1 + marginRule.value)
  }

  if (qty === null) {
    return total
  }

  return total + marginRule.value * qty
}