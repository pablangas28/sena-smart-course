const RUTAS_PUBLICAS = ['/', '/login', '/registro', '/acerca', '/error-rol']

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
  const rol         = auth.rol
  const dashboard   = ROL_DASHBOARD[rol]

  const esPublica      = RUTAS_PUBLICAS.includes(to.path) || to.path.startsWith('/inscripcion')
  const esDashboard    = to.path.startsWith('/dashboard')
  const esErrorRol     = to.path === '/error-rol'

  // Permitir siempre la página de error de rol
  if (esErrorRol) return

  // Regla 1: autenticado yendo a ruta pública → su dashboard
  // Si el rol no está mapeado, dejar pasar para que llegue a /error-rol
  if (autenticado && esPublica && !esErrorRol) {
    if (!dashboard) {
      // Rol desconocido → mostrar página de error
      return navigateTo('/error-rol')
    }
    return navigateTo(dashboard)
  }

  // Regla 2: ruta desconocida (ni pública ni dashboard)
  if (!esPublica && !esDashboard) {
    return navigateTo(autenticado ? (dashboard ?? '/error-rol') : '/login')
  }

  // Regla 3: dashboard sin sesión → login
  if (esDashboard && !autenticado) {
    return navigateTo('/login')
  }

  // Regla 4: dashboard con rol incorrecto → su propio dashboard
  if (esDashboard && autenticado) {
    if (!dashboard) {
      // Rol desconocido (ej: null, o un valor no mapeado)
      return navigateTo('/error-rol')
    }
    if (!to.path.startsWith(dashboard)) {
      return navigateTo(dashboard)
    }
  }
})