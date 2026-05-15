export default defineNuxtPlugin(async () => {
  const auth  = useAuthStore()
  const route = useRoute()

  const rutasSinRestaurar = ['/login', '/registro']
  if (rutasSinRestaurar.some(r => route.path.startsWith(r))) return

  if (auth.token && !auth.user) {
    await auth.fetchMe()
  }
})