import { defineStore } from 'pinia'
import { normalizeReMarket } from '@/modules/normalize/normalize'
import { compareLists } from '@/modules/compare/compare'
import { toTeamcraftImportUrl } from '@/modules/export/teamcraft'
import { fetchUniversalisPrices } from '@/modules/pricing/universalis'
import { readJsonFile } from '@/utils/file'
import { downloadCsv } from '@/utils/download'
import npcItems from '@/data/npcitem.json'
import dyes from '@/data/dye.json'

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function normalizeNpcName(name) {
  return String(name || '').trim().toLowerCase()
}

const npcItemPriceByName = new Map(
  (Array.isArray(npcItems?.items) ? npcItems.items : [])
    .filter((entry) => Number.isFinite(Number(entry?.price)))
    .map((entry) => [normalizeNpcName(entry?.name), Number(entry.price)])
)

const dyeItemIds = new Set(
  (Array.isArray(dyes) ? dyes : [])
    .map((entry) => Number(entry?.id))
    .filter((id) => Number.isFinite(id) && id > 0)
)

function isDyeRequirementItem(item) {
  const itemId = Number(item?.itemId)
  const itemName = String(item?.name || item?.itemName || '').trim()
  const source = String(item?.source || '').toLowerCase()

  if (source === 'dye') {
    return true
  }

  if (Number.isFinite(itemId) && dyeItemIds.has(itemId)) {
    return true
  }

  return /\bdye$/i.test(itemName)
}

