// stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const ROLE_ROUTES = {
  coordinador: '/dashboard/coordinador',
  instructor:  '/dashboard/instructor',
  aliado:      '/dashboard/aliado',
  estudiante:  '/dashboard/estudiante',
}

export const useAuthStore = defineStore('auth', () => {
  // ── Estado ────────────────────────────────────────────────────────────────
  const token = useCookie('token', {
    maxAge:   60 * 60 * 8,
    sameSite: 'lax',
  })
  const user = ref(null)

  // ── Getters ───────────────────────────────────────────────────────────────
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const rol             = computed(() => user.value?.rol ?? null)
  const nombreCompleto  = computed(() =>
    user.value ? `${user.value.nombre} ${user.value.apellidos ?? ''}`.trim() : ''
  )

  // ── Actions ───────────────────────────────────────────────────────────────

  async function login(email, password) {
    const { apiFetch } = useApi()
    token.value = null
    user.value  = null

    try {
      const data = await apiFetch('/login', {
        method: 'POST',
        body:   { email, password },
      })
      token.value = data.token
      user.value  = data.user

      const route = ROLE_ROUTES[data.user.rol] ?? '/error-rol'
      return { ok: true, route, message: null }

    } catch (err) {
      token.value = null
      user.value  = null

      const status  = err?.response?.status
      const message = err?.response?._data?.message

      if (status === 401) return { ok: false, route: null, message: 'Correo o contraseña incorrectos.' }
      if (status === 403) return { ok: false, route: null, message: 'Tu cuenta está inactiva. Contactá al coordinador.' }
      return { ok: false, route: null, message: message ?? 'Error de conexión. Intenta de nuevo.' }
    }
  }

  async function logout() {
    const { apiFetch } = useApi()
    try {
      await apiFetch('/logout', { method: 'POST' })
    } catch (_) {
    } finally {
      token.value = null
      user.value  = null
      await navigateTo('/login')
    }
  }

  async function fetchMe() {
    if (!token.value) return

    const { apiFetch } = useApi()
    try {
      const data = await apiFetch('/me')
      // Verificar que el rol devuelto es válido antes de asignarlo
      if (data && data.rol) {
        user.value = data
      } else {
        // Respuesta inválida → limpiar
        token.value = null
        user.value  = null
      }
    } catch (_) {
      token.value = null
      user.value  = null
    }
  }

  async function cambiarPassword(passwordActual, passwordNuevo, passwordNuevoConfirmation) {
    const { apiFetch } = useApi()
    try {
      const data = await apiFetch('/cambiar-password', {
        method: 'POST',
        body: {
          password_actual:             passwordActual,
          password_nuevo:              passwordNuevo,
          password_nuevo_confirmation: passwordNuevoConfirmation,
        },
      })
      return { ok: true, message: data.message }
    } catch (err) {
      const message = err?.response?._data?.message ?? 'No se pudo cambiar la contraseña.'
      return { ok: false, message }
    }
  }

  return {
    token, user,
    isAuthenticated, rol, nombreCompleto,
    login, logout, fetchMe, cambiarPassword,
  }
})