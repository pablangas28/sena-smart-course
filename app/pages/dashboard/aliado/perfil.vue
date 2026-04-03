<script setup>
import PerfilUsuario from '~/components/shared/PerfilUsuario.vue';

definePageMeta({ layout: 'aliado' })
</script>

<template>
  <div class="pa-6">
    <PerfilUsuario back-to="/dashboard/aliado" />
  </div>
</template>