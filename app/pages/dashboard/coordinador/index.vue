<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'coordinador' })

const auth         = useAuthStore()
const { apiFetch } = useApi()

const stats   = ref(null)
const cursos  = ref([])
const loading = ref(true)
const error   = ref('')

async function cargarDatos() {
  loading.value = true
  try {
    const [reportes, cursosData] = await Promise.all([
      apiFetch('/reportes/cursos'),
      apiFetch('/cursos'),
    ])
    stats.value  = reportes
    cursos.value = cursosData
  } catch {
    error.value = 'No se pudieron cargar los datos del panel.'
  } finally {
    loading.value = false
  }
}

onMounted(cargarDatos)

// Totales calculados
const totalCursos      = computed(() => cursos.value.length)
const cursosActivos    = computed(() => cursos.value.filter(c => c.estado === 'activo').length)
const totalEstudiantes = computed(() => stats.value?.reduce((acc, r) => acc + (r.activos ?? 0) + (r.desertados ?? 0) + (r.graduados ?? 0), 0) ?? 0)
const totalGraduados   = computed(() => stats.value?.reduce((acc, r) => acc + (r.graduados ?? 0), 0) ?? 0)

const accesos = [
  { label: 'Ver todos los cursos', icon: 'mdi-book-education-outline', to: '/dashboard/coordinador/cursos',     color: '#39A900' },
  { label: 'Gestionar usuarios',   icon: 'mdi-account-group-outline',  to: '/dashboard/coordinador/usuarios',    color: '#1976D2' },
  { label: 'Regionales',           icon: 'mdi-map-marker-outline',     to: '/dashboard/coordinador/regionales',  color: '#7B1FA2' },
  { label: 'Reportes y PDFs',      icon: 'mdi-chart-bar',              to: '/dashboard/coordinador/reportes',    color: '#E65100' },
]

const estadoColor = { activo: 'success', finalizado: 'blue-grey', cancelado: 'error' }

function formatFecha(f) {
  if (!f) return '—'
  return new Date(f + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div class="pa-6">

    <!-- Saludo -->
    <div class="mb-6">
      <h2 class="text-h5 font-weight-bold">Panel de Coordinación</h2>
      <p class="text-body-2 text-grey-darken-1 mt-1">
        Bienvenido/a, <strong>{{ auth.user?.nombre }}</strong>. Aquí tienes el resumen general.
      </p>
    </div>

    <div v-if="loading">
      <v-row>
        <v-col v-for="i in 4" :key="i" cols="6" sm="3">
          <v-skeleton-loader type="card" rounded="xl" />
        </v-col>
      </v-row>
    </div>

    <template v-else>
      <!-- Stats -->
      <v-row class="mb-6">
        <v-col v-for="(stat, i) in [
          { label: 'Total Cursos',     value: totalCursos,      icon: 'mdi-book-multiple-outline',   color: '#39A900' },
          { label: 'Cursos Activos',   value: cursosActivos,    icon: 'mdi-play-circle-outline',     color: '#1976D2' },
          { label: 'Aprendices',      value: totalEstudiantes, icon: 'mdi-account-group-outline',   color: '#7B1FA2' },
          { label: 'Graduados',        value: totalGraduados,   icon: 'mdi-school-outline',          color: '#E65100' },
        ]" :key="i" cols="6" sm="3">
          <v-card rounded="xl" elevation="0" class="stat-card pa-5 text-center">
            <v-icon :color="stat.color" size="32" class="mb-2">{{ stat.icon }}</v-icon>
            <div class="text-h4 font-weight-black" :style="`color:${stat.color}`">{{ stat.value }}</div>
            <div class="text-caption text-grey">{{ stat.label }}</div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Accesos rápidos -->
      <h3 class="text-h6 font-weight-bold mb-3">Accesos rápidos</h3>
      <v-row class="mb-6">
        <v-col v-for="acc in accesos" :key="acc.label" cols="12" sm="6" md="3">
          <v-card
            rounded="xl" elevation="0" class="acceso-card pa-5 d-flex align-center ga-3"
            :to="acc.to" style="cursor:pointer;"
          >
            <v-avatar :color="acc.color + '22'" size="48">
              <v-icon :color="acc.color" size="24">{{ acc.icon }}</v-icon>
            </v-avatar>
            <div class="text-body-2 font-weight-semibold">{{ acc.label }}</div>
            <v-spacer />
            <v-icon size="18" color="grey">mdi-chevron-right</v-icon>
          </v-card>
        </v-col>
      </v-row>

      <!-- Últimos cursos -->
      <div class="d-flex justify-space-between align-center mb-3">
        <h3 class="text-h6 font-weight-bold">Todos los cursos</h3>
        <v-btn size="small" variant="text" color="#39A900" to="/dashboard/coordinador/cursos">
          Ver todos
        </v-btn>
      </div>

      <v-alert v-if="error" type="error" variant="tonal" rounded="xl" class="mb-4">{{ error }}</v-alert>

      <v-table rounded="xl" class="coord-table">
        <thead>
          <tr>
            <th>Curso</th>
            <th>Regional</th>
            <th>Inicio</th>
            <th>Estado</th>
            <th class="text-center">Aprendices</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="curso in cursos.slice(0, 8)" :key="curso.id" class="table-row" style="cursor:pointer"
            @click="navigateTo(`/dashboard/coordinador/cursos/${curso.id}`)">
            <td>
              <div class="font-weight-medium text-body-2 py-2">{{ curso.nombre }}</div>
              <div class="text-caption text-grey">{{ curso.creado_por?.nombre }}</div>
            </td>
            <td class="text-body-2">{{ curso.regional?.nombre ?? '—' }}</td>
            <td class="text-body-2">{{ formatFecha(curso.fecha_inicio) }}</td>
            <td>
              <v-chip :color="estadoColor[curso.estado]" size="x-small" rounded="lg" class="font-weight-bold text-uppercase">
                {{ curso.estado }}
              </v-chip>
            </td>
            <td class="text-center">
              <span class="text-body-2 font-weight-bold">
                {{ stats?.find(r => r.id === curso.id)?.activos ?? 0 }}
              </span>
            </td>
          </tr>
        </tbody>
      </v-table>
    </template>
  </div>
</template>

<style scoped>
.stat-card  { background: rgba(255,255,255,0.7); border: 1px solid rgba(0,0,0,0.06); }
.acceso-card { background: rgba(200,215,200,0.55); backdrop-filter: blur(4px); transition: transform 0.2s; }
.acceso-card:hover { transform: translateY(-2px); }
.coord-table { background: rgba(255,255,255,0.7) !important; }
.table-row:hover { background: rgba(57,169,0,0.05) !important; }
</style>