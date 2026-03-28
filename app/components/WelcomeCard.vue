<template>
  <v-card rounded="xl" elevation="12" color="secondary" class="pa-8 text-center" width="480" height="300">
    <h2 class="text-h5 font-weight-bold text-white mb-2">¡Bienvenido!</h2>
    <p class="text-blue-grey-lighten-2 mb-6">Selecciona una opción para continuar</p>

    <v-btn
      block
      color="primary"
      size="large"
      rounded="lg"
      class="text-h6 font-weight-bold mb-3"
      to="/login2"
    >
      Iniciar Sesión
    </v-btn>

    <v-btn
      block
      color="primary"
      size="large"
      rounded="lg"
      class="text-h6 font-weight-bold"
      to="/registro"
    >
      Registrarse
    </v-btn>
  </v-card>
</template>
