<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'estudiante' })

const route        = useRoute()
const auth         = useAuthStore()
const { apiFetch } = useApi()

const cursoId      = route.params.id 
const estudianteId = auth.user?.id

const asistencias    = ref(null)
const calificaciones = ref(null)
const loading        = ref(true)
const error          = ref('')
const tab            = ref('asistencia')

async function cargarProgreso() {
  loading.value = true
  try {
    const [asist, calif] = await Promise.all([
      apiFetch(`/cursos/${cursoId}/estudiantes/${estudianteId}/asistencia`),
      apiFetch(`/cursos/${cursoId}/estudiantes/${estudianteId}/calificaciones`),
    ])
    
    asistencias.value    = asist
    calificaciones.value = calif
  } catch (err) {
    console.error("Error cargando detalles del curso:", err)
    error.value = 'No se pudo cargar tu progreso en este curso.'
  } finally {
    loading.value = false
  }
}

onMounted(cargarProgreso)

// ── Computed ──────────────────────────────────────────────────────────────
const resumenAsist = computed(() => asistencias.value?.resumen ?? null)
const listaAsist   = computed(() => asistencias.value?.asistencias ?? [])
const listaCalif   = computed(() => calificaciones.value?.calificaciones ?? [])
const promedio     = computed(() => calificaciones.value?.promedio_final ?? null)

