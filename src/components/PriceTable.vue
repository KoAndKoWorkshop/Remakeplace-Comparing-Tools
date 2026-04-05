<template>
  <v-card class="mb-4" variant="tonal">
    <v-card-title>Price</v-card-title>
    <v-card-text>
      <div class="checkbox-row mb-2">
        <label class="remove-dye-option" for="remove-dye-checkbox">
          <input
            id="remove-dye-checkbox"
            type="checkbox"
            :checked="removeDyeForPricing"
            @change="onToggleRemoveDye($event.target.checked)"
          />
          <span>Remove dye</span>
        </label>
      </div>

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
            <th>Required Qty</th>
            <th>Fulfilled Qty</th>
            <th>Remaining Qty</th>
            <th>Unit Price Avg</th>
            <th>Total Cost</th>
            <th>Last Upload Time</th>
            <th>Plan (Low to High)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in rows" :key="`${row.itemId}-${index}`">
            <td>{{ row.itemId }}</td>
            <td>{{ row.itemName }}</td>
            <td>{{ row.requiredQuantity }}</td>
            <td>{{ row.fulfilledQuantity }}</td>
            <td>{{ row.remainingQuantity }}</td>
            <td>{{ row.averageUnitPrice }}</td>
            <td>{{ row.totalCost }}</td>
            <td>{{ row.lastUploadTime }}</td>
            <td>
              <div v-if="row.purchasePlanRows?.length" class="plan-rows">
                <div v-for="(pick, pickIndex) in row.purchasePlanRows" :key="`${row.itemId}-${index}-${pickIndex}`">
                  {{ pick.quantity }} x {{ pick.pricePerUnit }}
                  <span v-if="pick.worldName">@{{ pick.worldName }}</span>
                  = {{ pick.subtotal }}
                </div>
              </div>
              <span v-else>-</span>
            </td>
          </tr>
          <tr v-if="rows.length === 0">
            <td colspan="9">No prices loaded.</td>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>
  </v-card>
</template>

<script setup>
const emit = defineEmits(['get-prices', 'export-price-csv', 'update:removeDyeForPricing'])

function onToggleRemoveDye(value) {
  emit('update:removeDyeForPricing', Boolean(value))
}

defineProps({
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
  }
})
</script>

<style scoped>
.checkbox-row {
  display: flex;
  align-items: center;
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
