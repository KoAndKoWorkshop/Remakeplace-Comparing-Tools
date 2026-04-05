<template>
  <v-card class="mb-4" variant="tonal">
    <v-card-title>{{ title }}</v-card-title>
    <v-card-subtitle>Total quantity: {{ getTotalQuantity(rows) }}</v-card-subtitle>
    <v-card-text>
      <div class="actions-row mb-3">
        <v-btn
          color="secondary"
          :disabled="disableTeamcraftButton || rows.length === 0"
          @click="$emit('export-teamcraft')"
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
          <tr v-for="(row, index) in rows" :key="`${row.source}-${row.itemId}-${index}`">
            <td>{{ row.itemId }}</td>
            <td>{{ row.name }}</td>
            <td>{{ row.quantity }}</td>
          </tr>
          <tr v-if="rows.length === 0">
            <td colspan="3">No rows.</td>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>
  </v-card>
</template>

<script setup>
defineEmits(['export-teamcraft'])

function getTotalQuantity(items) {
  return items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
}

defineProps({
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
</script>

<style scoped>
.actions-row {
  display: flex;
  justify-content: flex-start;
}
</style>
