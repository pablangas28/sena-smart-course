import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// ─── Usuarios quemados para pruebas ─────────────────────────────────────────
const FAKE_USERS = [
  {
    documento: '123',
    password: 'sena20',
    nombre: 'Instructor',
    rol: 'instructor',
  },
]

// ─── Rutas por rol ───────────────────────────────────────────────────────────
const ROLE_ROUTES = {
  instructor: '/dashboard/instructor',
  admin:      '/dashboard/admin',
  aliado:     '/dashboard/aliado',
}
// ────────────────────────────────────────────────────────────────────────────

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)

  const isAuthenticated = computed(() => !!user.value)

  function login(documento, password) {
    const found = FAKE_USERS.find(
      u => u.documento === documento && u.password === password
    )

    if (found) {
      user.value = {
        documento: found.documento,
        nombre:    found.nombre,
        rol:       found.rol,
      }
      return { ok: true, route: ROLE_ROUTES[found.rol] ?? '/' }
    }

    return { ok: false, route: null }
  }

  function logout() {
    user.value = null
    navigateTo('/')
  }

  return { user, isAuthenticated, login, logout }
})
