<template>
  <div>
    <v-row>
      <v-col cols="12">
        <div class="category-filter-wrap mb-2">
          <div class="category-filter-title">Categories to include</div>
          <div class="category-filter-grid">
            <label
              v-for="option in categoryOptions"
              :key="option.value"
              class="category-checkbox"
            >
              <input
                type="checkbox"
                :value="option.value"
                v-model="selectedCategoriesModel"
              />
              <span>{{ option.label }}</span>
            </label>
          </div>
        </div>
      </v-col>
      <v-col cols="12" class="d-flex flex-wrap ga-2">
        <div class="actions-row mb-3">
            <v-btn color="primary" @click="$emit('process')">Process</v-btn>
        </div>
      </v-col>
    </v-row>

    <NormalizedTable
      title="Item List (A)"
      :rows="normalizedRows"
      :disable-teamcraft-button="loading"
      @export-teamcraft="$emit('export-teamcraft')"
    />

    <PriceTable
      :rows="priceRows"
      :loading="loading"
      :can-get-prices="canGetPrices"
      :remove-dye-for-pricing="removeDyeForPricing"
      :margin-input="marginInput"
      @update:remove-dye-for-pricing="$emit('update:removeDyeForPricing', $event)"
      @update:margin-input="$emit('update:marginInput', $event)"
      @get-prices="$emit('get-prices')"
      @export-price-csv="$emit('export-price-csv')"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import NormalizedTable from '@/components/NormalizedTable.vue'
import PriceTable from '@/components/PriceTable.vue'

const props = defineProps({
  categoryOptions: {
    type: Array,
    default: () => []
  },
  selectedCategories: {
    type: Array,
    default: () => []
  },
  normalizedRows: {
    type: Array,
    default: () => []
  },
  priceRows: {
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

const emit = defineEmits([
  'update:selectedCategories',
  'process',
  'export-teamcraft',
  'get-prices',
  'export-price-csv',
  'update:removeDyeForPricing',
  'update:marginInput'
])

const selectedCategoriesModel = computed({
  get: () => props.selectedCategories,
  set: (value) => emit('update:selectedCategories', value)
})
</script>

<style scoped>
.category-filter-wrap {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 10px 12px;
}

.category-filter-title {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
}

.category-filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 4px 12px;
}

.category-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 14px;
  line-height: 1.2;
  cursor: pointer;
}

.category-checkbox input[type='checkbox'] {
  width: 16px;
  height: 16px;
  margin: 0;
  cursor: pointer;
}
</style>
