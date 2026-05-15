<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'

const auth   = useAuthStore()
const drawer = ref(false)

const navItems = [
  { key: 'inicio',   label: 'Mis Cursos',  icon: 'mdi-book-open-outline',         to: '/dashboard/estudiante' },
  { key: 'perfil',   label: 'Mi Perfil',   icon: 'mdi-account-circle-outline',     to: '/dashboard/estudiante/perfil' },
]

const iniciales = computed(() => {
  const parts = `${auth.user?.nombre ?? ''} ${auth.user?.apellidos ?? ''}`.trim().split(' ')
  return parts.map(p => p[0]).slice(0, 2).join('').toUpperCase()
})
</script>

<template>
  <v-app>

    <!-- Top navbar principal -->
    <v-app-bar color="#0a1628" elevation="2" height="64">
      <template #prepend>
        <div class="d-flex align-center pl-4">
          <img src="/images/sena-sideBar.png" width="36" height="36" class="mr-3" />
          <span class="text-white font-weight-bold text-body-1 d-none d-sm-block">SmartCourse</span>
        </div>
      </template>

      <!-- Links desktop -->
      <div class="d-none d-sm-flex align-center ml-4 ga-1">
        <v-btn
          v-for="item in navItems"
          :key="item.key"
          :to="item.to"
          variant="text"
          color="white"
          :prepend-icon="item.icon"
          size="small"
          rounded="lg"
          active-color="#39A900"
        >
          {{ item.label }}
        </v-btn>
      </div>

      <v-spacer />

      <template #append>
        <!-- Avatar + nombre desktop -->
        <div class="d-none d-sm-flex align-center ga-3 mr-4">
          <div class="text-right">
            <div class="text-white text-body-2 font-weight-medium">{{ auth.user?.nombre }}</div>
            <div class="text-caption" style="color:rgba(255,255,255,0.5)">Aprendiz</div>
          </div>
          <v-avatar color="#39A900" size="36" class="text-white font-weight-bold text-body-2" style="cursor:pointer;" @click="navigateTo('/dashboard/estudiante/perfil')">
            {{ iniciales }}
          </v-avatar>
          <v-btn icon variant="text" color="rgba(255,255,255,0.6)" size="small" @click="auth.logout()">
            <v-icon>mdi-logout</v-icon>
          </v-btn>
        </div>

        <!-- Hamburguesa móvil -->
        <v-app-bar-nav-icon class="d-flex d-sm-none text-white" @click="drawer = !drawer" />
      </template>
    </v-app-bar>

    <!-- Drawer móvil -->
    <v-navigation-drawer v-model="drawer" temporary color="#0a1628">
      <div class="pa-4">
        <div class="d-flex align-center ga-3 mb-4 pt-2">
          <v-avatar color="#39A900" size="44" class="text-white font-weight-bold">{{ iniciales }}</v-avatar>
          <div>
            <div class="text-white font-weight-semibold">{{ auth.user?.nombre }} {{ auth.user?.apellidos }}</div>
            <div class="text-caption" style="color:rgba(255,255,255,0.5)">Aprendiz / Estudiante</div>
          </div>
        </div>
        <v-divider color="rgba(255,255,255,0.1)" class="mb-3" />
        <v-list nav density="compact" class="pa-0">
          <v-list-item
            v-for="item in navItems"
            :key="item.key"
            :to="item.to"
            :prepend-icon="item.icon"
            rounded="lg"
            active-color="#39A900"
            class="nav-item mb-1"
            @click="drawer = false"
          >
            <template #title>
              <span class="text-body-2 font-weight-medium">{{ item.label }}</span>
            </template>
          </v-list-item>
        </v-list>
        <v-divider color="rgba(255,255,255,0.1)" class="my-3" />
        <v-btn block variant="tonal" color="error" rounded="lg" prepend-icon="mdi-logout" size="small" @click="auth.logout()">
          Cerrar sesión
        </v-btn>
      </div>
    </v-navigation-drawer>

    <v-main>
      <div class="sena-bg">
        <slot />
      </div>
    </v-main>
  </v-app>
</template>

<style scoped>
.sena-bg {
  min-height: calc(100vh - 64px);
  background-image: url('/images/sena-bg.png');
  background-size: 40%;
  background-position: center;
  background-repeat: no-repeat;
}
.nav-item { color: rgba(255,255,255,0.65) !important; }
.nav-item:hover { background-color: rgba(255,255,255,0.06) !important; }
.v-list-item--active.nav-item { background-color: rgba(57,169,0,0.15) !important; color: #39A900 !important; }
</style>