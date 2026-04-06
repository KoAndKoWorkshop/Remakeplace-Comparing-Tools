<template>
  <v-app>
    <v-main>
      <RouterView />
    </v-main>
    <v-footer app class="app-footer" height="36">
      <div class="footer-content">Version {{ appVersion }}</div>
    </v-footer>
  </v-app>
</template>

<script setup>
import { version as appVersion } from '../package.json'
</script>

<style scoped>
.app-footer {
  border-top: 1px solid rgba(148, 163, 184, 0.35);
}

.footer-content {
  width: 100%;
  text-align: center;
  font-size: 12px;
  color: rgba(226, 232, 240, 0.9);
}
</style>
