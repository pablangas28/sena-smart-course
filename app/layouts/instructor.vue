<template>
  <v-app>
    <!-- ── SIDEBAR ── -->
    <v-navigation-drawer
      permanent
      color="#0a1628"
      width="185"
    >
      <!-- Logo SENA -->
      <div class="d-flex flex-column align-center pt-4 pb-2">
        <img src="/images/sena-sideBar.png" width="50" height="50" class="ma-5">
      </div>

      <v-divider class="mb-4"/>

      <!-- Navegación -->
      <v-list nav density="compact">
        <v-list-item
          v-for="item in navItems"
          :key="item.key"
          :to="item.to"
          rounded="lg"
          class="text-white text-center mb-2 nav-item"
          active-color="success"
        >
          <template #title>
            <span class="text-body-2 font-weight-semibold" style="white-space: pre-line;">{{ item.label }}</span>
          </template>
        </v-list-item>
      </v-list>

      <!-- Cerrar sesión al fondo -->
      <template #append>
        <div class="pa-3">
          <v-btn
            block
            color="success"
            rounded="lg"
            class="font-weight-bold"
            @click="auth.logout()"
          >
            Cerrar<br />Sesión
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- ── CONTENIDO ── -->
    <v-main>
      <!-- Barra superior oscura -->
      <v-app-bar color="#0a1628" elevation="0" height="60" />

      <!-- Área con fondo SENA -->
      <div class="sena-bg">
        <slot />
      </div>
    </v-main>
  </v-app>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()

const navItems = [
  { key: 'cursos',      label: 'Consultar\ncursos',      to: '/dashboard/instructor' },
  { key: 'estudiantes', label: 'Consultar\nestudiantes', to: '/dashboard/instructor/estudiantes' },
  { key: 'formulario',  label: 'Crear\nFormulario',      to: '/dashboard/instructor/formulario' },
]
</script>

<style scoped>
.sena-bg {
  min-height: 100%;
  background-image: url('/images/sena-bg.png');
  background-size: 50%;
  background-position: center;
  background-repeat: no-repeat;
}

.nav-item {
  background-color: #1a2d45 !important;
}

.nav-item:hover {
  background-color: #254060 !important;
}
</style>
