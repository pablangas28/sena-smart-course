<script setup>
import PerfilUsuario from '~/components/shared/PerfilUsuario.vue';
definePageMeta({ layout: 'estudiante' })
</script>

<template>
  <div class="pa-6">
    <PerfilUsuario back-to="/dashboard/estudiante" />
  </div>
</template>