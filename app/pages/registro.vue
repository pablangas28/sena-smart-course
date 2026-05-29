<script setup>
import { ref } from 'vue'

definePageMeta({ layout: 'default' })

const token    = ref('')
const router   = useRouter()
const config   = useRuntimeConfig()
const loading  = ref(false)
const error    = ref('')

async function verificarToken() {
  if (!token.value.trim()) return
  loading.value = true
  error.value   = ''
  try {
    // Verificar que el formulario existe y está activo
    await $fetch(`${config.public.apiBase}/inscripcion/${token.value.trim()}`, {
      headers: { Accept: 'application/json' },
    })
    router.push(`/inscripcion/${token.value.trim()}`)
  } catch (err) {
    const status = err?.response?.status
    if (status === 403) error.value = 'Este formulario ya no está disponible o ha expirado.'
    else if (status === 404) error.value = 'El código ingresado no es válido. Verifica el link que te enviaron.'
    else error.value = 'No se pudo verificar el código. Intenta de nuevo.'
  } finally {
    loading.value = false
  }
}

// Extraer token si pegan el link completo
function limpiarToken() {
  const val = token.value.trim()
  if (val.includes('/inscripcion/')) {
    token.value = val.split('/inscripcion/').pop()
  }
}
</script>

<template>
  <div class="d-flex align-center justify-center pa-4" style="min-height: calc(100vh - 64px);">
    <div style="width: 100%; max-width: 920px;">

      <v-row align="stretch" class="ga-0">

        <!-- ── Panel izquierdo: explicación ───────────────────────── -->
        <v-col cols="12" md="5">
          <v-card rounded="xl" elevation="0" color="#0a1628" class="pa-8 h-100 d-flex flex-column justify-center">

            <div class="mb-6">
              <div style="width:48px; height:4px; background:#39A900; border-radius:2px;" class="mb-5" />
              <h2 class="text-h5 font-weight-bold text-white mb-3">¿Cómo accedo a la plataforma?</h2>
              <p class="text-body-2" style="color: rgba(255,255,255,0.65); line-height: 1.7;">
                El acceso a SENA SmartCourse depende de tu rol dentro del proceso formativo.
              </p>
            </div>

            <!-- Roles -->
            <div class="d-flex flex-column ga-4">

              <div class="rol-item">
                <v-avatar color="rgba(57,169,0,0.2)" size="36" class="flex-shrink-0">
                  <v-icon color="#39A900" size="18">mdi-school-outline</v-icon>
                </v-avatar>
                <div>
                  <div class="text-body-2 font-weight-bold text-white">Aprendiz</div>
                  <div class="text-caption" style="color:rgba(255,255,255,0.5);">
                    Recibe un link de inscripción de tu instructor o aliado e ingresa el código aquí.
                  </div>
                </div>
              </div>

              <div class="rol-item">
                <v-avatar color="rgba(57,169,0,0.2)" size="36" class="flex-shrink-0">
                  <v-icon color="#39A900" size="18">mdi-account-tie-outline</v-icon>
                </v-avatar>
                <div>
                  <div class="text-body-2 font-weight-bold text-white">Instructor</div>
                  <div class="text-caption" style="color:rgba(255,255,255,0.5);">
                    Tu cuenta es creada por el coordinador SENA. Contacta a tu coordinador regional.
                  </div>
                </div>
              </div>

              <div class="rol-item">
                <v-avatar color="rgba(57,169,0,0.2)" size="36" class="flex-shrink-0">
                  <v-icon color="#39A900" size="18">mdi-handshake-outline</v-icon>
                </v-avatar>
                <div>
                  <div class="text-body-2 font-weight-bold text-white">Aliado</div>
                  <div class="text-caption" style="color:rgba(255,255,255,0.5);">
                    El coordinador SENA gestiona tu acceso como entidad aliada.
                  </div>
                </div>
              </div>

            </div>

            <div class="mt-8 pt-4" style="border-top: 1px solid rgba(255,255,255,0.1);">
              <p class="text-caption" style="color:rgba(255,255,255,0.4);">
                ¿Ya tienes cuenta? <nuxt-link to="/login" class="text-decoration-none" style="color:#39A900;">Inicia sesión aquí</nuxt-link>
              </p>
            </div>
          </v-card>
        </v-col>

        <!-- ── Panel derecho: formulario de token ─────────────────── -->
        <v-col cols="12" md="7">
          <v-card rounded="xl" elevation="0" color="rgba(200,215,200,0.65)" class="pa-8 h-100 d-flex flex-column justify-center" style="backdrop-filter:blur(4px);">

            <div class="mb-6">
              <v-avatar color="#0a1628" size="56" class="mb-4">
                <v-icon color="#39A900" size="28">mdi-link-variant</v-icon>
              </v-avatar>
              <h2 class="text-h5 font-weight-bold mb-2">Inscripción a un curso</h2>
              <p class="text-body-2 text-grey-darken-1">
                Si tienes un link o código de inscripción, ingrésalo aquí para registrarte en el curso.
              </p>
            </div>

            <v-alert v-if="error" type="error" variant="tonal" rounded="lg" class="mb-4" closable @click:close="error = ''">
              {{ error }}
            </v-alert>

            <v-text-field
              v-model="token"
              label="Código o link de inscripción"
              variant="outlined"
              rounded="lg"
              density="comfortable"
              bg-color="white"
              placeholder="Pega el link completo o solo el código UUID"
              prepend-inner-icon="mdi-key-outline"
              class="mb-4"
              @input="limpiarToken"
              @keyup.enter="verificarToken"
              clearable
            />

            <v-btn
              color="#39A900"
              rounded="lg"
              size="large"
              block
              :loading="loading"
              :disabled="!token.trim()"
              @click="verificarToken"
            >
              Continuar con inscripción
            </v-btn>

            <div class="mt-6 pa-4 rounded-xl" style="background:rgba(255,255,255,0.5);">
              <div class="d-flex align-start ga-2">
                <v-icon size="16" color="#39A900" class="mt-1 flex-shrink-0">mdi-information-outline</v-icon>
                <p class="text-caption text-grey-darken-1">
                  El link de inscripción tiene el formato:<br>
                  <code style="font-size:11px; word-break:break-all;">
                    {{ config.public.apiBase.replace('/api','') }}/inscripcion/<strong>CÓDIGO</strong>
                  </code><br><br>
                  Puedes pegar el link completo o solo el código que aparece al final.
                </p>
              </div>
            </div>

          </v-card>
        </v-col>

      </v-row>
    </div>
  </div>
</template>

<style scoped>
.rol-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
</style>