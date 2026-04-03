export default defineNuxtPlugin(async () => {
  const auth = useAuthStore()

  // Solo actuar si hay token pero user no está en memoria
  if (auth.token && !auth.user) {
    await auth.fetchMe()
  }
})