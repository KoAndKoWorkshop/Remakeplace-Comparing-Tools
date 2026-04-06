<template>
  <v-card class="mb-4" variant="tonal">
    <v-card-title>Compare Result (A vs B)</v-card-title>
    <v-card-text>

    <div class="section-header">
      <h4>Need to Add ({{ result.toAdd.length }}) - Total quantity: {{ getTotalQuantity(result.toAdd, 'quantity') }}</h4>
      <v-btn
        color="secondary"
        size="small"
        :disabled="disableTeamcraftButton || result.toAdd.length === 0"
        @click="$emit('export-teamcraft-added')"
      >
        Export Teamcraft
      </v-btn>
    </div>
    <v-table density="compact" class="table-wrap">
        <thead>
          <tr>
            <th>Id</th>
            <th>Name</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in result.toAdd" :key="`a-${row.itemId}-${index}`">
            <td>{{ row.itemId }}</td>
            <td>{{ row.name }}</td>
            <td>{{ row.quantity }}</td>
          </tr>
          <tr v-if="result.toAdd.length === 0"><td colspan="3">No items to add.</td></tr>
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
  </v-card>
</template>

<script setup>
defineEmits(['export-teamcraft-added'])

function getTotalQuantity(items, key) {
  return items.reduce((sum, item) => sum + Number(item[key] || 0), 0)
}

defineProps({
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
</style>
