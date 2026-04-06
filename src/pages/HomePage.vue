<template>
  <v-container class="page-wrap">
    <div class="workspace-layout">
      <aside class="left-pane">
        <v-card variant="tonal">
          <v-card-text>
            <img class="brand-logo" :src="kokoLogo" alt="Ko&Ko Workshop logo" />
            <h1 class="left-title">Ko&Ko Workshop Tools</h1>

            <FileUploadCard :key="`file-a-${fileInputResetKey}`" title="Import JSON (A)" :file-name="fileAName" @selected="onPickA" />

            <v-select
              v-model="selectedRegion"
              :items="regionOptions"
              label="Region"
              item-title="label"
              item-value="value"
              variant="outlined"
              density="comfortable"
              class="mb-2"
              @update:model-value="onRegionSelect"
            />

            <v-select
              v-model="selectedDatacenter"
              :items="filteredDatacenterOptions"
              label="Datacenter"
              item-title="label"
              item-value="value"
              variant="outlined"
              density="comfortable"
              :disabled="!selectedRegion"
              @update:model-value="onServerSelect"
            />

            <v-btn v-if="hasFileA" block color="error" variant="outlined" class="mt-2" @click="resetPage">
              Reset All
            </v-btn>

            <v-alert v-if="hasFileA" type="success" variant="tonal" density="comfortable" class="mt-2">
              File A loaded: {{ fileAName }}
            </v-alert>
            <v-alert v-if="store.error" type="error" variant="tonal" density="comfortable" class="mt-2">
              {{ store.error }}
            </v-alert>
          </v-card-text>
        </v-card>
      </aside>

      <section class="right-pane" v-if="hasFileA">
        <v-card class="mb-4" variant="tonal">
          <v-card-title>Workspace</v-card-title>
          <v-card-text>
            <v-tabs v-model="activeTab" color="primary" bg-color="transparent" class="mb-3">
              <v-tab value="processing">Processing</v-tab>
              <v-tab value="advanced">Advanced</v-tab>
            </v-tabs>

            <v-row v-if="activeTab === 'processing'">
              <v-col cols="12">
                <div class="category-filter-wrap mb-2">
                  <div class="category-filter-title">Categories to include</div>
                  <div class="category-filter-grid">
                    <label
                      v-for="option in processingCategoryOptions"
                      :key="option.value"
                      class="category-checkbox"
                    >
                      <input
                        type="checkbox"
                        :value="option.value"
                        v-model="selectedProcessingCategories"
                      />
                      <span>{{ option.label }}</span>
                    </label>
                  </div>
                </div>
              </v-col>
              <v-col cols="12" class="d-flex flex-wrap ga-2">
                <v-btn color="primary" @click="processA">Process</v-btn>
              </v-col>
            </v-row>

            <v-row v-if="activeTab === 'advanced'">
              <v-col cols="12">
                <FileUploadCard
                  :key="`file-b-${fileInputResetKey}`"
                  title="Import Second JSON (B)"
                  :file-name="fileBName"
                  helper-text="*Import old JSON in A, and new JSON in B to compare the furniture and generate the list of new items you need to obtain."
                  @selected="onPickB"
                />
              </v-col>
              <v-col cols="12">
                <div class="category-filter-wrap mb-2">
                  <div class="category-filter-title">Categories to include</div>
                  <div class="category-filter-grid">
                    <label
                      v-for="option in processingCategoryOptions"
                      :key="`advanced-${option.value}`"
                      class="category-checkbox"
                    >
                      <input
                        type="checkbox"
                        :value="option.value"
                        v-model="selectedAdvancedCategories"
                      />
                      <span>{{ option.label }}</span>
                    </label>
                  </div>
                </div>
              </v-col>
              <v-col cols="12" class="d-flex flex-wrap ga-2">
                <v-btn color="primary" :disabled="!hasFileB" @click="processCompare">Process</v-btn>
                <v-btn color="warning" :disabled="!canCompare" @click="store.compareAB()">Compare A vs B</v-btn>
              </v-col>
            </v-row>

            <v-progress-linear v-if="store.loading" indeterminate color="info" class="mt-2" />
            <v-alert v-if="store.loading" type="info" variant="tonal" density="comfortable" class="mt-2">
              System in process...
            </v-alert>
          </v-card-text>
        </v-card>

        <v-window v-model="activeTab">
          <v-window-item value="processing">
            <NormalizedTable
              title="Item List (A)"
              :rows="store.normalizedA"
              :disable-teamcraft-button="store.loading"
              @export-teamcraft="store.exportTeamcraft(store.normalizedA)"
            />
            <PriceTable
              :rows="store.priceRows"
              :loading="store.loading"
              :can-get-prices="canGetPricesA"
              v-model:remove-dye-for-pricing="store.removeDyeForPricing"
              v-model:margin-input="store.priceMarginInput"
              @get-prices="store.fetchPricesProcessing()"
              @export-price-csv="store.exportPricePlanCsv()"
            />
          </v-window-item>

          <v-window-item value="advanced">
            <NormalizedTable
              v-if="hasFileB"
              title="Item List (B)"
              :rows="store.normalizedB"
              :disable-teamcraft-button="store.loading"
              @export-teamcraft="store.exportTeamcraft(store.normalizedB)"
            />
            <DiffTable
              v-if="hasFileB"
              :result="store.compareResult"
              :disable-teamcraft-button="store.loading"
              @export-teamcraft-added="store.exportTeamcraft(store.compareResult.toAdd)"
            />
            <PriceTable
              :rows="store.priceRows"
              :loading="store.loading"
              :can-get-prices="canGetPricesCompare"
              v-model:remove-dye-for-pricing="store.removeDyeForPricing"
              v-model:margin-input="store.priceMarginInput"
              @get-prices="store.fetchPricesAdvanced()"
              @export-price-csv="store.exportPricePlanCsv()"
            />
          </v-window-item>
        </v-window>
      </section>
    </div>

    <footer class="page-footer">
      <img class="footer-logo" :src="kokoLogo" alt="Ko&Ko Workshop logo" />
      <p class="footer-text">This project is maintained by Ko&Ko Workshop.</p>
    </footer>

    <v-snackbar
      :model-value="!!store.notice"
      color="info"
      location="bottom right"
      timeout="2500"
      @update:model-value="onNoticeToggle"
    >
      {{ store.notice }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { computed, ref } from 'vue'
import FileUploadCard from '@/components/FileUploadCard.vue'
import NormalizedTable from '@/components/NormalizedTable.vue'
import DiffTable from '@/components/DiffTable.vue'
import PriceTable from '@/components/PriceTable.vue'
import { useMainStore } from '@/stores/useMainStore'
import kokoLogo from '@/assets/koko-bw-logo-v2.png'
import datacenters from '@/data/datacenter.json'

const store = useMainStore()
const fileAName = ref('')
const fileBName = ref('')
const activeTab = ref('processing')
const selectedRegion = ref('')
const selectedDatacenter = ref('')
const fileInputResetKey = ref(0)
const ALL_REGIONS_VALUE = '__ALL_REGIONS__'
const ALL_DATACENTERS_VALUE = '__ALL_DATACENTERS__'
const hasFileA = computed(() => !!store.rawA)
const hasFileB = computed(() => !!store.rawB)
const canGetPricesA = computed(() => store.normalizedA.length > 0)
const canGetPricesCompare = computed(() => store.compareResult.toAdd.length > 0)
const canCompare = computed(() => store.normalizedA.length > 0 && store.normalizedB.length > 0)
const processingCategoryOptions = [
  { label: 'Interior Furniture', value: 'interiorFurniture' },
  { label: 'Interior Fixture', value: 'interiorFixture' },
  { label: 'Exterior Fixture / House Walls', value: 'exteriorFixture' },
  { label: 'Exterior Furniture', value: 'exteriorFurniture' },
  { label: 'Dye', value: 'dye' }
]
const allProcessingCategoryValues = processingCategoryOptions.map((option) => option.value)
const selectedProcessingCategories = ref([...allProcessingCategoryValues])
const selectedAdvancedCategories = ref([...allProcessingCategoryValues])
const regionOptions = [
  { label: '--select region--', value: '' },
  { label: 'All regions', value: ALL_REGIONS_VALUE },
  ...[...new Set(datacenters.map((dc) => dc.region))].map((region) => ({ label: region, value: region }))
]

const filteredDatacenterOptions = computed(() => {
  const isAllRegions = selectedRegion.value === ALL_REGIONS_VALUE
  const datacenterItems = datacenters
    .filter((dc) => isAllRegions || dc.region === selectedRegion.value)
    .map((dc) => ({
      label: isAllRegions ? `${dc.datacenter} (${dc.region})` : dc.datacenter,
      value: dc.datacenter
    }))

  if (!selectedRegion.value) {
    return [{ label: '--select datacenter--', value: '' }]
  }

  return [
    { label: '--select datacenter--', value: '' },
    {
      label: isAllRegions ? 'All datacenters (all regions)' : 'All datacenters in region',
      value: ALL_DATACENTERS_VALUE
    },
    ...datacenterItems
  ]
})

const datacenterTargetsForCurrentRegion = computed(() => {
  if (!selectedRegion.value) {
    return []
  }

  if (selectedRegion.value === ALL_REGIONS_VALUE) {
    return datacenters.map((dc) => dc.datacenter)
  }

  return datacenters
    .filter((dc) => dc.region === selectedRegion.value)
    .map((dc) => dc.datacenter)
})

function onRegionSelect(value) {
  selectedRegion.value = value || ''
  selectedDatacenter.value = ''
  store.selectedServer = ''
  store.selectedMarketTargets = []
}

function processA() {
  if (!selectedRegion.value || !selectedDatacenter.value) {
    store.error = 'Please select both region and datacenter before processing.'
    return
  }

  if (selectedProcessingCategories.value.length === 0) {
    store.error = 'Please select at least one category before processing.'
    return
  }

  store.clearError()
  store.normalize('A', { includeSources: selectedProcessingCategories.value })
}

function processCompare() {
  if (!selectedRegion.value || !selectedDatacenter.value) {
    store.error = 'Please select both region and datacenter before processing.'
    return
  }

  if (selectedAdvancedCategories.value.length === 0) {
    store.error = 'Please select at least one category before processing.'
    return
  }

  store.clearError()
  const normalizeOptions = { includeSources: selectedAdvancedCategories.value }
  store.normalize('A', normalizeOptions)
  store.normalize('B', normalizeOptions)
}

async function onPickA(file) {
  fileAName.value = file.name
  await store.loadFile('A', file)
}

async function onPickB(file) {
  fileBName.value = file.name
  await store.loadFile('B', file)
}

function onServerSelect(value) {
  selectedDatacenter.value = value || ''

  if (!value) {
    store.selectedServer = ''
    store.selectedMarketTargets = []
    return
  }

  if (value === ALL_DATACENTERS_VALUE) {
    const targets = Array.from(new Set(datacenterTargetsForCurrentRegion.value))
    store.selectedMarketTargets = targets
    store.selectedServer = targets.length === 1 ? targets[0] : `All Datacenters (${targets.length})`
    return
  }

  store.selectedMarketTargets = [value]
  store.selectedServer = value
}

function resetPage() {
  fileAName.value = ''
  fileBName.value = ''
  activeTab.value = 'processing'
  selectedRegion.value = ''
  selectedDatacenter.value = ''
  selectedProcessingCategories.value = [...allProcessingCategoryValues]
  selectedAdvancedCategories.value = [...allProcessingCategoryValues]
  fileInputResetKey.value += 1
  store.resetState()
}

function onNoticeToggle(open) {
  if (!open) {
    store.clearNotice()
  }
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

.page-footer {
  margin-top: 16px;
  padding: 12px 0 6px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.footer-logo {
  height: 24px;
  width: auto;
  opacity: 0.9;
}

.footer-text {
  margin: 0;
  font-size: 13px;
  color: #b6c0d4;
}
</style>
