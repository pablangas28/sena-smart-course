<script setup>
import { ref, reactive } from 'vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'default' })

const auth = useAuthStore()
const router = useRouter()

const form = reactive({ documento: '', password: '' })
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  if (!form.documento || !form.password) return

  loading.value = true
  error.value = ''

  // Simulamos delay de red — se reemplaza cuando conectemos Laravel
  await new Promise(resolve => setTimeout(resolve, 1000))

  const { ok, route } = auth.login(form.documento, form.password)

  if (ok) {
    router.push(route)
  } else {
    error.value = 'Documento o contraseña incorrectos.'
  }

  loading.value = false
}
</script>


<template>
  <div class="d-flex align-center justify-center" style="min-height: calc(100vh - 64px);">
    <LoginCard
      v-model:documento="form.documento"
      v-model:password="form.password"
      :loading="loading"
      :error="error"
      @submit="handleLogin"
      @clear-error="error = ''"
    />
  </div>
</template>

