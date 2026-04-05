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
              <v-col cols="12" class="d-flex flex-wrap ga-2">
                <v-btn color="primary" @click="processA">Process</v-btn>
              </v-col>
            </v-row>

            <v-row v-if="activeTab === 'advanced'">
              <v-col cols="12">
                <FileUploadCard :key="`file-b-${fileInputResetKey}`" title="Import Second JSON (B)" :file-name="fileBName" @selected="onPickB" />
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
              @export-teamcraft-added="store.exportTeamcraft(store.compareResult.added)"
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
const hasFileA = computed(() => !!store.rawA)
const hasFileB = computed(() => !!store.rawB)
const canGetPricesA = computed(() => store.normalizedA.length > 0)
const canGetPricesCompare = computed(() => store.compareResult.added.length > 0)
const canCompare = computed(() => store.normalizedA.length > 0 && store.normalizedB.length > 0)
const regionOptions = [
  { label: '--select region--', value: '' },
  ...[...new Set(datacenters.map((dc) => dc.region))].map((region) => ({ label: region, value: region }))
]

const filteredDatacenterOptions = computed(() => {
  const datacenterItems = datacenters
    .filter((dc) => dc.region === selectedRegion.value)
    .map((dc) => ({
      label: dc.datacenter,
      value: dc.datacenter
    }))

  return [{ label: '--select datacenter--', value: '' }, ...datacenterItems]
})

function onRegionSelect(value) {
  selectedRegion.value = value || ''
  selectedDatacenter.value = ''
  store.selectedServer = ''
}

function processA() {
  if (!selectedRegion.value || !selectedDatacenter.value) {
    store.error = 'Please select both region and datacenter before processing.'
    return
  }

  store.clearError()
  store.normalize('A')
}

function processCompare() {
  if (!selectedRegion.value || !selectedDatacenter.value) {
    store.error = 'Please select both region and datacenter before processing.'
    return
  }

  store.clearError()
  store.normalize('A')
  store.normalize('B')
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
  store.selectedServer = value || ''
}

function resetPage() {
  fileAName.value = ''
  fileBName.value = ''
  activeTab.value = 'processing'
  selectedRegion.value = ''
  selectedDatacenter.value = ''
  fileInputResetKey.value += 1
  store.resetState()
}

function onNoticeToggle(open) {
  if (!open) {
    store.clearNotice()
  }
}
</script>
