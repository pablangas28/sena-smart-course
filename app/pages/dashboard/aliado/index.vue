<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'aliado' })

const auth         = useAuthStore()
const { apiFetch } = useApi()

const cursos  = ref([])
const loading = ref(true)
const error   = ref('')

async function cargarDatos() {
  loading.value = true
  try {
    cursos.value = await apiFetch('/cursos')
  } catch {
    error.value = 'No se pudieron cargar los datos.'
  } finally {
    loading.value = false
  }
}

onMounted(cargarDatos)

const cursosActivos    = computed(() => cursos.value.filter(c => c.estado === 'activo'))
const cursosFinalizados = computed(() => cursos.value.filter(c => c.estado === 'finalizado'))
const estadoColor = { activo: 'success', finalizado: 'blue-grey', cancelado: 'error' }

function formatFecha(f) {
  if (!f) return '—'
  return new Date(f + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

function porcentaje(curso) {
  if (!curso.horas_requeridas) return 0
  return Math.min(100, Math.round((curso.horas_cumplidas / curso.horas_requeridas) * 100))
}

const accesos = [
  { label: 'Mis Cursos',          icon: 'mdi-book-education-outline',       to: '/dashboard/aliado/cursos',      color: '#7B1FA2' },
  { label: 'Ver Estudiantes',     icon: 'mdi-account-group-outline',         to: '/dashboard/aliado/estudiantes', color: '#1976D2' },
  { label: 'Nuevo Formulario',    icon: 'mdi-file-document-plus-outline',    to: '/dashboard/aliado/formulario',  color: '#39A900' },
]
</script>

<template>
  <div class="pa-6">

    <div class="mb-6">
      <h2 class="text-h5 font-weight-bold">Panel del Aliado</h2>
      <p class="text-body-2 text-grey-darken-1 mt-1">
        Bienvenido/a, <strong>{{ auth.user?.nombre }}</strong>.
        Aquí tienes los cursos en los que participas como aliado.
      </p>
    </div>

    <div v-if="loading">
      <v-row><v-col v-for="i in 3" :key="i" cols="12" sm="4"><v-skeleton-loader type="card" rounded="xl" /></v-col></v-row>
    </div>

    <template v-else>
      <!-- Stats rápidas -->
      <v-row class="mb-6">
        <v-col v-for="(s, i) in [
          { label: 'Total Cursos',    value: cursos.length,            color: '#7B1FA2', icon: 'mdi-book-multiple-outline' },
          { label: 'Activos',         value: cursosActivos.length,     color: '#39A900', icon: 'mdi-play-circle-outline' },
          { label: 'Finalizados',     value: cursosFinalizados.length, color: '#1976D2', icon: 'mdi-check-circle-outline' },
        ]" :key="i" cols="4">
          <v-card rounded="xl" elevation="0" class="stat-card pa-4 text-center">
            <v-icon :color="s.color" size="28" class="mb-1">{{ s.icon }}</v-icon>
            <div class="text-h5 font-weight-black" :style="`color:${s.color}`">{{ s.value }}</div>
            <div class="text-caption text-grey">{{ s.label }}</div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Accesos rápidos -->
      <h3 class="text-h6 font-weight-bold mb-3">Acciones rápidas</h3>
      <v-row class="mb-6">
        <v-col v-for="acc in accesos" :key="acc.label" cols="12" sm="4">
          <v-card rounded="xl" elevation="0" class="acceso-card pa-4 d-flex align-center ga-3" :to="acc.to">
            <v-avatar :color="acc.color + '22'" size="44">
              <v-icon :color="acc.color" size="22">{{ acc.icon }}</v-icon>
            </v-avatar>
            <span class="text-body-2 font-weight-semibold">{{ acc.label }}</span>
            <v-spacer />
            <v-icon size="16" color="grey">mdi-chevron-right</v-icon>
          </v-card>
        </v-col>
      </v-row>

      <!-- Cursos activos -->
      <h3 class="text-h6 font-weight-bold mb-3">Cursos activos</h3>

      <v-alert v-if="error" type="error" variant="tonal" rounded="xl" class="mb-4">{{ error }}</v-alert>

      <div v-if="cursosActivos.length === 0" class="text-center pa-10">
        <v-icon size="56" color="black-lighten-1">mdi-book-open-blank-variant-outline</v-icon>
        <p class="text-body-2 text-black mt-3">No tienes cursos activos actualmente.</p>
      </div>

      <v-row v-else>
        <v-col v-for="curso in cursosActivos" :key="curso.id" cols="12" sm="6" md="4">
          <v-card rounded="xl" elevation="0" class="curso-card pa-5" :to="`/dashboard/aliado/cursos/${curso.id}`">
            <div class="d-flex justify-space-between align-center mb-3">
              <v-chip color="success" size="small" rounded="lg" class="font-weight-bold">Activo</v-chip>
              <v-icon size="16" color="grey">mdi-arrow-top-right</v-icon>
            </div>
            <div class="text-body-1 font-weight-bold mb-1">{{ curso.nombre }}</div>
            <div class="text-caption text-grey mb-3">{{ curso.regional?.nombre ?? '—' }} · {{ formatFecha(curso.fecha_inicio) }}</div>
            <v-progress-linear :model-value="porcentaje(curso)" color="#7B1FA2" bg-color="rgba(0,0,0,0.08)" rounded height="6" />
            <div class="text-right text-caption text-grey mt-1">{{ curso.horas_cumplidas }}/{{ curso.horas_requeridas }}h</div>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </div>
</template>

<style scoped>
.stat-card   { background: rgba(255,255,255,0.7); border: 1px solid rgba(0,0,0,0.06); }
.acceso-card { background: rgba(200,215,200,0.55); backdrop-filter: blur(4px); transition: transform 0.2s; cursor: pointer; }
.acceso-card:hover { transform: translateY(-2px); }
.curso-card  { background: rgba(200,215,200,0.55); backdrop-filter: blur(4px); cursor: pointer; transition: transform 0.2s; }
.curso-card:hover { transform: translateY(-3px); }
</style>