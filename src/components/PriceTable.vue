<template>
  <v-card class="mb-4" variant="tonal">
    <v-card-title>Price</v-card-title>
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

      <v-table density="compact" class="table-wrap">
        <thead>
          <tr>
            <th>Id</th>
            <th>Name</th>
            <th>Qty</th>
            <th>Avg Price</th>
            <th>Total Cost</th>
            <th>Plan (Low to High)</th>
            <th>Last Upload Time</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in rows" :key="`${row.itemId}-${index}`">
            <td>{{ row.itemId }}</td>
            <td>{{ row.itemName }}</td>
            <td>{{ row.requiredQuantity }}</td>
            <td>{{ formatPrice(getAdjustedAveragePrice(row)) }}</td>
            <td>{{ formatPrice(getAdjustedTotalCost(row)) }}</td>
            <td>
              <div v-if="row.purchasePlanRows?.length" class="plan-rows">
                <div v-for="(pick, pickIndex) in row.purchasePlanRows" :key="`${row.itemId}-${index}-${pickIndex}`">
                  {{ pick.quantity }} x {{ formatPrice(getAdjustedPlanUnitPrice(pick)) }}
                  <span v-if="pick.worldName">@{{ pick.worldName }}</span>
                  = {{ formatPrice(getAdjustedPlanSubtotal(pick)) }}
                </div>
              </div>
              <span v-else>-</span>
            </td>
            <td>{{ row.lastUploadTime }}</td>
          </tr>
          <tr v-if="rows.length === 0">
            <td colspan="7">No prices loaded.</td>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { adjustTotalCost, adjustUnitPrice, parsePriceMarginInput } from '@/utils/pricingMargin'

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
  }
})

const marginRule = computed(() => parsePriceMarginInput(props.marginInput))

function onToggleRemoveDye(value) {
  emit('update:removeDyeForPricing', Boolean(value))
}

function onUpdateMarginInput(value) {
  emit('update:marginInput', String(value ?? ''))
}

function getAdjustedAveragePrice(row) {
  return adjustUnitPrice(row?.averageUnitPrice, marginRule.value)
}

function getAdjustedTotalCost(row) {
  const quantity = Number(row?.fulfilledQuantity || row?.requiredQuantity || 0)
  return adjustTotalCost(row?.totalCost, quantity, marginRule.value)
}

function getAdjustedPlanUnitPrice(planRow) {
  return adjustUnitPrice(planRow?.pricePerUnit, marginRule.value)
}

function getAdjustedPlanSubtotal(planRow) {
  return adjustTotalCost(planRow?.subtotal, planRow?.quantity, marginRule.value)
}

function formatPrice(value) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) {
    return '-'
  }

  return amount.toFixed(2)
}
</script>

<style scoped>
.controls-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
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

.plan-rows {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
</style>
