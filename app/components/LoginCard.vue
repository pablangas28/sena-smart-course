<script setup>

defineProps({
  documento: { type: String, default: '' },
  password:  { type: String, default: '' },
  loading:   { type: Boolean, default: false },
  error:     { type: String, default: '' },
})

defineEmits(['update:documento', 'update:password', 'submit', 'clear-error'])

const showPass = ref(false)
</script>


<template>
  <v-card rounded="xl" elevation="16" color="#0a1628" class="pa-8" width="350" height="450">
    <v-form>
    <!-- Título + línea verde -->
    <div class="text-center mb-8">
      <h2 class="text-h4 font-weight-bold text-white mb-3">Bienvenido</h2>
      <div style="width:56px; height:4px; background:#39A900; border-radius:2px; margin:0 auto;" />
    </div>

    <!-- Alerta error -->
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

    <!-- Campo Usuario -->
    <div class="custom-input mb-4">
      <v-icon color="#39A900" size="22">mdi-account</v-icon>
      <v-text-field 
        :model-value="documento" 
        placeholder="Documento"
        class="input-field"
        variant="plain"
        hide-details=""
        :disabled="loading"
        @update:modelValue="$emit('update:documento', $event)"
        @keyup.enter="$emit('submit')"
        clearable/>
    </div>

    <!-- Campo Contraseña -->
    <div class="custom-input mb-6">
      <v-icon color="#39A900" size="22">mdi-lock</v-icon>
      <input
        :value="password"
        :type="showPass ? 'text' : 'password'"
        placeholder="Contraseña"
        class="input-field"
        :disabled="loading"
        @input="$emit('update:password', $event.target.value)"
        @keyup.enter="$emit('submit')" />
      <v-icon
        color="grey"
        size="20"
        style="cursor:pointer; flex-shrink:0;"
        @click="showPass = !showPass"
      >
        {{ showPass ? 'mdi-eye-off' : 'mdi-eye' }}
      </v-icon>
    </div>

    <!-- Botón Ingresar -->
    <div class="d-flex justify-center mb-6">
      <v-btn
        color="#39A900"
        rounded="lg"
        size="large"
        :loading="loading"
        :disabled="!documento || !password"
        class="px-12 font-weight-bold"
        @click="$emit('submit')"
      >
        Ingresar
      </v-btn>
    </div>

    <!-- Link registro -->
    <div class="text-right">
      <span class="text-white text-body-2">¿No tienes usuario?</span><br />
      <nuxt-link to="/registro" class="text-white text-body-2 text-decoration-none">Crear usuario</nuxt-link><br />
      <nuxt-link to="/registro" class="text-white text-body-2 text-decoration-none">Instructor/Aliado</nuxt-link>
    </div>
    </v-form>
  </v-card>
</template>


<style scoped>
.custom-input {
  display: flex;
  align-items: center;
  background: #3F6378;
  border-radius: 10px;
  padding: 14px 16px;
  gap: 12px;
}

.input-field {

  background: transparent;
  border: none;
  outline: none;
  color: #c8d8e8;
  font-size: 1rem;
  caret-color: #4caf50;
}

.input-field::placeholder {
  color: #7fa3c0;
}
</style>
