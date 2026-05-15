<script setup>
defineProps({
  email: { type: String, default: '' },
  password: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
})

defineEmits(['update:email', 'update:password', 'submit', 'clear-error'])

const showPass = ref(false)
</script>

<template>
  <v-card rounded="xl" elevation="16" color="#0a1628" class="pa-8" width="350" height="450">
    <v-form>
      
      <!-- Header -->
      <div class="text-center mb-8">
        <h2 class="zoom-text text-h4 font-weight-bold text-white mb-3">Bienvenido/a</h2>
        <div class="line" />
      </div>

      <!-- Error -->
      <v-alert
        v-if="error"
        type="error"
        variant="tonal"
        rounded="lg"
        closable
        class="mb-4"
        @click:close="$emit('clear-error')"
      >
        {{ error }}
      </v-alert>

      <!-- Email -->
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
        clearable
      />

      <!-- Password -->
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
        clearable
      />

      <!-- Button -->
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

      <!-- Links -->
      <div class="text-right">
        <span class="text-white text-body-2">¿No tienes usuario?</span><br />
        <nuxt-link to="/registro" class="link">Crear usuario</nuxt-link><br />
        <nuxt-link to="/registro" class="link">Instructor/Aliado</nuxt-link>
      </div>

    </v-form>
  </v-card>
</template>

<style scoped>
.line {
  width: 56px;
  height: 4px;
  background: #39A900;
  border-radius: 2px;
  margin: 0 auto;
}

/* Ajuste fino del input */
.custom-field :deep(.v-field) {
  color: white;
}

/* Placeholder */
.custom-field :deep(input::placeholder) {
  color: #7fa3c0;
}

/* Texto */
.custom-field :deep(input) {
  color: #c8d8e8;
}

.custom-field :deep(.v-field__prepend-inner .v-icon) {
  color: #39A900;
}

.custom-field :deep(.v-field__append-inner .v-icon) {
  color: #d8d8d8;
}

/* Links */
.link {
  color: white;
  text-decoration: none;
}

/* Zoom por hover */
.zoom-text {
  display: inline-block;
  transition: transform 0.2s ease;
}

.zoom-text:hover {
  transform: scale(1.5);
}
</style>