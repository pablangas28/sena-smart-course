<script setup>
import { ref, reactive, computed, onMounted } from 'vue'

const props = defineProps({
  rolLayout:   { type: String,  default: 'instructor' },
  colorAccent: { type: String,  default: '#39A900' },
  soloLectura: { type: Boolean, default: false },
})

const route        = useRoute()
const { apiFetch } = useApi()
const cursoId      = route.params.id
const claseId      = route.params.claseId

const clase          = ref(null)
const estudiantes    = ref([])
const asistencias    = ref([])
const calificaciones = ref([])
const loading        = ref(true)
const error          = ref('')
const tab            = ref('asistencia')
const snackbar       = reactive({ show: false, text: '', color: 'success' })

async function cargarTodo() {
  loading.value = true
  try {
    const [claseData, estudiantesData, asistData, califData] = await Promise.all([
      apiFetch(`/cursos/${cursoId}/clases/${claseId}`),
      apiFetch(`/cursos/${cursoId}/estudiantes`),
      apiFetch(`/clases/${claseId}/asistencia`),
      apiFetch(`/clases/${claseId}/calificaciones`).catch(() => []),
    ])
    clase.value       = claseData
    estudiantes.value = estudiantesData

    const asistMap = {}
    asistData.forEach(a => { asistMap[a.estudiante_id] = a })
    const califMap = {}
    ;(califData?.calificaciones ?? califData ?? []).forEach(c => { califMap[c.estudiante_id] = c })

    asistencias.value = estudiantesData.map(reg => ({
      estudiante_id: reg.user_id,
      nombre:        `${reg.nombre} ${reg.apellidos}`,
      asistio:       asistMap[reg.user_id]?.asistio ?? false,
      observacion:   asistMap[reg.user_id]?.observacion ?? '',
    }))
    calificaciones.value = estudiantesData.map(reg => ({
      estudiante_id: reg.user_id,
      nombre:        `${reg.nombre} ${reg.apellidos}`,
      nota:          califMap[reg.user_id]?.nota ?? '',
      observacion:   califMap[reg.user_id]?.observacion ?? '',
    }))
  } catch {
    error.value = 'No se pudo cargar la información de la clase.'
  } finally {
    loading.value = false
  }
}

onMounted(cargarTodo)

// ── Asistencia ────────────────────────────────────────────────────────────
const guardandoAsistencia = ref(false)
async function guardarAsistencia() {
  guardandoAsistencia.value = true
  try {
    await apiFetch(`/clases/${claseId}/asistencia`, {
      method: 'POST',
      body: { asistencias: asistencias.value.map(a => ({ estudiante_id: a.estudiante_id, asistio: a.asistio, observacion: a.observacion || null })) },
    })
    toast('Asistencia guardada.')
  } catch { toast('No se pudo guardar la asistencia.', 'error') }
  finally { guardandoAsistencia.value = false }
}

// ── Calificaciones ────────────────────────────────────────────────────────
const guardandoCalif = ref(false)
const errorCalif     = ref('')
const calificacionesValidas = computed(() =>
  calificaciones.value.every(c => c.nota === '' || (parseFloat(c.nota) >= 0 && parseFloat(c.nota) <= 5))
)
async function guardarCalificaciones() {
  errorCalif.value = ''
  guardandoCalif.value = true
  try {
    const items = calificaciones.value
      .filter(c => c.nota !== '' && c.nota !== null)
      .map(c => ({ estudiante_id: c.estudiante_id, nota: parseFloat(c.nota), observacion: c.observacion || null }))
    if (!items.length) { errorCalif.value = 'Ingresa al menos una nota.'; return }
    await apiFetch(`/clases/${claseId}/calificaciones`, { method: 'POST', body: { calificaciones: items } })
    toast('Calificaciones guardadas.')
  } catch { toast('No se pudo guardar las calificaciones.', 'error') }
  finally { guardandoCalif.value = false }
}

