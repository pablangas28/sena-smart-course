<script setup>
import { ref, reactive, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'

const props = defineProps({
  backTo: { type: String, default: '/' },
})

const auth         = useAuthStore()
const { apiFetch } = useApi()

// ── Perfil ────────────────────────────────────────────────────────────────
const editando  = ref(false)
const guardando = ref(false)

const formPerfil = reactive({
  nombre:    auth.user?.nombre    ?? '',
  apellidos: auth.user?.apellidos ?? '',
  telefono:  auth.user?.telefono  ?? '',
  ocupacion: auth.user?.ocupacion ?? '',
})

async function guardarPerfil() {
  guardando.value = true
  try {
    const data = await apiFetch(`/usuarios/${auth.user.id}`, {
      method: 'PATCH',
      body:   formPerfil,
    })
    auth.user      = { ...auth.user, ...data }
    editando.value = false
    mostrarSnackbar('Perfil actualizado correctamente.')
  } catch {
    mostrarSnackbar('No se pudo actualizar el perfil.', 'error')
  } finally {
    guardando.value = false
  }
}

function cancelarEdicion() {
  formPerfil.nombre    = auth.user?.nombre    ?? ''
  formPerfil.apellidos = auth.user?.apellidos ?? ''
  formPerfil.telefono  = auth.user?.telefono  ?? ''
  formPerfil.ocupacion = auth.user?.ocupacion ?? ''
  editando.value = false
}

// ── Contraseña ────────────────────────────────────────────────────────────
const cambiandoPass = ref(false)
const loadingPass   = ref(false)
const errorPass     = ref('')
const showPass      = reactive({ actual: false, nuevo: false, confirmar: false })
const formPass      = reactive({ actual: '', nuevo: '', confirmar: '' })

async function cambiarPassword() {
  errorPass.value = ''
  if (formPass.nuevo !== formPass.confirmar) {
    errorPass.value = 'Las contraseñas nuevas no coinciden.'
    return
  }
  loadingPass.value = true
  const { ok, message } = await auth.cambiarPassword(
    formPass.actual, formPass.nuevo, formPass.confirmar,
  )
  loadingPass.value = false
  if (ok) {
    cambiandoPass.value = false
    formPass.actual = formPass.nuevo = formPass.confirmar = ''
    mostrarSnackbar('Contraseña actualizada correctamente.')
  } else {
    errorPass.value = message
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────
const snackbar = reactive({ show: false, text: '', color: 'success' })

function mostrarSnackbar(text, color = 'success') {
  snackbar.text  = text
  snackbar.color = color
  snackbar.show  = true
}

const iniciales = computed(() => {
  const parts = `${auth.user?.nombre ?? ''} ${auth.user?.apellidos ?? ''}`.trim().split(' ')
  return parts.map(p => p[0]).slice(0, 2).join('').toUpperCase()
})

const rolLabel = {
  coordinador: 'Coordinador',
  instructor:  'Instructor',
  aliado:      'Aliado',
  estudiante:  'Estudiante/Aprendiz',
}
</script>

<template>
  <div style="max-width: 720px;">

    <!-- Cabecera -->
    <div class="d-flex align-center ga-3 mb-6">
      <v-btn icon variant="text" size="small" :to="backTo">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <div>
        <h2 class="text-h5 font-weight-bold">Mi Perfil</h2>
        <p class="text-body-2 text-grey">Gestiona tu información personal</p>
      </div>
    </div>

    <!-- Card datos personales -->
    <v-card rounded="xl" elevation="0" class="pa-6 mb-4 perfil-card">

      <!-- Avatar + info principal -->
      <div class="d-flex align-center ga-4 mb-5 flex-wrap">
        <v-avatar color="#0a1628" size="72" class="text-white text-h5 font-weight-bold flex-shrink-0">
          {{ iniciales }}
        </v-avatar>
        <div class="flex-grow-1">
          <div class="text-h6 font-weight-bold">
            {{ auth.user?.nombre }} {{ auth.user?.apellidos }}
          </div>
          <div class="d-flex align-center ga-2 mt-1 flex-wrap">
            <v-chip color="#39A900" size="small" rounded="lg" class="font-weight-bold text-uppercase">
              {{ rolLabel[auth.user?.rol] ?? auth.user?.rol }}
            </v-chip>
            <span class="text-caption text-grey">{{ auth.user?.email }}</span>
          </div>
          <div v-if="auth.user?.regional" class="text-caption text-grey mt-1 d-flex align-center ga-1">
            <v-icon size="13">mdi-map-marker-outline</v-icon>
            {{ auth.user.regional.nombre }}
          </div>
        </div>
        <v-btn
          v-if="!editando"
          variant="tonal"
          color="#39A900"
          rounded="lg"
          size="small"
          prepend-icon="mdi-pencil-outline"
          @click="editando = true"
        >
          Editar
        </v-btn>
      </div>

      <v-divider class="mb-5" />

      <!-- Campos editables -->
      <v-row>
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formPerfil.nombre"
            label="Nombre"
            variant="outlined"
            rounded="lg"
            density="comfortable"
            :readonly="!editando"
            :bg-color="editando ? 'white' : 'transparent'"
            :variant="editando ? 'outlined' : 'plain'"
          />
        </v-col>
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formPerfil.apellidos"
            label="Apellidos"
            variant="outlined"
            rounded="lg"
            density="comfortable"
            :readonly="!editando"
            :bg-color="editando ? 'white' : 'transparent'"
            :variant="editando ? 'outlined' : 'plain'"
          />
        </v-col>
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formPerfil.telefono"
            label="Teléfono"
            prepend-inner-icon="mdi-phone-outline"
            variant="outlined"
            rounded="lg"
            density="comfortable"
            :readonly="!editando"
            :bg-color="editando ? 'white' : 'transparent'"
            :variant="editando ? 'outlined' : 'plain'"
          />
        </v-col>
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formPerfil.ocupacion"
            label="Ocupación"
            prepend-inner-icon="mdi-briefcase-outline"
            variant="outlined"
            rounded="lg"
            density="comfortable"
            :readonly="!editando"
            :bg-color="editando ? 'white' : 'transparent'"
            :variant="editando ? 'outlined' : 'plain'"
          />
        </v-col>
      </v-row>

      <div v-if="editando" class="d-flex ga-3 mt-2">
        <v-btn color="#39A900" rounded="lg" :loading="guardando" @click="guardarPerfil">
          Guardar cambios
        </v-btn>
        <v-btn variant="text" rounded="lg" @click="cancelarEdicion">Cancelar</v-btn>
      </div>
    </v-card>

    <!-- Card contraseña -->
    <v-card rounded="xl" elevation="0" class="pa-6 perfil-card">
      <div class="d-flex align-center justify-space-between mb-1">
        <div>
          <div class="text-body-1 font-weight-bold">Contraseña</div>
          <div class="text-caption text-grey">Actualiza tu contraseña de acceso</div>
        </div>
        <v-btn
          v-if="!cambiandoPass"
          variant="tonal"
          color="warning"
          rounded="lg"
          size="small"
          prepend-icon="mdi-lock-reset"
          @click="cambiandoPass = true"
        >
          Cambiar
        </v-btn>
      </div>

      <v-expand-transition>
        <div v-if="cambiandoPass" class="mt-4">
          <v-alert v-if="errorPass" type="error" variant="tonal" rounded="lg" class="mb-4" closable>
            {{ errorPass }}
          </v-alert>
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="formPass.actual"
                label="Contraseña actual"
                :type="showPass.actual ? 'text' : 'password'"
                variant="outlined" rounded="lg" density="comfortable" bg-color="white"
                :append-inner-icon="showPass.actual ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPass.actual = !showPass.actual"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="formPass.nuevo"
                label="Nueva contraseña"
                :type="showPass.nuevo ? 'text' : 'password'"
                variant="outlined" rounded="lg" density="comfortable" bg-color="white"
                :append-inner-icon="showPass.nuevo ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPass.nuevo = !showPass.nuevo"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="formPass.confirmar"
                label="Confirmar contraseña"
                :type="showPass.confirmar ? 'text' : 'password'"
                variant="outlined" rounded="lg" density="comfortable" bg-color="white"
                :append-inner-icon="showPass.confirmar ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPass.confirmar = !showPass.confirmar"
              />
            </v-col>
          </v-row>
          <div class="d-flex ga-3">
            <v-btn color="warning" rounded="lg" :loading="loadingPass" @click="cambiarPassword">
              Actualizar contraseña
            </v-btn>
            <v-btn variant="text" rounded="lg" @click="cambiandoPass = false; errorPass = ''">
              Cancelar
            </v-btn>
          </div>
        </div>
      </v-expand-transition>
    </v-card>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" rounded="lg" timeout="3000" location="bottom right">
      {{ snackbar.text }}
      <template #actions>
        <v-btn variant="text" @click="snackbar.show = false">Cerrar</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<style scoped>
.perfil-card {
  background: rgba(200, 215, 200, 0.55);
  backdrop-filter: blur(4px);
}
</style>