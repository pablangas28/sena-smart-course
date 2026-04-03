// middleware/auth.global.js
// ─────────────────────────────────────────────────────────────────────────────
// Reglas:
//  1. Autenticado + ruta pública (/login, /, /registro) → su dashboard
//  2. Ruta desconocida → dashboard si autenticado, /login si no
//  3. /dashboard/* sin sesión → /login
//  4. /dashboard/* con rol incorrecto → su propio dashboard
// ─────────────────────────────────────────────────────────────────────────────

const RUTAS_PUBLICAS = ['/', '/login', '/registro', '/acerca']

const ROL_DASHBOARD = {
  coordinador: '/dashboard/coordinador',
  instructor:  '/dashboard/instructor',
  aliado:      '/dashboard/aliado',
  estudiante:  '/dashboard/estudiante',
}

export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore()

  // Restaurar sesión desde cookie si hay token pero no user en memoria
  if (auth.token && !auth.user) {
    await auth.fetchMe()
  }

  const autenticado = auth.isAuthenticated
  const dashboard   = ROL_DASHBOARD[auth.rol]
  const esPublica   = RUTAS_PUBLICAS.includes(to.path) || to.path.startsWith('/inscripcion')
  const esDashboard = to.path.startsWith('/dashboard')

  // Regla 1: autenticado yendo a ruta pública → su dashboard
  if (autenticado && esPublica) {
    return navigateTo(dashboard ?? '/dashboard/instructor')
  }

  // Regla 2: ruta desconocida (ni pública ni dashboard)
  if (!esPublica && !esDashboard) {
    return navigateTo(autenticado ? (dashboard ?? '/') : '/login')
  }

  // Regla 3: dashboard sin sesión → login
  if (esDashboard && !autenticado) {
    return navigateTo('/login')
  }

  // Regla 4: dashboard con rol incorrecto → su propio dashboard
  if (esDashboard && autenticado && dashboard && !to.path.startsWith(dashboard)) {
    return navigateTo(dashboard)
  }
})