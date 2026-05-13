<template>
  <v-card class="mb-4" variant="tonal">
    <v-card-title class="card-title-row">
      <span>Compare Result (New A vs Old B)</span>
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

        <div class="section-header">
          <h4>
            Need to Add ({{ result.toAdd.length }}) - Total quantity: {{ getTotalQuantity(result.toAdd, 'quantity') }}
            <span v-if="result.toAdd.length"> | Selected: {{ selectedToAddRows.length }}</span>
          </h4>
          <v-btn
            color="secondary"
            size="small"
            :disabled="disableTeamcraftButton || selectedToAddRows.length === 0"
            @click="$emit('export-teamcraft-added')"
          >
            Export Teamcraft
          </v-btn>
        </div>
        <v-table density="compact" class="table-wrap">
            <thead>
              <tr>
                <th class="select-col">Select</th>
                <th>Id</th>
                <th>Name</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in result.toAdd" :key="`a-${row.itemId}-${index}`">
                <td class="select-col">
                  <input
                    type="checkbox"
                    :checked="isToAddSelected(row, index)"
                    @change="onToggleToAdd(row, index, $event.target.checked)"
                  />
                </td>
                <td>{{ row.itemId }}</td>
                <td>{{ row.name }}</td>
                <td>{{ row.quantity }}</td>
              </tr>
              <tr v-if="result.toAdd.length === 0"><td colspan="4">No items to add.</td></tr>
            </tbody>
        </v-table>

        <h4>Removed ({{ result.removed.length }}) - Total quantity: {{ getTotalQuantity(result.removed, 'quantity') }}</h4>
        <v-table density="compact" class="table-wrap">
            <thead>
              <tr>
                <th>Id</th>
                <th>Name</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in result.removed" :key="`r-${row.itemId}-${index}`">
                <td>{{ row.itemId }}</td>
                <td>{{ row.name }}</td>
                <td>{{ row.quantity }}</td>
              </tr>
              <tr v-if="result.removed.length === 0"><td colspan="3">No removed items.</td></tr>
            </tbody>
        </v-table>

        </v-card-text>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const emit = defineEmits(['export-teamcraft-added', 'update:selected-to-add-rows'])

const props = defineProps({
  result: {
    type: Object,
    default: () => ({
      added: [],
      removed: [],
      quantityChanged: [],
      toAdd: []
    })
  },
  disableTeamcraftButton: {
    type: Boolean,
    default: false
  }
})

const selectedToAddKeys = ref([])
const isExpanded = ref(true)

const selectedToAddRows = computed(() => {
  const keySet = new Set(selectedToAddKeys.value)
  const toAddRows = Array.isArray(props.result?.toAdd) ? props.result.toAdd : []
  return toAddRows.filter((row, index) => keySet.has(getToAddKey(row, index)))
})

watch(
  () => props.result?.toAdd,
  (toAddRows) => {
    const safeRows = Array.isArray(toAddRows) ? toAddRows : []
    selectedToAddKeys.value = safeRows.map((row, index) => getToAddKey(row, index))
  },
  { immediate: true }
)

watch(
  selectedToAddRows,
  (rows) => {
    emit('update:selected-to-add-rows', rows)
  },
  { immediate: true }
)

function getToAddKey(row, index) {
  return `${row?.itemId || ''}|${row?.receiptId || ''}|${row?.name || ''}|${index}`
}

function isToAddSelected(row, index) {
  return selectedToAddKeys.value.includes(getToAddKey(row, index))
}

function onToggleToAdd(row, index, checked) {
  const key = getToAddKey(row, index)
  if (checked) {
    if (!selectedToAddKeys.value.includes(key)) {
      selectedToAddKeys.value = [...selectedToAddKeys.value, key]
    }
    return
  }

  selectedToAddKeys.value = selectedToAddKeys.value.filter((entry) => entry !== key)
}

function toggleExpanded() {
  isExpanded.value = !isExpanded.value
}

function getTotalQuantity(items, key) {
  return items.reduce((sum, item) => sum + Number(item[key] || 0), 0)
}
</script>

<style scoped>
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.section-header h4 {
  margin: 0;
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

.select-col {
  width: 70px;
}
</style>
