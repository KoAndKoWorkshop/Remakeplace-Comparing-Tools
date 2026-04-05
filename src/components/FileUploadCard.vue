<template>
  <v-card class="mb-4" variant="tonal">
    <v-card-title>{{ title }}</v-card-title>
    <v-card-text>
      <v-file-input
        accept="application/json"
        label="Choose JSON file"
        prepend-icon="mdi-file"
        density="comfortable"
        variant="outlined"
        @update:model-value="onChange"
      />
      <div class="upload-name">{{ fileName || 'No file selected' }}</div>
    </v-card-text>
  </v-card>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['selected'])

function onChange(value) {
  const file = Array.isArray(value) ? value[0] : value
  if (file) {
    emit('selected', file)
  }
}
</script>

<style scoped>
.upload-name {
  margin-top: 6px;
  font-size: 13px;
  color: #9aa3b7;
}
</style>
