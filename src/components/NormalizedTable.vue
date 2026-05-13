<template>
  <v-card class="mb-4" variant="tonal">
    <v-card-title class="card-title-row">
      <span>{{ title }}</span>
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
        <v-card-subtitle>
          Total quantity: {{ getTotalQuantity(rows) }}
          <span v-if="rows.length"> | Selected: {{ selectedRows.length }}</span>
        </v-card-subtitle>
        <v-card-text>
          <div class="actions-row mb-3">
            <v-btn
              color="secondary"
              :disabled="disableTeamcraftButton || selectedRows.length === 0"
              @click="$emit('export-teamcraft')"
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
              <tr v-for="(row, index) in rows" :key="`${row.source}-${row.itemId}-${index}`">
                <td class="select-col">
                  <input
                    type="checkbox"
                    :checked="isSelected(row, index)"
                    @change="onToggleRow(row, index, $event.target.checked)"
                  />
                </td>
                <td>{{ row.itemId }}</td>
                <td>{{ row.name }}</td>
                <td>{{ row.quantity }}</td>
              </tr>
              <tr v-if="rows.length === 0">
                <td colspan="4">No rows.</td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const emit = defineEmits(['export-teamcraft', 'update:selected-rows'])

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  rows: {
    type: Array,
    default: () => []
  },
  disableTeamcraftButton: {
    type: Boolean,
    default: false
  }
})

const selectedRowKeys = ref([])
const isExpanded = ref(true)

const selectedRows = computed(() => {
  const keySet = new Set(selectedRowKeys.value)
  return props.rows.filter((row, index) => keySet.has(getRowKey(row, index)))
})

watch(
  () => props.rows,
  (rows) => {
    selectedRowKeys.value = rows.map((row, index) => getRowKey(row, index))
  },
  { immediate: true }
)

watch(
  selectedRows,
  (rows) => {
    emit('update:selected-rows', rows)
  },
  { immediate: true }
)

function getRowKey(row, index) {
  return `${row?.source || ''}|${row?.itemId || ''}|${row?.receiptId || ''}|${row?.name || ''}|${index}`
}

function isSelected(row, index) {
  return selectedRowKeys.value.includes(getRowKey(row, index))
}

function onToggleRow(row, index, checked) {
  const key = getRowKey(row, index)
  if (checked) {
    if (!selectedRowKeys.value.includes(key)) {
      selectedRowKeys.value = [...selectedRowKeys.value, key]
    }
    return
  }

  selectedRowKeys.value = selectedRowKeys.value.filter((entry) => entry !== key)
}

function toggleExpanded() {
  isExpanded.value = !isExpanded.value
}

function getTotalQuantity(items) {
  return items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
}
</script>

<style scoped>
.actions-row {
  display: flex;
  justify-content: flex-start;
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
