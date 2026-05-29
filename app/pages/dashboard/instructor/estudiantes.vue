<script setup>
import { ref, reactive, computed, onMounted } from 'vue'

definePageMeta({ layout: 'instructor' })

const { apiFetch } = useApi()

const cursos      = ref([])
const estudiantes = ref([])
const loading     = ref(true)
const error       = ref('')
const busqueda    = ref('')
const filtroCurso = ref('todos')
const snackbar    = reactive({ show: false, text: '', color: 'success' })

async function cargarTodo() {
  loading.value = true
  try {
    const cursosData = await apiFetch('/cursos')
    cursos.value = cursosData

    const resultados = await Promise.all(
      cursosData.map(c =>
        apiFetch(`/cursos/${c.id}/estudiantes`)
          .then(lista => lista.map(e => ({ ...e, cursoNombre: c.nombre, cursoId: c.id })))
          .catch(() => [])
      )
    )
    estudiantes.value = resultados.flat()
  } catch {
    error.value = 'No se pudieron cargar los aprendices.'
  } finally {
    loading.value = false
  }
}

onMounted(cargarTodo)

const estudiantesFiltrados = computed(() => {
  let lista = estudiantes.value
  if (filtroCurso.value !== 'todos') {
    lista = lista.filter(e => e.cursoId === Number(filtroCurso.value))
  }
  if (busqueda.value.trim()) {
    const q = busqueda.value.toLowerCase()
    lista = lista.filter(e =>
      `${e.nombre} ${e.apellidos} ${e.user?.email ?? ''}`.toLowerCase().includes(q)
    )
  }
  return lista
})

const estadoColor = { activo: 'success', desertado: 'error', graduado: 'blue' }

async function cambiarEstado(reg, nuevoEstado) {
  try {
    await apiFetch(`/estudiantes/${reg.id}/estado`, { method: 'PATCH', body: { estado: nuevoEstado } })
    const idx = estudiantes.value.findIndex(e => e.id === reg.id)
    if (idx !== -1) estudiantes.value[idx].estado = nuevoEstado
    snackbar.text = `Estado actualizado a ${nuevoEstado}.`
    snackbar.color = 'success'
    snackbar.show = true
  } catch {
    snackbar.text = 'No se pudo cambiar el estado.'
    snackbar.color = 'error'
    snackbar.show = true
  }
}
</script>

<template>
  <div class="pa-6">

    <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-6">
      <div>
        <h2 class="text-h5 font-weight-bold">Aprendices</h2>
        <p class="text-body-2 text-grey-darken-1 mt-1">
          Todos los aprendices inscritos en tus cursos.
        </p>
      </div>
      <v-chip variant="tonal" color="#39A900" size="small">
        {{ estudiantesFiltrados.length }} aprendiz{{ estudiantesFiltrados.length !== 1 ? 's' : '' }}
      </v-chip>
    </div>

    <!-- Filtros -->
    <div class="d-flex ga-3 flex-wrap align-center mb-5">
      <v-text-field
        v-model="busqueda"
        placeholder="Buscar por nombre o email..."
        variant="outlined" rounded="lg" density="compact"
        prepend-inner-icon="mdi-magnify" hide-details bg-color="white"
        style="max-width:280px" clearable
      />
      <v-select
        v-model="filtroCurso"
        :items="[{ title: 'Todos los cursos', value: 'todos' }, ...cursos.map(c => ({ title: c.nombre, value: String(c.id) }))]"
        variant="outlined" rounded="lg" density="compact"
        hide-details bg-color="white" style="max-width:260px"
      />
    </div>

    <v-alert v-if="error" type="error" variant="tonal" rounded="lg" class="mb-4">{{ error }}</v-alert>

    <div v-if="loading">
      <v-skeleton-loader v-for="i in 5" :key="i" type="list-item-avatar-two-line" class="mb-2" rounded="xl" />
    </div>

    <div v-else-if="estudiantesFiltrados.length === 0" class="text-center pa-12">
      <v-icon size="64" color="black-lighten-1">mdi-account-off-outline</v-icon>
      <p class="text-body-1 text-black mt-3">
        {{ estudiantes.length === 0
          ? 'Aún no hay aprendices inscritos en tus cursos.'
          : 'No se encontraron resultados.' }}
      </p>
    </div>

    <v-card v-else rounded="xl" elevation="0" class="tabla-card">
      <v-table>
        <thead>
          <tr>
            <th>Aprendiz</th>
            <th class="d-none d-sm-table-cell">Curso</th>
            <th>Estado</th>
            <th class="text-center">Cambiar estado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="est in estudiantesFiltrados" :key="est.id" class="est-row">
            <td>
              <div class="d-flex align-center ga-3 py-2">
                <v-avatar color="#39A900" size="36" class="text-white text-body-2 font-weight-bold flex-shrink-0">
                  {{ est.nombre[0] }}{{ est.apellidos[0] }}
                </v-avatar>
                <div>
                  <div class="font-weight-medium text-body-2">{{ est.nombre }} {{ est.apellidos }}</div>
                  <div class="text-caption text-grey">{{ est.user?.email }}</div>
                </div>
              </div>
            </td>
            <td class="text-body-2 d-none d-sm-table-cell">
              <nuxt-link
                :to="`/dashboard/instructor/cursos/${est.cursoId}`"
                class="text-decoration-none"
                style="color:#39A900"
              >
                {{ est.cursoNombre }}
              </nuxt-link>
            </td>
            <td>
              <v-chip
                :color="estadoColor[est.estado]"
                size="x-small" rounded="lg"
                class="font-weight-bold text-uppercase"
              >
                {{ est.estado }}
              </v-chip>
            </td>
            <td class="text-center">
              <v-menu>
                <template #activator="{ props }">
                  <v-btn v-bind="props" size="x-small" variant="tonal" color="#39A900" rounded="lg">
                    Cambiar <v-icon end size="14">mdi-chevron-down</v-icon>
                  </v-btn>
                </template>
                <v-list rounded="xl" elevation="4" min-width="160">
                  <v-list-item
                    v-for="estado in ['activo','desertado','graduado'].filter(e => e !== est.estado)"
                    :key="estado"
                    :title="estado.charAt(0).toUpperCase() + estado.slice(1)"
                    :prepend-icon="estado === 'activo' ? 'mdi-play-circle-outline' : estado === 'graduado' ? 'mdi-school-outline' : 'mdi-close-circle-outline'"
                    @click="cambiarEstado(est, estado)"
                  />
                </v-list>
              </v-menu>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" rounded="lg" timeout="3000" location="bottom right">
      {{ snackbar.text }}
      <template #actions><v-btn variant="text" @click="snackbar.show = false">Cerrar</v-btn></template>
    </v-snackbar>
  </div>
</template>

<style scoped>
.tabla-card { background: rgba(255,255,255,0.75); border: 1px solid rgba(0,0,0,0.06); }
.est-row:hover { background: rgba(57,169,0,0.04) !important; }
</style>