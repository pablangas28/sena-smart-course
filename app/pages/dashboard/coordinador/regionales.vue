<script setup>
import { ref, reactive, onMounted } from 'vue'

definePageMeta({ layout: 'coordinador' })

const { apiFetch } = useApi()

const regionales  = ref([])
const loading     = ref(true)
const error       = ref('')
const snackbar    = reactive({ show: false, text: '', color: 'success' })
const dialog      = ref(false)
const guardando   = ref(false)
const editando    = ref(null) // null = nueva, objeto = editar
const errorForm   = ref('')

const form = reactive({ nombre: '', departamento: '' })

async function cargarRegionales() {
  loading.value = true
  try {
    regionales.value = await apiFetch('/regionales')
  } catch {
    error.value = 'No se pudieron cargar las regionales.'
  } finally {
    loading.value = false
  }
}

onMounted(cargarRegionales)

function abrirNueva() {
  editando.value      = null
  form.nombre         = ''
  form.departamento   = ''
  errorForm.value     = ''
  dialog.value        = true
}

function abrirEditar(reg) {
  editando.value    = reg
  form.nombre       = reg.nombre
  form.departamento = reg.departamento
  errorForm.value   = ''
  dialog.value      = true
}

async function guardar() {
  if (!form.nombre || !form.departamento) {
    errorForm.value = 'Nombre y departamento son requeridos.'
    return
  }
  guardando.value = true
  try {
    if (editando.value) {
      const updated = await apiFetch(`/regionales/${editando.value.id}`, {
        method: 'PATCH', body: { ...form },
      })
      const idx = regionales.value.findIndex(r => r.id === editando.value.id)
      if (idx !== -1) regionales.value[idx] = updated
      toast('Regional actualizada correctamente.')
    } else {
      const nueva = await apiFetch('/regionales', { method: 'POST', body: { ...form } })
      regionales.value.push(nueva)
      toast('Regional creada correctamente.')
    }
    dialog.value = false
  } catch (err) {
    errorForm.value = err?.response?._data?.message ?? 'No se pudo guardar la regional.'
  } finally {
    guardando.value = false
  }
}

function toast(text, color = 'success') {
  snackbar.text = text; snackbar.color = color; snackbar.show = true
}
</script>

<template>
  <div class="pa-6" style="max-width:800px">

    <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-6">
      <div>
        <h2 class="text-h5 font-weight-bold">Regionales</h2>
        <p class="text-body-2 text-grey-darken-1 mt-1">Gestiona las regionales del SENA.</p>
      </div>
      <v-btn color="#1976D2" rounded="lg" prepend-icon="mdi-plus" @click="abrirNueva">
        Nueva Regional
      </v-btn>
    </div>

    <v-alert v-if="error" type="error" variant="tonal" rounded="lg" class="mb-4">{{ error }}</v-alert>

    <div v-if="loading">
      <v-skeleton-loader v-for="i in 4" :key="i" type="list-item-two-line" class="mb-2" rounded="xl" />
    </div>

    <v-row v-else>
      <v-col v-for="reg in regionales" :key="reg.id" cols="12" sm="6">
        <v-card rounded="xl" elevation="0" class="reg-card pa-5">
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center ga-3">
              <v-avatar color="rgba(25,118,210,0.12)" size="44">
                <v-icon color="#1976D2">mdi-map-marker-outline</v-icon>
              </v-avatar>
              <div>
                <div class="font-weight-bold text-body-1">{{ reg.nombre }}</div>
                <div class="text-caption text-grey">{{ reg.departamento }}</div>
              </div>
            </div>
            <v-btn icon size="small" variant="text" @click="abrirEditar(reg)">
              <v-icon size="18">mdi-pencil-outline</v-icon>
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog -->
    <v-dialog v-model="dialog" max-width="440">
      <v-card rounded="xl" class="pa-6">
        <div class="text-h6 font-weight-bold mb-5">
          {{ editando ? 'Editar regional' : 'Nueva regional' }}
        </div>
        <v-alert v-if="errorForm" type="error" variant="tonal" rounded="lg" class="mb-4" closable>{{ errorForm }}</v-alert>
        <v-text-field v-model="form.nombre" label="Nombre *" variant="outlined" rounded="lg" density="comfortable" class="mb-3" />
        <v-text-field v-model="form.departamento" label="Departamento *" variant="outlined" rounded="lg" density="comfortable" class="mb-4" />
        <div class="d-flex ga-3">
          <v-btn color="#1976D2" rounded="lg" :loading="guardando" @click="guardar">
            {{ editando ? 'Guardar cambios' : 'Crear' }}
          </v-btn>
          <v-btn variant="text" rounded="lg" @click="dialog = false">Cancelar</v-btn>
        </div>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" rounded="lg" timeout="3000" location="bottom right">
      {{ snackbar.text }}
      <template #actions><v-btn variant="text" @click="snackbar.show = false">Cerrar</v-btn></template>
    </v-snackbar>
  </div>
</template>

<style scoped>
.reg-card { background: rgba(200,215,200,0.55); backdrop-filter: blur(4px); }
</style>