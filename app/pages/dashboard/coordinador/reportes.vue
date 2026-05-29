<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'coordinador' })

const auth         = useAuthStore()
const { apiFetch } = useApi()
const config       = useRuntimeConfig()

const reportes   = ref([])
const loading    = ref(true)
const error      = ref('')
const busqueda   = ref('')
const token      = useCookie('token')

async function cargarReportes() {
  loading.value = true
  try {
    reportes.value = await apiFetch('/reportes/cursos')
  } catch {
    error.value = 'No se pudieron cargar los reportes.'
  } finally {
    loading.value = false
  }
}

onMounted(cargarReportes)

const reportesFiltrados = computed(() => {
  if (!busqueda.value.trim()) return reportes.value
  const q = busqueda.value.toLowerCase()
  return reportes.value.filter(r => r.nombre?.toLowerCase().includes(q))
})

// Totales generales
const totalActivos    = computed(() => reportes.value.reduce((a, r) => a + (r.activos ?? 0), 0))
const totalDesertados = computed(() => reportes.value.reduce((a, r) => a + (r.desertados ?? 0), 0))
const totalGraduados  = computed(() => reportes.value.reduce((a, r) => a + (r.graduados ?? 0), 0))

// descargar PDF
async function descargarPdf(cursoId, tipo = 'pdf') {
  const rutas = {
    pdf:            `/reportes/cursos/${cursoId}/pdf`,
    asistencia:     `/reportes/cursos/${cursoId}/asistencia-pdf`,
    calificaciones: `/reportes/cursos/${cursoId}/calificaciones-pdf`,
  }

  const url = `${config.public.apiBase}${rutas[tipo]}`

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Accept': 'application/pdf',
      }
    })

    if (!response.ok) throw new Error(`Error ${response.status}`)

    const blob = await response.blob()
    const objectUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = objectUrl
    link.download = `reporte-${tipo}-${cursoId}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(objectUrl)

  } catch (err) {
    console.error('Error descargando PDF:', err)
  }
}

const estadoColor = { activo: 'success', finalizado: 'blue-grey', cancelado: 'error' }
</script>

<template>
  <div class="pa-6">

    <div class="mb-6">
      <h2 class="text-h5 font-weight-bold">Reportes</h2>
      <p class="text-body-2 text-grey-darken-1 mt-1">Resumen global y descarga de PDFs por curso.</p>
    </div>

    <!-- Stats globales -->
    <v-row class="mb-6">
      <v-col v-for="(s, i) in [
        { label: 'Aprendices activos',    value: totalActivos,    color: '#39A900', icon: 'mdi-account-check-outline' },
        { label: 'Desertados',             value: totalDesertados, color: 'error',   icon: 'mdi-account-off-outline' },
        { label: 'Graduados',              value: totalGraduados,  color: '#1976D2', icon: 'mdi-school-outline' },
        { label: 'Total cursos',           value: reportes.length, color: '#7B1FA2', icon: 'mdi-book-multiple-outline' },
      ]" :key="i" cols="6" sm="3">
        <v-card rounded="xl" elevation="0" class="stat-card pa-4 text-center">
          <v-icon :color="s.color" size="28" class="mb-1">{{ s.icon }}</v-icon>
          <div class="text-h4 font-weight-black" :style="`color:${typeof s.color === 'string' && s.color.startsWith('#') ? s.color : ''}`">
            <span :class="typeof s.color === 'string' && !s.color.startsWith('#') ? `text-${s.color}` : ''">
              {{ s.value }}
            </span>
          </div>
          <div class="text-caption text-grey">{{ s.label }}</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Búsqueda -->
    <v-text-field
      v-model="busqueda"
      placeholder="Buscar curso..."
      variant="outlined" rounded="lg" density="compact"
      prepend-inner-icon="mdi-magnify" hide-details bg-color="white"
      class="mb-5" style="max-width:340px"
      clearable
    />

    <v-alert v-if="error" type="error" variant="tonal" rounded="lg" class="mb-4">{{ error }}</v-alert>

    <div v-if="loading">
      <v-skeleton-loader v-for="i in 4" :key="i" type="list-item-three-line" class="mb-3" rounded="xl" />
    </div>

    <v-row v-else>
      <v-col v-for="r in reportesFiltrados" :key="r.id" cols="12" md="6">
        <v-card rounded="xl" elevation="0" class="reporte-card pa-5">

          <!-- Header -->
          <div class="d-flex align-start justify-space-between mb-3">
            <div>
              <div class="text-body-1 font-weight-bold">{{ r.nombre }}</div>
              <div class="text-caption text-grey">{{ r.regional?.nombre ?? '—' }}</div>
            </div>
            <v-chip :color="estadoColor[r.estado]" size="x-small" rounded="lg" class="font-weight-bold text-uppercase">
              {{ r.estado }}
            </v-chip>
          </div>

          <!-- Stats del curso -->
          <div class="d-flex ga-3 mb-4">
            <div class="mini-stat">
              <span class="font-weight-bold text-success">{{ r.activos ?? 0 }}</span>
              <span class="text-caption text-grey"> activos</span>
            </div>
            <div class="mini-stat">
              <span class="font-weight-bold text-error">{{ r.desertados ?? 0 }}</span>
              <span class="text-caption text-grey"> desertados</span>
            </div>
            <div class="mini-stat">
              <span class="font-weight-bold text-primary">{{ r.graduados ?? 0 }}</span>
              <span class="text-caption text-grey"> graduados</span>
            </div>
          </div>

          <v-divider class="mb-3" />

          <!-- Botones descarga -->
          <div class="d-flex ga-2 flex-wrap">
            <v-btn size="x-small" variant="tonal" color="#1976D2" rounded="lg" prepend-icon="mdi-file-pdf-box"
              @click="descargarPdf(r.id, 'pdf')">
              Curso
            </v-btn>
            <v-btn size="x-small" variant="tonal" color="#39A900" rounded="lg" prepend-icon="mdi-account-check-outline"
              @click="descargarPdf(r.id, 'asistencia')">
              Asistencia
            </v-btn>
            <v-btn size="x-small" variant="tonal" color="#7B1FA2" rounded="lg" prepend-icon="mdi-star-outline"
              @click="descargarPdf(r.id, 'calificaciones')">
              Calificaciones
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.stat-card    { background: rgba(255,255,255,0.7); border: 1px solid rgba(0,0,0,0.06); }
.reporte-card { background: rgba(200,215,200,0.55); backdrop-filter: blur(4px); }
.mini-stat    { background: rgba(255,255,255,0.6); border-radius: 8px; padding: 4px 10px; }
</style>