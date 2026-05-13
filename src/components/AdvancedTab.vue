<template>
  <div>
    <v-row>
      <v-col cols="12">
        <FileUploadCard
          :key="`file-b-${fileInputResetKey}`"
          title="Import Old Design JSON (B)"
          :file-name="fileBName"
          helper-text="*Import new design JSON in A first, then import old design JSON in B to see what items are newly required and what can be removed."
          @selected="$emit('pick-b', $event)"
        />
      </v-col>
      <v-col cols="12">
        <div class="category-filter-wrap mb-2">
          <div class="category-filter-title">Categories to include</div>
          <div class="category-filter-grid">
            <label
              v-for="option in categoryOptions"
              :key="`advanced-${option.value}`"
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
      <v-col cols="12">
        <div class="actions-row mb-3">
            <v-btn color="primary" :disabled="!hasFileB" @click="$emit('process')">Process</v-btn>
            <v-btn color="warning" :disabled="!canCompare" @click="$emit('compare')">Compare New (A) vs Old (B)</v-btn>
        </div>
      </v-col>
    </v-row>

    <NormalizedTable
      v-if="hasFileB"
      title="Item List (B)"
      :rows="normalizedB"
      :disable-teamcraft-button="loading"
      @update:selected-rows="onUpdateSelectedRowsB"
      @export-teamcraft="onExportTeamcraftB"
    />

    <DiffTable
      v-if="hasFileB"
      :result="compareResult"
      :disable-teamcraft-button="loading"
      @update:selected-to-add-rows="onUpdateSelectedToAddRows"
      @export-teamcraft-added="onExportTeamcraftAdded"
    />

    <div class="price-mode-wrap mb-2">
      <div class="price-mode-title">Advanced Pricing Mode</div>
      <v-btn-toggle
        :model-value="priceMode"
        color="info"
        density="comfortable"
        mandatory
        @update:model-value="onUpdatePriceMode"
      >
        <v-btn value="b-only">Price B JSON</v-btn>
        <v-btn value="compare">Price Compare (New A vs Old B)</v-btn>
      </v-btn-toggle>
    </div>

    <PriceTable
      :rows="priceRows"
      :loading="loading"
      :can-get-prices="canGetPricesBySelection"
      :remove-dye-for-pricing="removeDyeForPricing"
      :margin-input="marginInput"
      @update:remove-dye-for-pricing="$emit('update:removeDyeForPricing', $event)"
      @update:margin-input="$emit('update:marginInput', $event)"
      @get-prices="onGetPrices"
      @export-price-csv="$emit('export-price-csv')"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import FileUploadCard from '@/components/FileUploadCard.vue'
import NormalizedTable from '@/components/NormalizedTable.vue'
import DiffTable from '@/components/DiffTable.vue'
import PriceTable from '@/components/PriceTable.vue'

const props = defineProps({
  fileInputResetKey: {
    type: Number,
    default: 0
  },
  fileBName: {
    type: String,
    default: ''
  },
  hasFileB: {
    type: Boolean,
    default: false
  },
  categoryOptions: {
    type: Array,
    default: () => []
  },
  selectedCategories: {
    type: Array,
    default: () => []
  },
  canCompare: {
    type: Boolean,
    default: false
  },
  normalizedB: {
    type: Array,
    default: () => []
  },
  compareResult: {
    type: Object,
    default: () => ({
      added: [],
      removed: [],
      quantityChanged: [],
      toAdd: []
    })
  },
  priceRows: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  canGetPricesB: {
    type: Boolean,
    default: false
  },
  canGetPricesCompare: {
    type: Boolean,
    default: false
  },
  priceMode: {
    type: String,
    default: 'compare'
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
  'pick-b',
  'update:selectedCategories',
  'process',
  'compare',
  'export-teamcraft-b',
  'export-teamcraft-added',
  'update:priceMode',
  'get-prices-b',
  'get-prices-compare',
  'export-price-csv',
  'update:removeDyeForPricing',
  'update:marginInput'
])

const selectedCategoriesModel = computed({
  get: () => props.selectedCategories,
  set: (value) => emit('update:selectedCategories', value)
})

const selectedRowsB = ref([])
const selectedToAddRows = ref([])

const canGetPricesByMode = computed(() => {
  return props.priceMode === 'b-only' ? props.canGetPricesB : props.canGetPricesCompare
})

const canGetPricesBySelection = computed(() => {
  const hasSelection = props.priceMode === 'b-only'
    ? selectedRowsB.value.length > 0
    : selectedToAddRows.value.length > 0

  return canGetPricesByMode.value && hasSelection
})

function onUpdateSelectedRowsB(rows) {
  selectedRowsB.value = Array.isArray(rows) ? rows : []
}

function onUpdateSelectedToAddRows(rows) {
  selectedToAddRows.value = Array.isArray(rows) ? rows : []
}

function onExportTeamcraftB() {
  emit('export-teamcraft-b', selectedRowsB.value)
}

function onExportTeamcraftAdded() {
  emit('export-teamcraft-added', selectedToAddRows.value)
}

function onUpdatePriceMode(value) {
  if (value) {
    emit('update:priceMode', value)
  }
}

function onGetPrices() {
  if (props.priceMode === 'b-only') {
    emit('get-prices-b', selectedRowsB.value)
    return
  }

  emit('get-prices-compare', selectedToAddRows.value)
}
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

.actions-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.price-mode-wrap {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.price-mode-title {
  font-size: 13px;
  font-weight: 600;
}
</style>
