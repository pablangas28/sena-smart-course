<script setup>
// Ruta pública — NO requiere autenticación
// El estudiante llega desde el link compartido por instructor/aliado

import { ref, reactive, computed } from 'vue'

definePageMeta({
  layout: 'default',
  hideNavbar: true
})

const route    = useRoute()
const router   = useRouter()
const config   = useRuntimeConfig()
const token    = route.params.token

// ── Estado ────────────────────────────────────────────────────────────────
const formulario  = ref(null)   // datos del formulario (GET)
const loading     = ref(true)
const enviando    = ref(false)
const error       = ref('')
const errorForm   = ref('')
const exito       = ref(false)
const showPass    = ref(false)
const paso        = ref(1)       // 1: datos personales, 2: contacto, 3: confirmación

const form = reactive({
  nombre:                   '',
  apellidos:                '',
  email:                    '',
  password:                 '',
  fecha_nacimiento:         '',
  genero:                   '',
  celular:                  '',
  telefono:                 '',
  cel_contacto_emergencia:  '',
  tel_contacto_emergencia:  '',
  pantallazo_sofia:         null,  // File
})

// ── Cargar formulario ─────────────────────────────────────────────────────
onMounted(async () => {
  try {
    const data = await $fetch(`${config.public.apiBase}/inscripcion/${token}`, {
      headers: { Accept: 'application/json' },
    })
    formulario.value = data
  } catch (err) {
    const status = err?.response?.status
    if (status === 403) error.value = 'Este formulario ya no está disponible o ha expirado.'
    else if (status === 404) error.value = 'Formulario no encontrado. Verifica el link.'
    else error.value = 'No se pudo cargar el formulario. Intenta de nuevo.'
  } finally {
    loading.value = false
  }
})

// ── Validación por paso ───────────────────────────────────────────────────
const paso1Valido = computed(() =>
  form.nombre && form.apellidos && form.email &&
  form.password && form.fecha_nacimiento && form.genero
)
const paso2Valido = computed(() =>
  form.celular && form.cel_contacto_emergencia
)

// ── Enviar inscripción ────────────────────────────────────────────────────
async function inscribirse() {
  errorForm.value = ''
  enviando.value  = true

  try {
    // Multipart/form-data para poder subir pantallazo_sofia
    const formData = new FormData()
    formData.append('nombre',                  form.nombre)
    formData.append('apellidos',               form.apellidos)
    formData.append('email',                   form.email)
    formData.append('password',                form.password)
    formData.append('fecha_nacimiento',        form.fecha_nacimiento)
    formData.append('genero',                  form.genero)
    formData.append('celular',                 form.celular)
    formData.append('cel_contacto_emergencia', form.cel_contacto_emergencia)
    if (form.telefono) formData.append('telefono', form.telefono)
    if (form.tel_contacto_emergencia) formData.append('tel_contacto_emergencia', form.tel_contacto_emergencia)
    if (form.pantallazo_sofia) formData.append('pantallazo_sofia', form.pantallazo_sofia)

    const resultado = await $fetch(`${config.public.apiBase}/inscripcion/${token}`, {
      method:  'POST',
      body:    formData,
      headers: { Accept: 'application/json' },
      // NO incluir Content-Type — el browser lo pone solo con el boundary correcto
    })

    // Guardar token en cookie y redirigir al dashboard del estudiante
    const cookieToken = useCookie('token', { maxAge: 60 * 60 * 8, sameSite: 'lax' })
    cookieToken.value = resultado.token

    // Esperar un tick para que la cookie esté disponible
    exito.value = true
    setTimeout(() => router.push('/dashboard/estudiante'), 2500)

  } catch (err) {
    const data = err?.response?._data
    if (data?.errors) {
      // Errores de validación Laravel
      const msgs = Object.values(data.errors).flat()
      errorForm.value = msgs[0]
    } else {
      errorForm.value = data?.message ?? 'No se pudo completar el registro. Intenta de nuevo.'
    }
    paso.value = 1
  } finally {
    enviando.value = false
  }
}

function handleFilePick(e) {
  const file = e.target.files?.[0]
  if (file) form.pantallazo_sofia = file
}
</script>

