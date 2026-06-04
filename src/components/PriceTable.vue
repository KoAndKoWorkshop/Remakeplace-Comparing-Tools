<template>
  <v-card class="mb-4" variant="tonal">
    <v-card-title class="card-title-row">
      <span>Price</span>
      <v-btn
        icon
        size="small"
        variant="text"
        :aria-label="isExpanded ? 'Collapse section' : 'Expand section'"
        @click="toggleExpanded"
      >
        <svg :class="['chevron-icon', { 'is-up': isExpanded }]" viewBox="0 0 24 24" aria-hidden="true">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </v-btn>
    </v-card-title>
    <v-expand-transition>
      <div v-show="isExpanded" class="expand-body-wrap">
        <v-card-text>
      <div class="controls-row mb-2">
        <label class="remove-dye-option" for="remove-dye-checkbox">
          <input
            id="remove-dye-checkbox"
            type="checkbox"
            :checked="removeDyeForPricing"
            @change="onToggleRemoveDye($event.target.checked)"
          />
          <span>Remove dye</span>
        </label>

        <v-text-field
          label="Margin"
          :model-value="marginInput"
          placeholder="10 or 10%"
          density="comfortable"
          variant="outlined"
          hide-details
          class="margin-input"
          @update:model-value="onUpdateMarginInput"
        />
      </div>

      <v-alert v-if="marginRule.error" type="error" variant="tonal" density="comfortable" class="mb-2">
        {{ marginRule.error }}
      </v-alert>

      <div class="price-actions mb-3">
        <div class="left-actions">
          <v-btn color="info" :disabled="loading || !canGetPrices" @click="$emit('get-prices')">Get Prices</v-btn>
        </div>
        <v-btn color="success" :disabled="loading || !rows.length" @click="$emit('export-price-csv')">
          Export Price CSV
        </v-btn>
      </div>

      <div class="total-price-summary mb-3">Total Price: {{ formatPrice(totalAdjustedPrice) }}</div>

      <div v-if="groupedDcData.length" class="dc-groups">
        <section v-for="dc in groupedDcData" :key="dc.dcName" class="dc-group">
          <div class="dc-header">
            <strong>{{ dc.dcName }}</strong>
            <div class="dc-header-right">
              <span>{{ formatPrice(dc.grandTotal) }} gil</span>
              <v-btn
                icon
                size="small"
                variant="text"
                :aria-label="isDcExpanded(dc.dcName) ? `Collapse ${dc.dcName}` : `Expand ${dc.dcName}`"
                @click="toggleDc(dc.dcName)"
              >
                <svg :class="['chevron-icon', { 'is-up': isDcExpanded(dc.dcName) }]" viewBox="0 0 24 24" aria-hidden="true">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </v-btn>
            </div>
          </div>

          <v-expand-transition>
            <div v-show="isDcExpanded(dc.dcName)" class="server-grid">
              <article v-for="server in dc.servers" :key="`${dc.dcName}-${server.serverName}`" class="server-card">
                <header class="server-card-header">
                  <h3>{{ server.serverName }}</h3>
                  <p>Total Cost: {{ formatPrice(server.totalCost) }} gil</p>
                </header>

                <ul class="item-list">
                  <li v-for="item in server.items" :key="`${server.serverName}-${item.itemId || item.itemName}`" class="item-row">
                    <span>{{ item.quantity }}x {{ item.itemName }} ({{ formatPrice(item.unitPrice) }} gil each)</span>
                  </li>
                </ul>
              </article>
            </div>
          </v-expand-transition>
        </section>
      </div>

      <v-alert v-else type="info" variant="tonal" density="comfortable">
        No prices loaded.
      </v-alert>

      <div v-if="noPriceRows.length" class="no-price-section mt-4">
        <div class="no-price-header">No Price Data</div>
        <table class="no-price-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in noPriceRows" :key="row.itemId || row.itemName">
              <td>{{ row.itemName }}</td>
              <td>{{ row.requiredQuantity }}</td>
            </tr>
          </tbody>
        </table>
      </div>
        </v-card-text>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script setup>
import { computed, ref } from 'vue'
import { adjustTotalCost, adjustUnitPrice, parsePriceMarginInput, roundUp } from '@/utils/pricingMargin'
import { transformPriceRowsToDcCards } from '@/modules/pricing/marketGrouping'

const emit = defineEmits(['get-prices', 'export-price-csv', 'update:removeDyeForPricing', 'update:marginInput'])

const props = defineProps({
  rows: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  canGetPrices: {
    type: Boolean,
    default: false
  },
  removeDyeForPricing: {
    type: Boolean,
    default: false
  },
  marginInput: {
    type: String,
    default: '5%'
  },
  noPriceRows: {
    type: Array,
    default: () => []
  }
})

const marginRule = computed(() => parsePriceMarginInput(props.marginInput))
const collapsedDatacenters = ref({})
const isExpanded = ref(true)
const groupedDcData = computed(() => {
  return transformPriceRowsToDcCards(props.rows, {
    adjustUnitPrice: (pricePerUnit) => adjustUnitPrice(pricePerUnit, marginRule.value),
    adjustSubtotal: (subtotal, quantity) => adjustTotalCost(subtotal, quantity, marginRule.value)
  })
})
const totalAdjustedPrice = computed(() => {
  return groupedDcData.value.reduce((sum, dc) => sum + Number(dc?.grandTotal || 0), 0)
})

function onToggleRemoveDye(value) {
  emit('update:removeDyeForPricing', Boolean(value))
}

function onUpdateMarginInput(value) {
  emit('update:marginInput', String(value ?? ''))
}

function isDcExpanded(dcName) {
  const key = String(dcName || '')
  return collapsedDatacenters.value[key] !== true
}

function toggleDc(dcName) {
  const key = String(dcName || '')
  collapsedDatacenters.value[key] = isDcExpanded(key)
}

function toggleExpanded() {
  isExpanded.value = !isExpanded.value
}

function formatPrice(value) {
  const amount = roundUp(value)
  if (amount === null) {
    return '-'
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0
  }).format(amount)
}
</script>

<style scoped>
.controls-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.card-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.expand-body-wrap {
  overflow: hidden;
}

.chevron-icon {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.2;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: transform 0.2s ease;
}

.chevron-icon.is-up {
  transform: rotate(180deg);
}

.remove-dye-option {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  line-height: 1.2;
  cursor: pointer;
}

.remove-dye-option input[type='checkbox'] {
  width: 16px;
  height: 16px;
  margin: 0;
  cursor: pointer;
}

.margin-input {
  min-width: 220px;
  max-width: 260px;
}

.price-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.left-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.total-price-summary {
  font-size: 14px;
  font-weight: 600;
}

.dc-groups {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dc-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dc-header {
  width: 100%;
  background: #1f4b38;
  color: #f4fff8;
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.dc-header-right {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.server-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.server-card {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.03);
}

.server-card-header {
  margin-bottom: 8px;
}

.server-card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
}

.server-card-header p {
  margin: 2px 0 0;
  font-size: 13px;
  color: #b8c0cf;
}

.item-list {
  margin: 0;
  padding-left: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.no-price-section {
  border: 1px solid rgba(255, 180, 50, 0.4);
  border-radius: 8px;
  padding: 10px 12px;
  background: rgba(255, 180, 50, 0.05);
}

.no-price-header {
  font-size: 14px;
  font-weight: 600;
  color: #ffb432;
  margin-bottom: 8px;
}

.no-price-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.no-price-table th,
.no-price-table td {
  text-align: left;
  padding: 4px 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.no-price-table th {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
}
</style>
