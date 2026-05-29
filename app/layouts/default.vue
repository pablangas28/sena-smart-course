<script setup>
  import { ref } from 'vue'

  const drawer = ref(false)
  const route = useRoute()

</script>

<template>
  <v-app>
    <!-- ── NAVBAR ── -->
    <v-app-bar color="#001826" elevation="2" height="64" v-if="!route.meta.hideNavbar">
      <v-app-bar-title>
        <span class="text-white font-weight-bold text-h6">Sena Smart Course</span>
      </v-app-bar-title>

      <template #append>
        <!-- Hamburguesa móvil -->
        <v-app-bar-nav-icon
          class="d-flex d-sm-none text-white"
          @click="drawer = !drawer"
        />

        <!-- Links desktop -->
        <div class="d-none d-sm-flex align-center text-white">
          <v-btn variant="text" color="white" prepend-icon="mdi-home"  to="/">Inicio</v-btn>
          <v-btn variant="text" color="white" prepend-icon="mdi-login"  to="/login">Iniciar sesión</v-btn>
          <v-btn variant="text" color="white" prepend-icon="mdi-account-plus" to="/registro">Registrarse</v-btn>
          <v-btn variant="text" color="white" prepend-icon="mdi-information"  to="/acerca">Acerca de</v-btn>
        </div>
      </template>
    </v-app-bar>

    <!-- Drawer móvil -->
    <v-navigation-drawer v-model="drawer" temporary color="#0a1628">
      <v-list>
        <v-list-item prepend-icon="mdi-home"         title="Inicio"         to="/"        class="text-white" @click="drawer = false" />
        <v-list-item prepend-icon="mdi-login"        title="Iniciar sesión" to="/login"   class="text-white" @click="drawer = false" />
        <v-list-item prepend-icon="mdi-account-plus" title="Registrarse"    to="/registro" class="text-white" @click="drawer = false" />
        <v-list-item prepend-icon="mdi-information"  title="Acerca de"      to="/acerca"  class="text-white" @click="drawer = false" />
      </v-list>
    </v-navigation-drawer>

    <!-- ── CONTENIDO con fondo SENA ── -->
    <v-main>
      <div class="sena-bg">
        <slot />
      </div>
      <app-footer/>
    </v-main>
  </v-app>
</template>


<style>
.sena-bg {
  background-image: url('/images/sena-bg.pngn');
  background-size: 50%;
  background-position: center;
  background-repeat: no-repeat;
}

</style>