function formatFechaHora(fh) {
  if (!fh) return '—'
  return new Date(fh).toLocaleString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatFecha(f) {
  if (!f) return '—'
  return new Date(f + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

function notaColor(nota) {
  if (nota === null || nota === undefined) return 'grey'
  if (nota >= 4) return 'success'
  if (nota >= 3) return 'warning'
  return 'error'
}

const estadoCursoConfig = {
  activo:    { color: 'success', label: 'En curso' },
  desertado: { color: 'error',   label: 'Desertado' },
  graduado:  { color: 'blue',    label: 'Graduado' },
}

function porcentajeCurso() {
  const curso = registro.value?.curso
  if (!curso?.horas_requeridas) return 0
  return Math.min(100, Math.round((curso.horas_cumplidas / curso.horas_requeridas) * 100))
}
</script>

<template>
  <div class="pa-4 pa-sm-6">

    <div v-if="loading">
      <v-skeleton-loader type="article" rounded="xl" />
    </div>

    <v-alert v-else-if="error" type="error" variant="tonal" rounded="xl">{{ error }}</v-alert>

    <template v-else-if="registro">

      <!-- Breadcrumb -->
      <div class="d-flex align-center ga-2 mb-4 text-body-2 text-grey">
        <nuxt-link to="/dashboard/estudiante" class="text-grey text-decoration-none">Mis Cursos</nuxt-link>
        <v-icon size="14">mdi-chevron-right</v-icon>
        <span class="text-truncate">{{ registro.curso?.nombre }}</span>
      </div>

      <!-- Hero del curso -->
      <v-card rounded="xl" elevation="0" class="hero-card pa-5 mb-5">
        <div class="d-flex align-start justify-space-between flex-wrap ga-3 mb-4">
          <div>
            <h1 class="text-h5 font-weight-bold mb-1">{{ registro.curso?.nombre }}</h1>
            <div class="d-flex align-center ga-2 text-body-2 text-grey-darken-1 flex-wrap">
              <v-icon size="14" color="#39A900">mdi-map-marker-outline</v-icon>
              {{ registro.curso?.regional?.nombre ?? '—' }}
              <span>·</span>
              <v-icon size="14" color="#39A900">mdi-calendar-range</v-icon>
              {{ formatFecha(registro.curso?.fecha_inicio) }}
            </div>
          </div>
          <v-chip
            :color="estadoCursoConfig[registro.estado]?.color"
            size="small" rounded="lg" class="font-weight-bold"
          >
            {{ estadoCursoConfig[registro.estado]?.label }}
          </v-chip>
        </div>

        <!-- Stats row -->
        <v-row dense class="mb-3">
          <v-col cols="6" sm="3">
            <div class="mini-stat text-center">
              <div class="text-h6 font-weight-black text-success">{{ resumenAsist?.clases_asistidas ?? '—' }}</div>
              <div class="text-caption text-grey">Clases asistidas</div>
            </div>
          </v-col>
          <v-col cols="6" sm="3">
            <div class="mini-stat text-center">
              <div class="text-h6 font-weight-black" style="color:#39A900">{{ resumenAsist?.porcentaje ?? 0 }}%</div>
              <div class="text-caption text-grey">Asistencia</div>
            </div>
          </v-col>
          <v-col cols="6" sm="3">
            <div class="mini-stat text-center">
              <div class="text-h6 font-weight-black text-primary">
                {{ promedio !== null ? Number(promedio).toFixed(1) : '—' }}
              </div>
              <div class="text-caption text-grey">Promedio</div>
            </div>
          </v-col>
          <v-col cols="6" sm="3">
            <div class="mini-stat text-center">
              <div class="text-h6 font-weight-black text-orange">{{ porcentajeCurso() }}%</div>
              <div class="text-caption text-grey">Progreso curso</div>
            </div>
          </v-col>
        </v-row>

        <v-progress-linear
          :model-value="resumenAsist?.porcentaje ?? 0"
          color="#39A900" bg-color="rgba(0,0,0,0.08)" rounded height="7"
        />
        <div class="text-caption text-grey mt-1 text-right">
          {{ resumenAsist?.clases_asistidas ?? 0 }} de {{ resumenAsist?.total_clases ?? 0 }} clases
        </div>
      </v-card>

      <!-- Tabs -->
      <v-tabs v-model="tab" color="#39A900" bg-color="transparent" class="mb-4">
        <v-tab value="asistencia">
          <v-icon start size="18">mdi-account-check-outline</v-icon>
          Asistencia
        </v-tab>
        <v-tab value="calificaciones">
          <v-icon start size="18">mdi-star-outline</v-icon>
          Calificaciones
        </v-tab>
      </v-tabs>

      <v-tabs-window v-model="tab">

        <!-- ══ ASISTENCIA ════════════════════════════════════════════ -->
        <v-tabs-window-item value="asistencia">
          <div v-if="listaAsist.length === 0" class="text-center pa-10">
            <v-icon size="56" color="grey-lighten-1">mdi-calendar-blank-outline</v-icon>
            <p class="text-body-2 text-grey mt-2">Aún no hay clases registradas.</p>
          </div>

          <v-row v-else>
            <v-col v-for="(item, i) in listaAsist" :key="item.id" cols="12" sm="6" md="4">
              <v-card rounded="xl" elevation="0" class="asist-item pa-4"
                :class="item.asistio ? 'asist-presente' : 'asist-ausente'">
                <div class="d-flex align-center ga-3">
                  <v-avatar :color="item.asistio ? '#39A900' : 'error'" size="38" class="text-white font-weight-bold">
                    {{ i + 1 }}
                  </v-avatar>
                  <div class="flex-grow-1">
                    <div class="font-weight-medium text-body-2">{{ item.clase?.tema ?? `Clase ${i + 1}` }}</div>
                    <div class="text-caption text-grey">{{ formatFechaHora(item.clase?.fecha_hora) }}</div>
                  </div>
                  <v-icon :color="item.asistio ? '#39A900' : 'error'" size="20">
                    {{ item.asistio ? 'mdi-check-circle' : 'mdi-close-circle' }}
                  </v-icon>
                </div>
                <div v-if="item.observacion" class="mt-2 text-caption text-grey-darken-1 pl-12">
                  {{ item.observacion }}
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-tabs-window-item>

        <!-- ══ CALIFICACIONES ════════════════════════════════════════ -->
        <v-tabs-window-item value="calificaciones">
          <div v-if="listaCalif.length === 0" class="text-center pa-10">
            <v-icon size="56" color="grey-lighten-1">mdi-star-off-outline</v-icon>
            <p class="text-body-2 text-grey mt-2">Aún no tienes calificaciones registradas.</p>
          </div>

          <template v-else>
            <!-- Promedio destacado -->
            <v-card rounded="xl" elevation="0" class="promedio-card pa-5 mb-5 text-center">
              <div class="text-caption text-grey mb-1">Promedio final</div>
              <div class="text-h2 font-weight-black" :style="`color:${Number(promedio) >= 3 ? '#39A900' : '#d32f2f'}`">
                {{ promedio !== null ? Number(promedio).toFixed(1) : '—' }}
              </div>
              <div class="text-caption text-grey">sobre 5.0</div>
            </v-card>

            <!-- Lista de notas -->
            <v-row>
              <v-col v-for="(item, i) in listaCalif" :key="item.id" cols="12" sm="6" md="4">
                <v-card rounded="xl" elevation="0" class="nota-item pa-4">
                  <div class="d-flex align-center ga-3">
                    <v-avatar :color="notaColor(item.nota)" size="38" class="text-white font-weight-bold text-body-1">
                      {{ item.nota !== null ? Number(item.nota).toFixed(1) : '—' }}
                    </v-avatar>
                    <div>
                      <div class="font-weight-medium text-body-2">{{ item.clase?.tema ?? `Clase ${i + 1}` }}</div>
                      <div class="text-caption text-grey">{{ formatFechaHora(item.clase?.fecha_hora) }}</div>
                    </div>
                  </div>
                  <div v-if="item.observacion" class="mt-2 text-caption text-grey-darken-1 pl-12">
                    {{ item.observacion }}
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </template>
        </v-tabs-window-item>

      </v-tabs-window>
    </template>
  </div>
</template>

<style scoped>
.hero-card    { background: rgba(200,215,200,0.55); backdrop-filter: blur(4px); }
.mini-stat    { background: rgba(255,255,255,0.6); border-radius: 10px; padding: 8px; }
.promedio-card { background: rgba(57,169,0,0.08); border: 1px solid rgba(57,169,0,0.2); }
.asist-item   { border: 1px solid transparent; transition: border-color 0.2s; }
.asist-presente { background: rgba(57,169,0,0.08) !important; border-color: rgba(57,169,0,0.2) !important; }
.asist-ausente  { background: rgba(255,255,255,0.6) !important; border-color: rgba(211,47,47,0.15) !important; }
.nota-item    { background: rgba(255,255,255,0.7); border: 1px solid rgba(0,0,0,0.06); }
</style>