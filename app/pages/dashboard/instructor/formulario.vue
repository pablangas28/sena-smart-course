<script setup>
import { ref, reactive, computed, onMounted } from 'vue'

definePageMeta({ layout: 'instructor' })

const { apiFetch } = useApi()

const cursos       = ref([])
const loading      = ref(true)
const cursoSel     = ref(null)
const expiraEn     = ref('')
const generando    = ref(false)
const linkGenerado = ref('')
const dialogLink   = ref(false)
const snackbar     = reactive({ show: false, text: '', color: 'success' })

async function cargarCursos() {
  loading.value = true
  try {
    const todos = await apiFetch('/cursos')
    cursos.value = todos.filter(c => c.estado === 'activo')
  } catch {
    snackbar.text = 'No se pudieron cargar los cursos.'
    snackbar.color = 'error'
    snackbar.show = true
  } finally {
    loading.value = false
  }
}

onMounted(cargarCursos)

async function generarFormulario() {
  if (!cursoSel.value) return
  generando.value = true
  try {
    const body = expiraEn.value ? { expira_en: expiraEn.value + ':00' } : {}
    const res = await apiFetch(`/cursos/${cursoSel.value}/formularios`, { method: 'POST', body })
    const token = res.formulario.token
    linkGenerado.value = `${window.location.origin}/inscripcion/${token}`
    // linkGenerado.value = res.link
    dialogLink.value   = true
  } catch {
    snackbar.text = 'No se pudo generar el formulario.'
    snackbar.color = 'error'
    snackbar.show = true
  } finally {
    generando.value = false
  }
}

function copiarLink() {
  navigator.clipboard.writeText(linkGenerado.value)
  snackbar.text = '¡Link copiado al portapapeles!'
  snackbar.color = 'success'
  snackbar.show = true
}

const cursoSelNombre = computed(() =>
  cursos.value.find(c => c.id === cursoSel.value)?.nombre ?? ''
)
</script>

<template>
  <div class="pa-6" style="max-width:640px">

    <div class="mb-6">
      <h2 class="text-h5 font-weight-bold">Generar Formulario de Inscripción</h2>
      <p class="text-body-2 text-grey-darken-1 mt-1">
        Crea un link único para que los aprendices se inscriban en uno de tus cursos.
      </p>
    </div>

    <v-card rounded="xl" elevation="0" class="pa-6 form-card">

      <div class="d-flex align-start ga-3 pa-4 rounded-xl mb-5" style="background:rgba(57,169,0,0.06); border:1px dashed rgba(57,169,0,0.3)">
        <v-icon color="#39A900" class="mt-1 flex-shrink-0">mdi-information-outline</v-icon>
        <p class="text-body-2 text-grey-darken-1">
          El link generado es público. Cualquier persona que lo tenga puede inscribirse.
          Compártelo por WhatsApp o correo con los aprendices.
        </p>
      </div>

      <div v-if="loading" class="text-center pa-8">
        <v-progress-circular indeterminate color="#39A900" />
      </div>

      <template v-else>
        <v-select
          v-model="cursoSel"
          label="Selecciona el curso *"
          :items="cursos"
          item-title="nombre"
          item-value="id"
          variant="outlined" rounded="lg" density="comfortable" bg-color="white"
          class="mb-4"
          no-data-text="No tienes cursos activos."
        >
          <template #item="{ item, props: itemProps }">
            <v-list-item v-bind="itemProps">
              <template #subtitle>
                <span class="text-caption">{{ item.raw.regional?.nombre }}</span>
              </template>
            </v-list-item>
          </template>
        </v-select>

        <v-text-field
          v-model="expiraEn"
          label="Fecha de expiración (opcional)"
          type="datetime-local"
          variant="outlined" rounded="lg" density="comfortable" bg-color="white"
          hint="Si no defines fecha, el formulario no expira."
          class="mb-5"
        />

        <v-btn
          block color="#39A900" rounded="lg" size="large"
          prepend-icon="mdi-link-plus"
          :loading="generando"
          :disabled="!cursoSel"
          @click="generarFormulario"
        >
          Generar link de inscripción
        </v-btn>
      </template>
    </v-card>

    <!-- Dialog: link generado -->
    <v-dialog v-model="dialogLink" max-width="520">
      <v-card rounded="xl" class="pa-6">
        <div class="d-flex align-center ga-3 mb-5">
          <v-avatar color="success" size="52">
            <v-icon color="white" size="28">mdi-check-circle</v-icon>
          </v-avatar>
          <div>
            <div class="text-h6 font-weight-bold">¡Link generado!</div>
            <div class="text-body-2 text-grey">Para el curso: {{ cursoSelNombre }}</div>
          </div>
        </div>

        <v-card color="rgba(57,169,0,0.06)" rounded="lg" class="pa-4 mb-5">
          <div class="text-caption text-grey mb-1">Link de inscripción público</div>
          <div class="text-body-2 font-weight-medium" style="word-break:break-all; font-family:monospace">
            {{ linkGenerado }}
          </div>
        </v-card>

        <div class="d-flex ga-3">
          <v-btn color="#39A900" rounded="lg" prepend-icon="mdi-content-copy" @click="copiarLink">
            Copiar link
          </v-btn>
          <v-btn
            variant="tonal" color="#39A900" rounded="lg"
            :to="`/dashboard/instructor/cursos/${cursoSel}`"
            @click="dialogLink = false"
          >
            Ver el curso
          </v-btn>
          <v-btn variant="text" rounded="lg" @click="dialogLink = false">Cerrar</v-btn>
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
.form-card { background: rgba(200,215,200,0.55); backdrop-filter: blur(4px); }
</style>