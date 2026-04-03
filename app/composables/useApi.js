export const useApi = () => {
  const config = useRuntimeConfig()
  const token  = useCookie('token')

  const apiFetch = async (url, options = {}, retries = 2) => {
    // FormData no lleva Content-Type (el browser pone el boundary solo)
    const isFormData = options.body instanceof FormData

    try {
      return await $fetch(config.public.apiBase + url, {
        ...options,
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          ...(!isFormData && { 'Content-Type': 'application/json' }),
          ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
          ...options.headers,
        },
      })
    } catch (err) {
      const status = err?.response?.status

      // Token expirado → limpiar sesión y mandar al login
      if (status === 401) {
        token.value = null
        const auth = useAuthStore()
        auth.user = null
        await navigateTo('/login')
        return
      }

      // Sin permisos → relanzar con mensaje claro
      if (status === 403) {
        const e = new Error('Sin permisos para esta acción.')
        e.status = 403
        throw e
      }

      // Error de red → reintento automático
      const isNetworkError =
        err?.name === 'FetchError' ||
        err?.message?.includes('Failed to fetch')

      if (retries > 0 && isNetworkError) {
        console.warn(`Reintentando... (${retries})`)
        await new Promise(res => setTimeout(res, 1000))
        return apiFetch(url, options, retries - 1)
      }

      // Sin internet
      if (!navigator.onLine) throw new Error('SIN_INTERNET')

      throw err
    }
  }

  return { apiFetch }
}