import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Mapa de rutas según el rol devuelto por la API
const ROLE_ROUTES = {
  coordinador: '/dashboard/coordinador',
  instructor:  '/dashboard/instructor',
  aliado:      '/dashboard/aliado',
  estudiante:  '/dashboard/estudiante',
}

export const useAuthStore = defineStore('auth', () => {
  // ── Estado ────────────────────────────────────────────────────────────────
  const token = useCookie('token', {
    maxAge:   60 * 60 * 8,  // 8 horas
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

  /**
   * Inicia sesión contra POST /login
   * @param {string} email
   * @param {string} password
   * @returns {{ ok: boolean, route: string|null, message: string|null }}
   */
  async function login(email, password) {
    const { apiFetch } = useApi()

    try {
      const data = await apiFetch('/login', {
        method: 'POST',
        body:   { email, password },
      })

      // La API devuelve: { token: '...', user: { id, nombre, apellidos, rol, regional } }
      token.value = data.token
      user.value  = data.user

      const route = ROLE_ROUTES[data.user.rol] ?? '/'
      return { ok: true, route, message: null }

    } catch (err) {
      // $fetch lanza error con statusCode en err.response
      const status  = err?.response?.status
      const message = err?.response?._data?.message

      if (status === 401) return { ok: false, route: null, message: 'Correo o contraseña incorrectos.' }
      if (status === 403) return { ok: false, route: null, message: 'Tu cuenta está inactiva. Contactá al coordinador.' }

      return { ok: false, route: null, message: message ?? 'Error de conexión. Intenta de nuevo.' }
    }
  }

  /**
   * Cierra sesión: llama POST /logout para invalidar el token en el servidor
   * y limpia el estado local.
   */
  async function logout() {
    const { apiFetch } = useApi()

    try {
      await apiFetch('/logout', { method: 'POST' })
    } catch (_) {
      // Si falla (ej: token ya expirado), igual limpiamos local
    } finally {
      token.value = null
      user.value  = null
      await navigateTo('/login')
    }
  }

  /**
   * Recarga los datos del usuario desde GET /me.
   * Útil al montar el app para restaurar sesión desde la cookie.
   */
  async function fetchMe() {
    if (!token.value) return

    const { apiFetch } = useApi()

    try {
      const data = await apiFetch('/me')
      user.value = data
    } catch (_) {
      // Token inválido o expirado → limpiar
      token.value = null
      user.value  = null
    }
  }

  /**
   * Cambia la contraseña del usuario autenticado.
   * @returns {{ ok: boolean, message: string }}
   */
  async function cambiarPassword(passwordActual, passwordNuevo, passwordNuevoConfirmation) {
    const { apiFetch } = useApi()

    try {
      const data = await apiFetch('/cambiar-password', {
        method: 'POST',
        body: {
          password_actual:              passwordActual,
          password_nuevo:               passwordNuevo,
          password_nuevo_confirmation:  passwordNuevoConfirmation,
        },
      })
      return { ok: true, message: data.message }
    } catch (err) {
      const message = err?.response?._data?.message ?? 'No se pudo cambiar la contraseña.'
      return { ok: false, message }
    }
  }

  return {
    // Estado
    token,
    user,
    // Getters
    isAuthenticated,
    rol,
    nombreCompleto,
    // Acciones
    login,
    logout,
    fetchMe,
    cambiarPassword,
  }
})