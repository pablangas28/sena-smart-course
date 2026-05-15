<script setup>
// pages/error-rol.vue
// Se muestra cuando el usuario está autenticado pero su rol no está mapeado
// en el sistema (ej: rol nulo, rol inválido en BD, etc.)

definePageMeta({ layout: 'default' })

const auth = useAuthStore()
</script>

<template>
  <div class="d-flex align-center justify-center pa-6" style="min-height: calc(100vh - 64px);">
    <v-card
      rounded="xl"
      elevation="0"
      color="#0a1628"
      class="pa-10 text-center"
      style="max-width: 520px; width: 100%;"
    >
      <v-icon size="72" color="warning" class="mb-5">mdi-account-alert-outline</v-icon>

      <h2 class="text-h5 font-weight-bold text-white mb-3">
        Rol no reconocido
      </h2>

      <p class="text-body-2 mb-2" style="color: rgba(255,255,255,0.65);">
        Tu cuenta está activa pero el rol asignado
        <span v-if="auth.user?.rol">
          (<strong style="color:#f9a825">"{{ auth.user.rol }}"</strong>)
        </span>
        no corresponde a ningún perfil de la plataforma.
      </p>

      <p class="text-body-2 mb-6" style="color: rgba(255,255,255,0.5);">
        Esto puede ocurrir si la cuenta fue creada manualmente o si hay un error en la
        asignación del rol. Comunícate con el coordinador de tu regional para que corrija tu perfil.
      </p>

      <!-- Info del usuario actual -->
      <v-card
        v-if="auth.user"
        rounded="lg"
        color="rgba(255,255,255,0.06)"
        class="pa-4 mb-6 text-left"
      >
        <div class="text-caption mb-2" style="color:rgba(255,255,255,0.4)">DATOS DE LA SESIÓN ACTUAL</div>
        <div class="text-body-2 text-white">{{ auth.user.nombre }} {{ auth.user.apellidos }}</div>
        <div class="text-caption" style="color:rgba(255,255,255,0.5)">{{ auth.user.email }}</div>
        <div class="text-caption mt-1" style="color:#f9a825">
          Rol: {{ auth.user.rol ?? 'no definido' }}
        </div>
      </v-card>

      <div class="d-flex flex-column ga-3">
        <v-btn
          color="#39A900"
          rounded="lg"
          size="large"
          block
          @click="auth.logout()"
        >
          Cerrar sesión
        </v-btn>
        <v-btn
          variant="text"
          color="grey"
          rounded="lg"
          size="small"
          to="/acerca"
        >
          ¿Necesitas ayuda? Ver información del sistema
        </v-btn>
      </div>
    </v-card>
  </div>
</template>