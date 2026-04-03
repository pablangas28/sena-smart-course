<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'aliado' })

const auth         = useAuthStore()
const { apiFetch } = useApi()

const cursos       = ref([])
const loading      = ref(true)
const error        = ref('')
const filtroEstado = ref('todos')

const filtros = [
  { label: 'Todos',       value: 'todos' },
  { label: 'Activos',     value: 'activo' },
  { label: 'Finalizados', value: 'finalizado' },
  { label: 'Cancelados',  value: 'cancelado' },
]

async function cargarCursos() {
  if (!navigator.onLine) { error.value = 'Sin conexión.'; loading.value = false; return }
  loading.value = true; error.value = ''
  try {
    const params = filtroEstado.value !== 'todos' ? `?estado=${filtroEstado.value}` : ''
    cursos.value = await apiFetch(`/cursos${params}`)
  } catch {
    error.value = 'No se pudieron cargar los cursos.'
  } finally {
    loading.value = false
  }
}

watch(filtroEstado, cargarCursos)
onMounted(cargarCursos)

const estadoConfig = {
  activo:     { color: 'success',   icon: 'mdi-play-circle-outline' },
  finalizado: { color: 'blue-grey', icon: 'mdi-check-circle-outline' },
  cancelado:  { color: 'error',     icon: 'mdi-close-circle-outline' },
}

function formatFecha(f) {
  if (!f) return '—'
  return new Date(f + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

function porcentaje(curso) {
  if (!curso.horas_requeridas) return 0
  return Math.min(100, Math.round((curso.horas_cumplidas / curso.horas_requeridas) * 100))
}
</script>

<template>
  <div class="pa-6">
    <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-6">
      <div>
        <h2 class="text-h5 font-weight-bold">Mis Cursos</h2>
        <p class="text-body-2 text-grey-darken-1 mt-1">
          Bienvenido, <strong>{{ auth.user?.nombre }}</strong>. Cursos en los que participas como aliado.
        </p>
      </div>
      <v-btn color="#7B1FA2" rounded="lg" prepend-icon="mdi-plus" to="/dashboard/aliado/cursos/nuevo">
        Nuevo Curso
      </v-btn>
    </div>

    <div class="d-flex ga-2 flex-wrap mb-5">
      <v-btn
        v-for="f in filtros" :key="f.value" size="small" rounded="lg"
        :variant="filtroEstado === f.value ? 'flat' : 'tonal'"
        :color="filtroEstado === f.value ? '#7B1FA2' : 'grey'"
        @click="filtroEstado = f.value"
      >{{ f.label }}</v-btn>
    </div>

    <v-alert v-if="error" type="error" variant="tonal" rounded="lg" class="mb-4" closable>{{ error }}</v-alert>

    <v-row v-if="loading">
      <v-col v-for="i in 4" :key="i" cols="12" sm="6" lg="4">
        <v-skeleton-loader type="card" rounded="xl" />
      </v-col>
    </v-row>

    <div v-else-if="cursos.length === 0" class="text-center pa-16">
      <v-icon size="72" color="grey-lighten-1">mdi-book-open-blank-variant-outline</v-icon>
      <p class="text-h6 font-weight-medium text-grey mt-4">
        {{ filtroEstado === 'todos' ? 'Aún no tienes cursos registrados' : `No hay cursos ${filtroEstado}s` }}
      </p>
      <v-btn v-if="filtroEstado === 'todos'" color="#7B1FA2" rounded="lg" class="mt-4" prepend-icon="mdi-plus" to="/dashboard/aliado/cursos/nuevo">
        Crear primer curso
      </v-btn>
    </div>

    <v-row v-else>
      <v-col v-for="curso in cursos" :key="curso.id" cols="12" sm="6" lg="4">
        <v-card rounded="xl" elevation="0" class="curso-card pa-5 h-100" :to="`/dashboard/aliado/cursos/${curso.id}`">
          <div class="d-flex justify-space-between align-start mb-4">
            <v-chip :color="estadoConfig[curso.estado]?.color" :prepend-icon="estadoConfig[curso.estado]?.icon" size="small" rounded="lg" class="font-weight-bold">
              {{ curso.estado.charAt(0).toUpperCase() + curso.estado.slice(1) }}
            </v-chip>
            <v-icon size="18" color="rgba(0,0,0,0.3)">mdi-arrow-top-right</v-icon>
          </div>
          <div class="text-h6 font-weight-bold mb-1 nombre-clamp">{{ curso.nombre }}</div>
          <div class="text-body-2 text-grey-darken-1 mb-4 desc-clamp">{{ curso.descripcion ?? 'Sin descripción.' }}</div>
          <v-divider class="mb-3" />
          <div class="d-flex flex-column ga-1 text-body-2 text-grey-darken-2 mb-3">
            <div class="d-flex align-center ga-2">
              <v-icon size="14" color="#7B1FA2">mdi-map-marker-outline</v-icon>
              {{ curso.regional?.nombre ?? '—' }}
            </div>
            <div class="d-flex align-center ga-2">
              <v-icon size="14" color="#7B1FA2">mdi-calendar-range</v-icon>
              {{ formatFecha(curso.fecha_inicio) }}
              <span v-if="curso.fecha_fin"> → {{ formatFecha(curso.fecha_fin) }}</span>
            </div>
          </div>
          <div class="d-flex justify-space-between text-caption text-grey mb-1">
            <span>Horas cumplidas</span>
            <span class="font-weight-bold">{{ curso.horas_cumplidas }}/{{ curso.horas_requeridas }}h</span>
          </div>
          <v-progress-linear :model-value="porcentaje(curso)" color="#7B1FA2" bg-color="rgba(0,0,0,0.08)" rounded height="7" />
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.curso-card { background: rgba(200,215,200,0.55); backdrop-filter: blur(4px); border: 1px solid rgba(123,31,162,0.1); cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
.curso-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important; }
.nombre-clamp, .desc-clamp { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
</style>