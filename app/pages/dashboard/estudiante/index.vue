<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'estudiante' })

const auth         = useAuthStore()
const { apiFetch } = useApi()

const progreso = ref([])
const loading  = ref(true)
const error    = ref('')

async function cargarProgreso() {
  loading.value = true
  try {
    progreso.value = await apiFetch('/mi-progreso')
  } catch {
    error.value = 'No se pudo cargar tu progreso.'
  } finally {
    loading.value = false
  }
}

onMounted(
  cargarProgreso
)

const cursosActivos = computed(() => progreso.value.filter(r => r.estado === 'activo'))

const estadoConfig = {
  activo:    { color: 'success',   label: 'En curso',   icon: 'mdi-play-circle-outline' },
  desertado: { color: 'error',     label: 'Desertado',  icon: 'mdi-close-circle-outline' },
  graduado:  { color: 'blue',      label: 'Graduado',   icon: 'mdi-school-outline' },
}

function formatFecha(f) {
  if (!f) return '—'
  return new Date(f + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

function porcentaje(curso) {
  if (!curso?.horas_requeridas) return 0
  return Math.min(100, Math.round((curso.horas_cumplidas / curso.horas_requeridas) * 100))
}
</script>

<template>
  <div class="pa-4 pa-sm-6">

    <!-- Bienvenida -->
    <div class="mb-6">
      <h2 class="text-h5 font-weight-bold">
        ¡Hola, {{ auth.user?.nombre }}! 👋
      </h2>
      <p class="text-body-2 text-grey-darken-1 mt-1">
        Aquí puedes ver el estado de tus cursos, asistencias y calificaciones.
      </p>
    </div>

    <!-- Skeleton -->
    <div v-if="loading">
      <v-row><v-col v-for="i in 2" :key="i" cols="12" sm="6"><v-skeleton-loader type="card" rounded="xl" /></v-col></v-row>
    </div>

    <v-alert v-else-if="error" type="error" variant="tonal" rounded="xl">{{ error }}</v-alert>

    <template v-else>
      <!-- Sin cursos -->
      <div v-if="progreso.length === 0" class="text-center pa-16">
        <v-icon size="80" color="black-lighten-1">mdi-book-open-page-variant-outline</v-icon>
        <h3 class="text-h6 font-weight-medium text-black mt-4">No estás inscrito en ningún curso</h3>
        <p class="text-body-2 text-black mt-2">
          Cuando un instructor o aliado te comparta un link de inscripción, podrás unirte a un curso.
        </p>
      </div>

      <template v-else>
        <!-- Stats mini -->
        <v-row class="mb-6">
          <v-col v-for="(s, i) in [
            { label: 'Cursos inscritos', value: progreso.length,           color: '#39A900', icon: 'mdi-book-multiple-outline' },
            { label: 'En curso',         value: cursosActivos.length,      color: '#1976D2', icon: 'mdi-play-circle-outline' },
            { label: 'Graduado en',      value: progreso.filter(r=>r.estado==='graduado').length, color: '#E65100', icon: 'mdi-school-outline' },
          ]" :key="i" cols="4">
            <v-card rounded="xl" elevation="0" class="stat-card pa-4 text-center">
              <v-icon :color="s.color" size="26" class="mb-1">{{ s.icon }}</v-icon>
              <div class="text-h5 font-weight-black" :style="`color:${s.color}`">{{ s.value }}</div>
              <div class="text-caption text-grey">{{ s.label }}</div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Lista de cursos -->
        <h3 class="text-h6 font-weight-bold mb-4">Mis Cursos</h3>

        <v-row>
          <v-col v-for="reg in progreso" :key="reg.id" cols="12" sm="6" lg="4">
            <v-card
              rounded="xl" elevation="0" class="curso-card pa-5"
              :to="`/dashboard/estudiante/cursos/${reg.id}`"
            >
              <!-- Estado -->
              <div class="d-flex justify-space-between align-center mb-4">
                <v-chip
                  :color="estadoConfig[reg.estado]?.color"
                  :prepend-icon="estadoConfig[reg.estado]?.icon"
                  size="small" rounded="lg" class="font-weight-bold"
                >
                  {{ estadoConfig[reg.estado]?.label }}
                </v-chip>
                <v-icon size="16" color="grey">mdi-arrow-top-right</v-icon>
              </div>

              <!-- Nombre curso -->
              <div class="text-h6 font-weight-bold mb-1 nombre-clamp">
                {{ reg.curso?.nombre ?? 'Curso' }}
              </div>
              <div class="text-caption text-grey mb-3">
                {{ reg.curso?.regional?.nombre ?? '—' }} ·
                {{ formatFecha(reg.curso?.fecha_inicio) }}
              </div>

              <v-divider class="mb-3" />

              <!-- Progreso del curso -->
              <div class="d-flex justify-space-between text-caption text-grey mb-1">
                <span>Progreso del curso</span>
                <span class="font-weight-bold">{{ porcentaje(reg.curso) }}%</span>
              </div>
              <v-progress-linear
                :model-value="porcentaje(reg.curso)"
                color="#39A900"
                bg-color="rgba(0,0,0,0.08)"
                rounded height="7"
              />

              <div class="mt-3 text-caption text-grey-darken-1">
                {{ reg.curso?.horas_cumplidas }} / {{ reg.curso?.horas_requeridas }} horas completadas
              </div>

              <!-- CTA -->
              <v-btn
                block size="small" variant="tonal" color="#39A900"
                rounded="lg" class="mt-4"
                :to="`/dashboard/estudiante/cursos/${reg.curso?.id ?? reg.curso_id}`"
              >
                Ver mis notas y asistencias
              </v-btn>
            </v-card>
          </v-col>
        </v-row>
      </template>
    </template>
  </div>
</template>

<style scoped>
.stat-card { background: rgba(255,255,255,0.7); border: 1px solid rgba(0,0,0,0.06); }
.curso-card { background: rgba(200,215,200,0.55); backdrop-filter: blur(4px); cursor: pointer; transition: transform 0.2s; }
.curso-card:hover { transform: translateY(-3px); }
.nombre-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>