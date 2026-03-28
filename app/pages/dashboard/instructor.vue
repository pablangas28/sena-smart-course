<template>
  <div class="pa-8">
    <InstructorActionCards
      :nombre="auth.user?.nombre"
      @action="handleAction"
    />
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'instructor' })

const auth = useAuthStore()
const router = useRouter()

// Protección de ruta — si no está autenticado o no es instructor, fuera
if (!auth.isAuthenticated || auth.user?.rol !== 'instructor') {
  router.push('/login')
}

function handleAction(key) {
  // Aquí irá la navegación a cada sección cuando las construyamos
  const routes = {
    cursos:      '/dashboard/instructor/cursos',
    estudiantes: '/dashboard/instructor/estudiantes',
    formulario:  '/dashboard/instructor/formulario',
  }
  router.push(routes[key])
}
</script>
