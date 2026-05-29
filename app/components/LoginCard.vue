<script setup>
import VueRecaptcha from 'vue3-recaptcha2'

defineProps({
  email: { type: String, default: '' },
  password: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  sitekey: { type: String, required: true },
})

defineEmits(['update:email', 'update:password', 'submit', 'clear-error', 'verify', 'expire'])

const showPass = ref(false)
</script>

<template>
  <v-card rounded="xl" elevation="16" color="#0a1628" class="pa-8" width="350" height="550">
    <v-form>
      
      <div class="text-center mb-6">
        <h2 class="zoom-text text-h4 font-weight-bold text-white mb-3">Bienvenido/a</h2>
        <div class="line" />
      </div>

      <v-alert
        v-if="error"
        type="error"
        variant="tonal"
        rounded="lg"
        closable
        class="mb-4"
        style="font-size: 0.8rem;"
        @click:close="$emit('clear-error')"
      >
        {{ error }}
      </v-alert>

      <v-text-field
        :model-value="email"
        placeholder="Email"
        prepend-inner-icon="mdi-account"
        variant="solo-filled"
        bg-color="#3F6378"
        rounded="lg"
        class="mb-4 custom-field"
        hide-details
        :disabled="loading"
        @update:modelValue="$emit('update:email', $event)"
        @keyup.enter="$emit('submit')"
      />

      <v-text-field
        :model-value="password"
        :type="showPass ? 'text' : 'password'"
        placeholder="Contraseña"
        prepend-inner-icon="mdi-lock"
        :append-inner-icon="showPass ? 'mdi-eye-off' : 'mdi-eye'"
        @click:append-inner="showPass = !showPass"
        variant="solo-filled"
        bg-color="#3F6378"
        rounded="lg"
        class="mb-6 custom-field"
        hide-details
        :disabled="loading"
        @update:modelValue="$emit('update:password', $event)"
        @keyup.enter="$emit('submit')"
      />

      <div class="d-flex justify-center mb-6">
        <VueRecaptcha
          :sitekey="sitekey"
          size="normal"
          theme="dark"
          @verify="(token) => $emit('verify', token)"
          @expire="() => $emit('expire')"
        />
      </div>

      <div class="d-flex justify-center mb-6">
        <v-btn
          color="#39A900"
          rounded="lg"
          size="large"
          :loading="loading"
          :disabled="!email || !password"
          class="px-12 font-weight-bold"
          @click="$emit('submit')"
        >
          Ingresar
        </v-btn>
      </div>

      <v-divider />
      <div class="text-right mt-4">
        <span class="text-white text-body-2">¿No tienes usuario?</span><br />
        <nuxt-link to="/registro" class="link">Crear usuario</nuxt-link><br />
      </div>

    </v-form>
  </v-card>
</template>

<style scoped>
/* Mantén tus estilos actuales aquí... */
.line { width: 56px; height: 4px; background: #39A900; border-radius: 2px; margin: 0 auto; }
.custom-field :deep(.v-field) { color: white; }
.link { color: white; text-decoration: none; }
</style>