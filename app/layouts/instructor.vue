<script setup>
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'

const auth   = useAuthStore()
const drawer = ref(true)

const navItems = [
  { key: 'cursos',      label: 'Mis Cursos',       icon: 'mdi-book-education-outline', to: '/dashboard/instructor' },
  { key: 'estudiantes', label: 'Estudiantes',       icon: 'mdi-account-group-outline',  to: '/dashboard/instructor/estudiantes' },
  { key: 'formulario',  label: 'Nuevo Formulario',  icon: 'mdi-file-document-plus-outline', to: '/dashboard/instructor/formulario' },
  { key: 'perfil',  label: 'Mi Perfil',  icon: 'mdi-account-circle-outline', to: '/dashboard/instructor/perfil' },
]

// Inicial del nombre para el avatar
const iniciales = computed(() => {
  if (!auth.user) return '?'
  const parts = `${auth.user.nombre} ${auth.user.apellidos ?? ''}`.trim().split(' ')
  return parts.map(p => p[0]).slice(0, 2).join('').toUpperCase()
})
</script>

<template>
  <v-app>
    <!-- ── SIDEBAR ─────────────────────────────────────────────────────── -->
    <v-navigation-drawer
      v-model="drawer"
      permanent
      color="#0a1628"
      width="220"
    >
      <!-- Logo SENA -->
      <div class="d-flex align-center justify-center pt-5 pb-3">
        <img src="/images/sena-sideBar.png" width="48" height="48" />
      </div>

      <div class="text-center text-white text-caption font-weight-bold tracking-widest mb-2 opacity-50">
        SMARTCOURSE
      </div>

      <v-divider color="rgba(255,255,255,0.1)" class="mb-4" />

      <!-- Perfil del usuario logueado -->
      <div class="px-4 mb-5">
        <v-card
          rounded="xl"
          color="rgba(255,255,255,0.06)"
          class="pa-3 d-flex align-center ga-3"
          flat
          :to="'/dashboard/instructor/perfil'"
          style="cursor:pointer;"
        >
          <v-avatar color="#39A900" size="40" class="font-weight-bold text-white flex-shrink-0">
            {{ iniciales }}
          </v-avatar>
          <div class="overflow-hidden">
            <div class="text-white text-body-2 font-weight-semibold text-truncate">
              {{ auth.user?.nombre }} {{ auth.user?.apellidos }}
            </div>
            <v-chip
              color="#39A900"
              size="x-small"
              rounded="lg"
              class="font-weight-bold text-uppercase mt-1"
            >
              {{ auth.user?.rol }}
            </v-chip>
          </div>
        </v-card>
      </div>

      <!-- Navegación -->
      <div class="px-3">
        <div class="text-white text-caption font-weight-bold mb-2 px-2 opacity-40 tracking-widest">
          MENÚ
        </div>
        <v-list nav density="compact" class="pa-0">
          <v-list-item
            v-for="item in navItems"
            :key="item.key"
            :to="item.to"
            :prepend-icon="item.icon"
            :title="item.title"
            rounded="lg"
            active-color="#39A900"
            class="nav-item mb-1"
          >
            <template #title>
              <span class="text-body-2 font-weight-medium">{{ item.label }}</span>
            </template>
          </v-list-item>
        </v-list>
      </div>

      <!-- Pie: regional + cerrar sesión -->
      <template #append>
        <div class="px-4 pb-4">
          <!-- Regional -->
          <div
            v-if="auth.user?.regional"
            class="d-flex align-center ga-2 px-2 mb-3 text-caption text-white opacity-40"
          >
            <v-icon size="14">mdi-map-marker-outline</v-icon>
            <span class="text-truncate">{{ auth.user.regional.nombre }}</span>
          </div>

          <v-divider color="rgba(255,255,255,0.1)" class="mb-3" />

          <v-btn
            block
            variant="tonal"
            color="error"
            rounded="lg"
            prepend-icon="mdi-logout"
            size="small"
            @click="auth.logout()"
          >
            Cerrar sesión
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- ── MAIN ────────────────────────────────────────────────────────── -->
    <v-main>
      <!-- Top bar -->
      <v-app-bar color="#0a1628" elevation="0" height="56" border="b">
        <template #prepend>
          <v-app-bar-nav-icon
            color="white"
            @click="drawer = !drawer"
          />
        </template>
        <v-app-bar-title>
          <span class="text-white text-body-1 font-weight-semibold">
            Gestión de Cursos Complementarios
          </span>
        </v-app-bar-title>
        <template #append>
          <v-chip
            color="rgba(57,169,0,0.15)"
            text-color="#39A900"
            size="small"
            class="mr-3 font-weight-bold"
            prepend-icon="mdi-circle"
          >
            En línea
          </v-chip>
        </template>
      </v-app-bar>

      <!-- Contenido de la página -->
      <div class="sena-bg page-content">
        <slot />
      </div>
    </v-main>
  </v-app>
</template>

<style scoped>
.sena-bg {
  min-height: calc(100vh - 56px);
  background-image: url('/images/sena-bg.png');
  background-size: 40%;
  background-position: center;
  background-repeat: no-repeat;
}

.page-content {
  padding: 0;
}

.nav-item {
  color: rgba(255, 255, 255, 0.65) !important;
  transition: background 0.2s;
}

.nav-item:hover {
  background-color: rgba(255,255,255,0.06) !important;
  color: white !important;
}

.v-list-item--active.nav-item {
  background-color: rgba(57, 169, 0, 0.15) !important;
  color: #39A900 !important;
}

.tracking-widest {
  letter-spacing: 0.12em;
}

.opacity-40 {
  opacity: 0.4;
}

.opacity-50 {
  opacity: 0.5;
}
</style>