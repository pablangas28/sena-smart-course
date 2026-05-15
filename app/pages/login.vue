<script setup>
import { ref, reactive } from 'vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'default' })

const auth = useAuthStore()

const form    = reactive({ email: '', password: '' })
const loading = ref(false)
const error   = ref('')

async function handleLogin() {
  if (!form.email || !form.password) return

  loading.value = true
  error.value   = ''

  const { ok, route, message } = await auth.login(form.email, form.password)

  if (ok) {
    await navigateTo(route, { replace: true })
  } else {
    error.value   = message
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
      @submit="handleLogin"
      @clear-error="error = ''"
    />
  </div>
</template>