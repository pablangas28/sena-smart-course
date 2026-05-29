<script setup>
import { ref, reactive } from 'vue'
import { useAuthStore } from '~/stores/auth'
import VueRecaptcha from 'vue3-recaptcha2'

definePageMeta({ layout: 'default' })

const auth = useAuthStore()
const config = useRuntimeConfig()

const siteKey = config.public.recaptchaSiteKey

const form    = reactive({ email: '', password: '' })
const loading = ref(false)
const error   = ref('')
const recaptchaToken = ref('')
function onVerify(token) {
  recaptchaToken.value = token
}
function onExpired() {
  recaptchaToken.value = ''
}

async function handleLogin() {
  if (!form.email || !form.password) return
  if (!recaptchaToken.value) {
    error.value = 'Por favor, confirma que no eres un robot marcando la casilla de seguridad.'
    return
  }

  loading.value = true
  error.value   = ''

  try {
    const { ok, route, message } = await auth.login(form.email, form.password, recaptchaToken.value)

    if (ok) {
      await navigateTo(route, { replace: true })
    } else {
      error.value   = message
      loading.value = false
    }
  } catch (err) {
    console.error("Error en login:", err)
    error.value = 'Ocurrió un error inesperado al validar la seguridad.'
    loading.value = false
  }
}
</script>

<template>
  <div class="d-flex align-center justify-center" style="min-height: calc(100vh - 64px);">
    
    <LoginCard
      v-model:email="form.email"
      v-model:password="form.password"
      :loading="loading"
      :error="error"
      :sitekey="siteKey" 
      @submit="handleLogin"
      @clear-error="error = ''"
      @verify="onVerify"
      @expire="onExpired"
    />

  </div>
</template>