export const useMainStore = defineStore('main', {
  state: () => ({
    rawA: null,
    rawB: null,
    normalizedA: [],
    normalizedB: [],
    compareResult: {
      added: [],
      removed: [],
      quantityChanged: []
    },
    selectedServer: '',
    removeDyeForPricing: false,
    priceRows: [],
    loading: false,
    error: '',
    notice: ''
  }),
  actions: {
    clearError() {
      this.error = ''
    },
    clearNotice() {
      this.notice = ''
    },
    async loadFile(which, file) {
      try {
        this.clearError()
        const parsed = await readJsonFile(file)

        if (which === 'A') {
          this.rawA = parsed
        } else {
          this.rawB = parsed
        }
      } catch (error) {
        this.error = error.message || 'Failed to load file.'
      }
    },
    normalize(which) {
      try {
        this.clearError()

        if (which === 'A') {
          this.normalizedA = normalizeReMarket(this.rawA)
          return
        }

        this.normalizedB = normalizeReMarket(this.rawB)
      } catch (error) {
        this.error = error.message || 'Failed to normalize data.'
      }
    },
    compareAB() {
      try {
        this.clearError()
        this.compareResult = compareLists(this.normalizedA, this.normalizedB)
      } catch (error) {
        this.error = error.message || 'Failed to compare normalized lists.'
      }
    },
    exportTeamcraft(rawItems) {
      try {
        this.clearError()
        const sourceItems = Array.isArray(rawItems) ? rawItems : [...this.normalizedA, ...this.normalizedB]
        const importUrl = toTeamcraftImportUrl(sourceItems)

        if (!importUrl) {
          throw new Error('No items to export to Teamcraft.')
        }

        const newTab = window.open(importUrl, '_blank', 'noopener,noreferrer')
        if (!newTab) {
          window.location.assign(importUrl)
        }
      } catch (error) {
        this.error = error.message || 'Failed to open Teamcraft import link.'
      }
    },
    exportPricePlanCsv() {
      try {
        this.clearError()

        const lines = [['Item Name', 'Quantity', 'Price Per Unit', 'Total Price']]

        for (const row of this.priceRows) {
          const planRows = Array.isArray(row?.purchasePlanRows) ? row.purchasePlanRows : []
          for (const plan of planRows) {
            lines.push([
              row.itemName || '',
              Number(plan.quantity || 0),
              Number(plan.pricePerUnit || 0),
              Number(plan.subtotal || 0)
            ])
          }
        }

        if (lines.length === 1) {
          throw new Error('No plan data to export. Please get prices first.')
        }

        downloadCsv('price-plan.csv', lines)
      } catch (error) {
        this.error = error.message || 'Failed to export price CSV.'
      }
    },
    async fetchPricesFromItems(rawItems, emptyErrorMessage = 'No items to price after applying filters.') {
      try {
        this.loading = true
        this.clearError()
        this.clearNotice()

        const safeItems = Array.isArray(rawItems) ? rawItems : []
        const sourceItems = this.removeDyeForPricing
          ? safeItems.filter((item) => !isDyeRequirementItem(item))
          : safeItems

        const requirementMap = new Map()
        for (const item of sourceItems) {
          const itemId = Number(item?.itemId)
          const quantity = Number(item?.quantity)
          const itemName = String(item?.name || '')

          if (!Number.isFinite(itemId) || itemId <= 0 || !Number.isFinite(quantity) || quantity <= 0) {
            continue
          }

          const key = `${itemId}|${itemName}`
          if (requirementMap.has(key)) {
            requirementMap.get(key).requiredQuantity += quantity
            continue
          }

          requirementMap.set(key, {
            itemId,
            itemName,
            requiredQuantity: quantity
          })
        }

        const requirements = Array.from(requirementMap.values())
        if (!requirements.length) {
          throw new Error(emptyErrorMessage)
        }

        const npcPriceRows = []
        const marketRequirements = []

        for (const requirement of requirements) {
          const npcUnitPrice = npcItemPriceByName.get(normalizeNpcName(requirement.itemName))

          if (Number.isFinite(npcUnitPrice)) {
            const totalCost = requirement.requiredQuantity * npcUnitPrice
            npcPriceRows.push({
              itemId: requirement.itemId,
              itemName: requirement.itemName,
              requiredQuantity: requirement.requiredQuantity,
              fulfilledQuantity: requirement.requiredQuantity,
              remainingQuantity: 0,
              minPrice: npcUnitPrice,
              averageUnitPrice: npcUnitPrice,
              totalCost,
              lastUploadTime: null,
              purchasePlanRows: [
                {
                  quantity: requirement.requiredQuantity,
                  pricePerUnit: npcUnitPrice,
                  worldName: 'NPC',
                  subtotal: totalCost
                }
              ],
              purchasePlan: `${requirement.requiredQuantity}x${npcUnitPrice}@NPC`
            })
            continue
          }

          marketRequirements.push(requirement)
        }

        if (!marketRequirements.length) {
          this.priceRows = npcPriceRows
          this.notice = 'Prices loaded successfully.'
          return
        }

        const maxAttempts = 3
        const retryCooldownMs = 10000
        let lastError = null

        for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
          this.notice = `Getting prices... attempt ${attempt}/${maxAttempts}`

          try {
            const marketRows = await fetchUniversalisPrices(this.selectedServer, marketRequirements)
            this.priceRows = [...npcPriceRows, ...marketRows]
            this.notice = 'Prices loaded successfully.'
            return
          } catch (error) {
            lastError = error

            if (attempt < maxAttempts) {
              this.notice = `Attempt ${attempt} failed. Retrying in 10 seconds...`
              await wait(retryCooldownMs)
            }
          }
        }

        throw lastError || new Error('Failed to fetch prices after 3 attempts.')
      } catch (error) {
        this.error = error.message || 'Failed to fetch prices.'
        this.notice = 'Failed to fetch prices after 3 attempts.'
      } finally {
        this.loading = false
      }
    },
    async fetchPricesProcessing() {
      return this.fetchPricesFromItems(this.normalizedA, 'No items in Processing list to price after applying filters.')
    },
    async fetchPricesAdvanced() {
      return this.fetchPricesFromItems(this.compareResult.added, 'No added items in Compare Result to price after applying filters.')
    },
    async fetchPrices() {
      return this.fetchPricesProcessing()
    }
  }
})
