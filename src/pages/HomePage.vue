<template>
  <v-container class="page-wrap">
    <div class="workspace-layout">
      <aside class="left-pane">
        <v-card variant="tonal">
          <v-card-text>
            <img class="brand-logo" :src="kokoLogo" alt="Ko&Ko Workshop logo" />
            <h1 class="left-title">Ko&Ko Workshop Tools</h1>

            <FileUploadCard
              :key="`file-a-${fileInputResetKey}`"
              title="Import New Design JSON (A)"
              :file-name="fileAName"
              @selected="onPickA"
            />

            <div class="datacenter-filter-wrap mb-2">
              <div class="datacenter-filter-title">Datacenters by region</div>
              <div class="datacenter-region-list">
                <div v-for="group in datacenterGroups" :key="group.region" class="datacenter-region-group">
                  <div class="datacenter-region-title">{{ group.region }}</div>
                  <div class="datacenter-grid">
                    <label
                      v-for="datacenter in group.datacenters"
                      :key="`${group.region}-${datacenter}`"
                      class="datacenter-checkbox"
                    >
                      <input
                        type="checkbox"
                        :value="datacenter"
                        v-model="selectedDatacenters"
                        @change="onDatacenterSelectionChange"
                      />
                      <span>{{ datacenter }}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <v-btn v-if="hasFileA" block color="error" variant="outlined" class="mt-2" @click="resetPage">
              Reset All
            </v-btn>

            <v-alert v-if="hasFileA" type="success" variant="tonal" density="comfortable" class="mt-2">
              New design file (A) loaded: {{ fileAName }}
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

            <ProcessingTab
              v-if="activeTab === 'processing'"
              :category-options="processingCategoryOptions"
              v-model:selected-categories="selectedProcessingCategories"
              :normalized-rows="store.normalizedA"
              :price-rows="store.priceRows"
              :no-price-rows="store.noPriceRows"
              :loading="store.loading"
              :can-get-prices="canGetPricesA"
              v-model:remove-dye-for-pricing="store.removeDyeForPricing"
              v-model:margin-input="store.priceMarginInput"
              @process="processA"
              @export-teamcraft="onExportTeamcraftProcessing"
              @get-prices="onGetPricesProcessing"
              @export-price-csv="store.exportPricePlanCsv()"
            />

            <AdvancedTab
              v-if="activeTab === 'advanced'"
              :file-input-reset-key="fileInputResetKey"
              :file-b-name="fileBName"
              :has-file-b="hasFileB"
              :category-options="processingCategoryOptions"
              v-model:selected-categories="selectedAdvancedCategories"
              :can-compare="canCompare"
              :normalized-b="store.normalizedB"
              :compare-result="store.compareResult"
              :price-rows="store.priceRows"
              :no-price-rows="store.noPriceRows"
              :loading="store.loading"
              :can-get-prices-b="canGetPricesB"
              :can-get-prices-compare="canGetPricesCompare"
              v-model:price-mode="advancedPriceMode"
              v-model:remove-dye-for-pricing="store.removeDyeForPricing"
              v-model:margin-input="store.priceMarginInput"
              @pick-b="onPickB"
              @process="processCompare"
              @compare="store.compareAB()"
              @export-teamcraft-b="onExportTeamcraftB"
              @export-teamcraft-added="onExportTeamcraftAdded"
              @get-prices-b="onGetPricesAdvancedB"
              @get-prices-compare="onGetPricesAdvancedCompare"
              @export-price-csv="store.exportPricePlanCsv()"
            />

            <v-progress-linear v-if="store.loading" indeterminate color="info" class="mt-2" />
            <v-alert v-if="store.loading" type="info" variant="tonal" density="comfortable" class="mt-2">
              System in process...
            </v-alert>
          </v-card-text>
        </v-card>

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
import ProcessingTab from '@/components/ProcessingTab.vue'
import AdvancedTab from '@/components/AdvancedTab.vue'
import { useMainStore } from '@/stores/useMainStore'
import kokoLogo from '@/assets/koko-bw-logo-v2.png'
import datacenters from '@/data/datacenter.json'

const store = useMainStore()
const fileAName = ref('')
const fileBName = ref('')
const activeTab = ref('processing')
const selectedDatacenters = ref([])
const fileInputResetKey = ref(0)
const advancedPriceMode = ref('compare')
const hasFileA = computed(() => !!store.rawA)
const hasFileB = computed(() => !!store.rawB)
const hasSelectedDatacenter = computed(() => selectedDatacenters.value.length > 0)
const canGetPricesA = computed(() => store.normalizedA.length > 0 && hasSelectedDatacenter.value)
const canGetPricesB = computed(() => store.normalizedB.length > 0 && hasSelectedDatacenter.value)
const canGetPricesCompare = computed(() => store.compareResult.toAdd.length > 0 && hasSelectedDatacenter.value)
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
const datacenterGroups = computed(() => {
  const groupedMap = new Map()

  for (const entry of datacenters) {
    if (!groupedMap.has(entry.region)) {
      groupedMap.set(entry.region, [])
    }

    groupedMap.get(entry.region).push(entry.datacenter)
  }

  return Array.from(groupedMap.entries()).map(([region, groupedDatacenters]) => ({
    region,
    datacenters: groupedDatacenters
  }))
})

function onDatacenterSelectionChange() {
  const targets = Array.from(new Set(selectedDatacenters.value))

  store.selectedMarketTargets = targets

  if (targets.length === 0) {
    store.selectedServer = ''
    return
  }

  if (targets.length === 1) {
    store.selectedServer = targets[0]
    return
  }

  store.selectedServer = `Selected Datacenters (${targets.length})`
}

function processA() {
  if (selectedProcessingCategories.value.length === 0) {
    store.error = 'Please select at least one category before processing.'
    return
  }

  store.clearError()
  store.normalize('A', { includeSources: selectedProcessingCategories.value })
}

function processCompare() {
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

function resetPage() {
  fileAName.value = ''
  fileBName.value = ''
  activeTab.value = 'processing'
  selectedDatacenters.value = []
  advancedPriceMode.value = 'compare'
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

function onExportTeamcraftProcessing(selectedRows) {
  store.exportTeamcraft(selectedRows)
}

function onGetPricesProcessing(selectedRows) {
  store.fetchPricesProcessing(selectedRows)
}

function onExportTeamcraftB(selectedRows) {
  store.exportTeamcraft(selectedRows)
}

function onExportTeamcraftAdded(selectedRows) {
  store.exportTeamcraft(selectedRows)
}

function onGetPricesAdvancedB(selectedRows) {
  store.fetchPricesAdvancedB(selectedRows)
}

function onGetPricesAdvancedCompare(selectedRows) {
  store.fetchPricesAdvancedCompare(selectedRows)
}
</script>

<style scoped>
.datacenter-filter-wrap {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 10px 12px;
}

.datacenter-filter-title {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
}

.datacenter-region-list {
  display: grid;
  gap: 8px;
}

.datacenter-region-group {
  padding-top: 2px;
}

.datacenter-region-title {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.02em;
  margin-bottom: 4px;
}

.datacenter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 4px 10px;
}

.datacenter-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 14px;
  line-height: 1.2;
  cursor: pointer;
}

.datacenter-checkbox input[type='checkbox'] {
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
