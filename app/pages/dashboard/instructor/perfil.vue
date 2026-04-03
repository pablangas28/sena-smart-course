<script setup>
import PerfilUsuario from '~/components/shared/PerfilUsuario.vue';
definePageMeta({ layout: 'instructor' })
</script>

<template>
  <div class="pa-6">
    <PerfilUsuario back-to="/dashboard/instructor" />
  </div>
</template>