<template>
  <div class="d-flex align-center justify-center pa-4" style="min-height: calc(100vh - 64px);">
    <div style="width:100%; max-width: 600px;">

      <!-- Loading -->
      <div v-if="loading" class="text-center pa-12">
        <v-progress-circular indeterminate color="#39A900" size="48" />
        <p class="text-body-2 text-grey mt-4">Cargando formulario...</p>
      </div>

      <!-- Error al cargar -->
      <v-card v-else-if="error" rounded="xl" elevation="0" color="#0a1628" class="pa-8 text-center">
        <v-icon size="64" color="error" class="mb-4">mdi-alert-circle-outline</v-icon>
        <h2 class="text-h6 font-weight-bold text-white mb-2">Formulario no disponible</h2>
        <p class="text-body-2 mb-6" style="color:rgba(255,255,255,0.6)">{{ error }}</p>
        <v-btn color="#39A900" rounded="lg" to="/">Volver al inicio</v-btn>
      </v-card>

      <!-- Éxito -->
      <v-card v-else-if="exito" rounded="xl" elevation="0" color="rgba(200,215,200,0.8)" class="pa-8 text-center">
        <v-avatar color="#39A900" size="72" class="mb-4">
          <v-icon color="white" size="40">mdi-check-circle</v-icon>
        </v-avatar>
        <h2 class="text-h5 font-weight-bold mb-2">¡Registro exitoso!</h2>
        <p class="text-body-1 text-grey-darken-1 mb-2">
          Bienvenido al curso <strong>{{ formulario?.curso?.nombre }}</strong>
        </p>
        <p class="text-body-2 text-grey">Redirigiendo a tu dashboard...</p>
        <v-progress-linear indeterminate color="#39A900" rounded class="mt-4" />
      </v-card>

      <!-- Formulario -->
      <template v-else-if="formulario">
        <!-- Header del curso -->
        <v-card rounded="xl" elevation="0" color="#0a1628" class="pa-5 mb-4">
          <div class="d-flex align-center ga-3">
            <v-avatar color="rgba(57,169,0,0.2)" size="48">
              <v-icon color="#39A900" size="24">mdi-book-education-outline</v-icon>
            </v-avatar>
            <div>
              <div class="text-white font-weight-bold text-body-1">
                {{ formulario.curso?.nombre }}
              </div>
              <div class="text-caption" style="color:rgba(255,255,255,0.55)">
                {{ formulario.curso?.regional?.nombre }} ·
                Inscripción abierta
              </div>
            </div>
          </div>
        </v-card>

        <!-- Card del formulario -->
        <v-card rounded="xl" elevation="0" color="rgba(200,215,200,0.65)" class="pa-6" style="backdrop-filter:blur(4px)">

          <!-- Stepper visual -->
          <div class="d-flex align-center ga-2 mb-6">
            <div v-for="p in 3" :key="p" class="d-flex align-center ga-2 flex-grow-1">
              <div class="step-dot" :class="{ active: paso >= p, done: paso > p }">
                <v-icon v-if="paso > p" size="14" color="white">mdi-check</v-icon>
                <span v-else class="text-caption font-weight-bold">{{ p }}</span>
              </div>
              <div v-if="p < 3" class="step-line" :class="{ active: paso > p }" />
            </div>
          </div>

          <v-alert v-if="errorForm" type="error" variant="tonal" rounded="lg" class="mb-4" closable @click:close="errorForm=''">
            {{ errorForm }}
          </v-alert>

          <!-- ── Paso 1: Datos personales ─────────────────────────── -->
          <div v-if="paso === 1">
            <h3 class="text-body-1 font-weight-bold mb-4">Datos personales</h3>
            <v-row dense>
              <v-col cols="12" sm="6">
                <v-text-field v-model="form.nombre" label="Nombre *" variant="outlined" rounded="lg" density="comfortable" bg-color="white" />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="form.apellidos" label="Apellidos *" variant="outlined" rounded="lg" density="comfortable" bg-color="white" />
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="form.email" label="Correo electrónico *" type="email" variant="outlined" rounded="lg" density="comfortable" bg-color="white" />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="form.password" label="Contraseña *"
                  :type="showPass ? 'text' : 'password'"
                  variant="outlined" rounded="lg" density="comfortable" bg-color="white"
                  hint="Mínimo 8 caracteres"
                  :append-inner-icon="showPass ? 'mdi-eye-off' : 'mdi-eye'"
                  @click:append-inner="showPass = !showPass"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="form.fecha_nacimiento" label="Fecha de nacimiento *" type="date" variant="outlined" rounded="lg" density="comfortable" bg-color="white" />
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="form.genero" label="Género *"
                  :items="[{title:'Masculino',value:'masculino'},{title:'Femenino',value:'femenino'},{title:'Otro',value:'otro'}]"
                  variant="outlined" rounded="lg" density="comfortable" bg-color="white"
                />
              </v-col>
            </v-row>
            <v-btn
              block color="#39A900" rounded="lg" size="large" class="mt-2"
              :disabled="!paso1Valido"
              @click="paso = 2"
            >
              Continuar
            </v-btn>
          </div>

          <!-- ── Paso 2: Contacto ─────────────────────────────────── -->
          <div v-else-if="paso === 2">
            <h3 class="text-body-1 font-weight-bold mb-4">Información de contacto</h3>
            <v-row dense>
              <v-col cols="12" sm="6">
                <v-text-field v-model="form.celular" label="Celular *" variant="outlined" rounded="lg" density="comfortable" bg-color="white" prepend-inner-icon="mdi-cellphone" />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="form.telefono" label="Teléfono fijo (opcional)" variant="outlined" rounded="lg" density="comfortable" bg-color="white" prepend-inner-icon="mdi-phone" />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="form.cel_contacto_emergencia" label="Celular de emergencia *" variant="outlined" rounded="lg" density="comfortable" bg-color="white" prepend-inner-icon="mdi-phone-alert" />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="form.tel_contacto_emergencia" label="Teléfono emergencia (opcional)" variant="outlined" rounded="lg" density="comfortable" bg-color="white" prepend-inner-icon="mdi-phone-outline" />
              </v-col>
              <v-col cols="12">
                <div class="text-body-2 font-weight-medium mb-2">
                  Pantallazo SOFIA Plus (opcional)
                </div>
                <v-card rounded="lg" elevation="0" class="pa-3" color="white" style="border: 1px dashed rgba(0,0,0,0.2)">
                  <div class="d-flex align-center ga-3">
                    <v-icon color="#39A900">mdi-image-plus</v-icon>
                    <div class="flex-grow-1">
                      <div class="text-body-2">{{ form.pantallazo_sofia?.name ?? 'Seleccionar imagen o PDF (máx. 2MB)' }}</div>
                    </div>
                    <v-btn size="small" variant="tonal" color="#39A900" rounded="lg" @click="$refs.fileInput.click()">
                      Seleccionar
                    </v-btn>
                    <input ref="fileInput" type="file" accept="image/*,.pdf" class="d-none" @change="handleFilePick" />
                  </div>
                </v-card>
              </v-col>
            </v-row>

            <div class="d-flex ga-3 mt-4">
              <v-btn variant="text" rounded="lg" size="large" @click="paso = 1">Atrás</v-btn>
              <v-btn
                color="#39A900" rounded="lg" size="large" class="flex-grow-1"
                :disabled="!paso2Valido"
                @click="paso = 3"
              >
                Revisar
              </v-btn>
            </div>
          </div>

          <!-- ── Paso 3: Confirmación ──────────────────────────────── -->
          <div v-else-if="paso === 3">
            <h3 class="text-body-1 font-weight-bold mb-4">Confirmar datos</h3>

            <v-card rounded="lg" elevation="0" color="white" class="pa-4 mb-4">
              <div class="d-flex flex-column ga-2 text-body-2">
                <div class="d-flex justify-space-between">
                  <span class="text-grey">Nombre</span>
                  <span class="font-weight-medium">{{ form.nombre }} {{ form.apellidos }}</span>
                </div>
                <v-divider />
                <div class="d-flex justify-space-between">
                  <span class="text-grey">Correo</span>
                  <span class="font-weight-medium">{{ form.email }}</span>
                </div>
                <v-divider />
                <div class="d-flex justify-space-between">
                  <span class="text-grey">Fecha nacimiento</span>
                  <span class="font-weight-medium">{{ form.fecha_nacimiento }}</span>
                </div>
                <v-divider />
                <div class="d-flex justify-space-between">
                  <span class="text-grey">Género</span>
                  <span class="font-weight-medium text-capitalize">{{ form.genero }}</span>
                </div>
                <v-divider />
                <div class="d-flex justify-space-between">
                  <span class="text-grey">Celular</span>
                  <span class="font-weight-medium">{{ form.celular }}</span>
                </div>
                <v-divider />
                <div class="d-flex justify-space-between">
                  <span class="text-grey">Contacto emergencia</span>
                  <span class="font-weight-medium">{{ form.cel_contacto_emergencia }}</span>
                </div>
                <div v-if="form.pantallazo_sofia">
                  <v-divider class="mb-2" />
                  <div class="d-flex justify-space-between">
                    <span class="text-grey">SOFIA</span>
                    <span class="font-weight-medium text-success">
                      <v-icon size="14">mdi-check</v-icon> {{ form.pantallazo_sofia.name }}
                    </span>
                  </div>
                </div>
              </div>
            </v-card>

            <p class="text-caption text-grey mb-4">
              Al inscribirte aceptas que tus datos serán usados por el SENA para la gestión del curso.
            </p>

            <div class="d-flex ga-3">
              <v-btn variant="text" rounded="lg" size="large" @click="paso = 2">Atrás</v-btn>
              <v-btn
                color="#39A900" rounded="lg" size="large" class="flex-grow-1"
                :loading="enviando"
                @click="inscribirse"
              >
                Confirmar inscripción
              </v-btn>
            </div>
          </div>

        </v-card>
      </template>

    </div>
  </div>
</template>

<style scoped>
.step-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(0,0,0,0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #999;
  font-size: 12px;
  transition: background 0.3s;
}
.step-dot.active { background: #39A900; color: white; }
.step-dot.done   { background: #39A900; color: white; }

.step-line {
  flex-grow: 1;
  height: 2px;
  background: rgba(0,0,0,0.12);
  border-radius: 1px;
  transition: background 0.3s;
}
.step-line.active { background: #39A900; }
</style>