// ── Helpers ───────────────────────────────────────────────────────────────
function toast(text, color = 'success') { snackbar.text = text; snackbar.color = color; snackbar.show = true }
function formatFechaHora(fh) {
  if (!fh) return '—'
  return new Date(fh).toLocaleString('es-CO', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
const totalAsistieron = computed(() => asistencias.value.filter(a => a.asistio).length)
const porcentajeAsist = computed(() => !asistencias.value.length ? 0 : Math.round((totalAsistieron.value / asistencias.value.length) * 100))
function notaColor(nota) {
  const n = parseFloat(nota)
  if (!nota && nota !== 0) return 'grey'
  return n >= 4 ? 'success' : n >= 3 ? 'warning' : 'error'
}
const dashboardBase = computed(() => `/dashboard/${props.rolLayout}`)
</script>

<template>
  <div>
    <div v-if="loading" class="pa-6"><v-skeleton-loader type="article" /></div>
    <v-alert v-else-if="error" type="error" variant="tonal" class="ma-6" rounded="xl">{{ error }}</v-alert>

    <template v-else>
      <!-- Hero -->
      <div class="clase-hero pa-6 pb-0">
        <div class="d-flex align-center ga-2 mb-4 text-body-2 text-grey flex-wrap">
          <nuxt-link :to="dashboardBase" class="text-grey text-decoration-none">Inicio</nuxt-link>
          <v-icon size="14">mdi-chevron-right</v-icon>
          <nuxt-link :to="`${dashboardBase}/cursos/${cursoId}`" class="text-grey text-decoration-none">Curso</nuxt-link>
          <v-icon size="14">mdi-chevron-right</v-icon>
          <span>{{ clase?.tema }}</span>
        </div>

        <div class="d-flex align-start justify-space-between flex-wrap ga-3 mb-4">
          <div>
            <v-chip :color="clase?.tipo === 'presencial' ? 'blue' : 'purple'" size="small" rounded="lg" class="mb-1">{{ clase?.tipo }}</v-chip>
            <h1 class="text-h4 font-weight-bold mb-1">{{ clase?.tema }}</h1>
            <div class="text-body-2 text-grey">{{ formatFechaHora(clase?.fecha_hora) }} · {{ clase?.duracion_horas }}h</div>
          </div>
        </div>

        <div class="d-flex ga-4 pb-4 flex-wrap">
          <div class="stat-mini">
            <span class="font-weight-bold" :style="`color:${colorAccent}`">{{ totalAsistieron }}</span>
            <span class="text-caption text-grey"> / {{ estudiantes.length }} asistieron</span>
          </div>
          <div class="stat-mini">
            <span class="font-weight-bold text-primary">{{ porcentajeAsist }}%</span>
            <span class="text-caption text-grey"> asistencia</span>
          </div>
        </div>

        <v-tabs v-model="tab" :color="colorAccent" bg-color="transparent">
          <v-tab value="asistencia"><v-icon start size="18">mdi-account-check-outline</v-icon>Asistencia</v-tab>
          <v-tab value="calificaciones"><v-icon start size="18">mdi-star-outline</v-icon>Calificaciones</v-tab>
        </v-tabs>
      </div>

      <v-divider />

      <div class="pa-6">
        <v-tabs-window v-model="tab">

          <!-- Asistencia -->
          <v-tabs-window-item value="asistencia">
            <div v-if="!estudiantes.length" class="text-center pa-12">
              <v-icon size="64" color="black-lighten-1">mdi-account-off-outline</v-icon>
              <p class="text-body-1 text-black mt-3">No hay estudiantes inscritos.</p>
            </div>
            <template v-else>
              <div class="d-flex align-center ga-3 mb-5">
                <v-progress-linear :model-value="porcentajeAsist" :color="colorAccent" bg-color="rgba(0,0,0,0.08)" height="10" rounded class="flex-grow-1" />
                <span class="text-body-2 font-weight-bold" style="min-width:40px">{{ porcentajeAsist }}%</span>
              </div>

              <!-- Acciones masivas solo si no es solo lectura -->
              <div v-if="!soloLectura" class="d-flex ga-2 mb-4">
                <v-btn size="small" variant="tonal" color="success" rounded="lg" @click="asistencias.forEach(a => a.asistio = true)">Todos presentes</v-btn>
                <v-btn size="small" variant="tonal" color="grey" rounded="lg" @click="asistencias.forEach(a => a.asistio = false)">Limpiar</v-btn>
              </div>

              <v-card v-for="item in asistencias" :key="item.estudiante_id" rounded="xl" elevation="0" class="asist-row pa-4 mb-3"
                :class="{ 'asist-presente': item.asistio, 'asist-ausente': !item.asistio }">
                <div class="d-flex align-center ga-3 flex-wrap">
                  <v-avatar :color="item.asistio ? colorAccent : 'grey-lighten-1'" size="40" class="text-white font-weight-bold text-body-2">
                    {{ item.nombre.split(' ').map(n => n[0]).slice(0,2).join('') }}
                  </v-avatar>
                  <div class="flex-grow-1 font-weight-medium text-body-2">{{ item.nombre }}</div>
                  <!-- Switch solo si no es solo lectura -->
                  <v-switch v-if="!soloLectura" v-model="item.asistio" :color="colorAccent" hide-details density="compact" :label="item.asistio ? 'Presente' : 'Ausente'" inset />
                  <!-- Solo lectura: chip visual -->
                  <v-chip v-else :color="item.asistio ? 'success' : 'error'" size="small" rounded="lg" class="font-weight-bold">
                    {{ item.asistio ? 'Presente' : 'Ausente' }}
                  </v-chip>
                </div>
                <v-expand-transition>
                  <v-text-field v-if="!soloLectura && !item.asistio" v-model="item.observacion" placeholder="Observación (opcional)" variant="outlined" rounded="lg" density="compact" hide-details class="mt-3" bg-color="white" />
                  <div v-else-if="soloLectura && item.observacion" class="mt-2 text-caption text-grey-darken-1 pl-12">{{ item.observacion }}</div>
                </v-expand-transition>
              </v-card>

              <v-btn v-if="!soloLectura" :color="colorAccent" rounded="lg" size="large" class="mt-4" prepend-icon="mdi-content-save" :loading="guardandoAsistencia" @click="guardarAsistencia">
                Guardar asistencia
              </v-btn>
            </template>
          </v-tabs-window-item>

          <!-- Calificaciones -->
          <v-tabs-window-item value="calificaciones">
            <div v-if="!estudiantes.length" class="text-center pa-12">
              <v-icon size="64" color="black-lighten-1">mdi-account-off-outline</v-icon>
              <p class="text-body-1 text-black mt-3">No hay estudiantes inscritos.</p>
            </div>
            <template v-else>
              <p class="text-body-2 text-grey mb-4">
                <template v-if="!soloLectura">Notas de <strong>0.0 a 5.0</strong>. Deja en blanco si no aplica.</template>
                <template v-else>Calificaciones registradas en esta clase.</template>
              </p>
              <v-alert v-if="errorCalif" type="warning" variant="tonal" rounded="lg" class="mb-4" closable>{{ errorCalif }}</v-alert>

              <v-card v-for="item in calificaciones" :key="item.estudiante_id" rounded="xl" elevation="0" class="calif-row pa-4 mb-3">
                <div class="d-flex align-center ga-3 flex-wrap">
                  <v-avatar :color="notaColor(item.nota)" size="40" class="text-white font-weight-bold text-body-2">
                    {{ item.nota !== '' ? parseFloat(item.nota).toFixed(1) : '—' }}
                  </v-avatar>
                  <div class="flex-grow-1">
                    <div class="font-weight-medium text-body-2 mb-2">{{ item.nombre }}</div>
                    <!-- Editable si no es solo lectura -->
                    <div v-if="!soloLectura" class="d-flex ga-3 flex-wrap">
                      <v-text-field v-model="item.nota" label="Nota (0-5)" type="number" min="0" max="5" step="0.1" variant="outlined" rounded="lg" density="compact" bg-color="white" hide-details style="max-width:140px" />
                      <v-text-field v-model="item.observacion" label="Observación" variant="outlined" rounded="lg" density="compact" bg-color="white" hide-details class="flex-grow-1" />
                    </div>
                    <!-- Solo lectura -->
                    <div v-else class="text-caption text-grey-darken-1">
                      {{ item.observacion || 'Sin observación' }}
                    </div>
                  </div>
                </div>
              </v-card>

              <v-btn v-if="!soloLectura" :color="colorAccent" rounded="lg" size="large" class="mt-4" prepend-icon="mdi-content-save" :loading="guardandoCalif" :disabled="!calificacionesValidas" @click="guardarCalificaciones">
                Guardar calificaciones
              </v-btn>
            </template>
          </v-tabs-window-item>

        </v-tabs-window>
      </div>
    </template>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" rounded="lg" timeout="3000" location="bottom right">
      {{ snackbar.text }}
      <template #actions><v-btn variant="text" @click="snackbar.show = false">Cerrar</v-btn></template>
    </v-snackbar>
  </div>
</template>

<style scoped>
.clase-hero    { background: rgba(200,215,200,0.3); backdrop-filter: blur(4px); }
.stat-mini     { background: rgba(255,255,255,0.6); border-radius: 10px; padding: 6px 14px; }
.asist-row     { border: 1px solid transparent; transition: border-color 0.2s; }
.asist-presente { background: rgba(57,169,0,0.08) !important; border-color: rgba(57,169,0,0.2) !important; }
.asist-ausente  { background: rgba(255,255,255,0.6) !important; border-color: rgba(0,0,0,0.06) !important; }
.calif-row     { background: rgba(255,255,255,0.7); border: 1px solid rgba(0,0,0,0.06); }
</style>