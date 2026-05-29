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

const curso       = ref(null)
const clases      = ref([])
const estudiantes = ref([])
const formularios = ref([])
const loading     = ref(true)
const error       = ref('')
const tab         = ref('clases')
const snackbar    = reactive({ show: false, text: '', color: 'success' })

async function cargarTodo() {
  loading.value = true
  error.value   = ''
  try {
    const [cursoData, clasesData, estudiantesData, formulariosData] = await Promise.all([
      apiFetch(`/cursos/${cursoId}`),
      apiFetch(`/cursos/${cursoId}/clases`),
      apiFetch(`/cursos/${cursoId}/estudiantes`),
      props.soloLectura ? Promise.resolve([]) : apiFetch(`/cursos/${cursoId}/formularios`),
    ])
    curso.value       = cursoData
    clases.value      = clasesData
    estudiantes.value = estudiantesData
    formularios.value = formulariosData
  } catch (err) {
    error.value = err?.status === 403
      ? 'No tienes permisos para ver este curso.'
      : 'No se pudo cargar la información del curso.'
  } finally {
    loading.value = false
  }
}

onMounted(cargarTodo)

// ── Helpers ───────────────────────────────────────────────────────────────
const estadoConfig = {
  activo:     { color: 'success',   icon: 'mdi-play-circle-outline' },
  finalizado: { color: 'blue-grey', icon: 'mdi-check-circle-outline' },
  cancelado:  { color: 'error',     icon: 'mdi-close-circle-outline' },
}
const estadoEstColor = { activo: 'success', desertado: 'error', graduado: 'blue' }

function formatFecha(f) {
  if (!f) return '—'
  return new Date(f.includes('T') ? f : f + 'T00:00:00')
    .toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}
function formatFechaHora(fh) {
  if (!fh) return '—'
  return new Date(fh).toLocaleString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
function toast(text, color = 'success') { snackbar.text = text; snackbar.color = color; snackbar.show = true }

const porcentajeHoras = computed(() => {
  if (!curso.value?.horas_requeridas) return 0
  return Math.min(100, Math.round((curso.value.horas_cumplidas / curso.value.horas_requeridas) * 100))
})
const dashboardBase = computed(() => `/dashboard/${props.rolLayout}`)

// ════ CLASES ══════════════════════════════════════════════════════════════
const dialogClase         = ref(false)
const guardandoClase      = ref(false)
const claseEditando       = ref(null)
const confirmEliminarClase = ref(null)
const formClase = reactive({ tema: '', fecha_hora: '', tipo: 'presencial', duracion_horas: 2 })

function abrirNuevaClase() {
  claseEditando.value = null
  Object.assign(formClase, { tema: '', fecha_hora: '', tipo: 'presencial', duracion_horas: 2 })
  dialogClase.value = true
}
function abrirEditarClase(clase) {
  claseEditando.value = clase
  Object.assign(formClase, { tema: clase.tema, fecha_hora: clase.fecha_hora?.slice(0, 16) ?? '', tipo: clase.tipo, duracion_horas: clase.duracion_horas })
  dialogClase.value = true
}
async function guardarClase() {
  if (!formClase.tema || !formClase.fecha_hora) return
  guardandoClase.value = true
  try {
    const body = { ...formClase, fecha_hora: formClase.fecha_hora + ':00' }
    if (claseEditando.value) {
      const updated = await apiFetch(`/cursos/${cursoId}/clases/${claseEditando.value.id}`, { method: 'PATCH', body })
      const idx = clases.value.findIndex(c => c.id === claseEditando.value.id)
      if (idx !== -1) clases.value[idx] = updated
      toast('Clase actualizada.')
    } else {
      const nueva = await apiFetch(`/cursos/${cursoId}/clases`, { method: 'POST', body })
      clases.value.push(nueva)
      if (curso.value) curso.value.horas_cumplidas = (curso.value.horas_cumplidas ?? 0) + formClase.duracion_horas
      toast('Clase creada.')
    }
    dialogClase.value = false
  } catch { toast('Error al guardar la clase.', 'error') }
  finally { guardandoClase.value = false }
}
async function eliminarClase(clase) {
  try {
    await apiFetch(`/cursos/${cursoId}/clases/${clase.id}`, { method: 'DELETE' })
    clases.value = clases.value.filter(c => c.id !== clase.id)
    if (curso.value) curso.value.horas_cumplidas = Math.max(0, (curso.value.horas_cumplidas ?? 0) - clase.duracion_horas)
    confirmEliminarClase.value = null
    toast('Clase eliminada.')
  } catch { toast('No se pudo eliminar la clase.', 'error') }
}

// ════ FORMULARIOS ══════════════════════════════════════════════════════════
const generandoForm = ref(false)
const linkGenerado  = ref('')
const dialogLink    = ref(false)
const expiraEn      = ref('')

async function generarFormulario() {
  generandoForm.value = true
  try {
    const body      = expiraEn.value ? { expira_en: expiraEn.value + ':00' } : {}
    const resultado = await apiFetch(`/cursos/${cursoId}/formularios`, { method: 'POST', body })
    const token = resultado.formulario.token
    linkGenerado.value = `${window.location.origin}/inscripcion/${token}`
    // linkGenerado.value = resultado.link
    formularios.value.unshift(resultado.formulario)
    dialogLink.value   = true
    toast('¡Formulario generado!')
  } catch { toast('No se pudo generar el formulario.', 'error') }
  finally { generandoForm.value = false }
}
function copiarLink(link) { navigator.clipboard.writeText(link); toast('¡Link copiado!') }

// ════ ESTADO ════════════════════════════════════════════════════════════════
const dialogEstado    = ref(false)
const nuevoEstado     = ref('')
const cambiandoEstado = ref(false)

async function cambiarEstado() {
  cambiandoEstado.value = true
  try {
    const updated = await apiFetch(`/cursos/${cursoId}`, { method: 'PATCH', body: { estado: nuevoEstado.value } })
    curso.value.estado = updated.estado
    dialogEstado.value = false
    toast(`Curso marcado como ${updated.estado}.`)
  } catch { toast('No se pudo cambiar el estado.', 'error') }
  finally { cambiandoEstado.value = false }
}
</script>

<template>
  <div>
    <div v-if="loading" class="pa-6">
      <v-skeleton-loader type="article" class="mb-4" />
      <v-skeleton-loader type="table" />
    </div>

    <v-alert v-else-if="error" type="error" variant="tonal" class="ma-6" rounded="xl">{{ error }}</v-alert>

    <template v-else-if="curso">
      <!-- ── Hero ───────────────────────────────────────────────────── -->
      <div class="curso-hero pa-6 pb-0">
        <div class="d-flex align-center ga-2 mb-4 text-body-2 text-grey">
          <nuxt-link :to="`${dashboardBase}`" class="text-grey text-decoration-none hover-link">Mis Cursos</nuxt-link>
          <v-icon size="14">mdi-chevron-right</v-icon>
          <span class="text-truncate" style="max-width:280px">{{ curso.nombre }}</span>
        </div>

        <div class="d-flex align-start justify-space-between flex-wrap ga-3 mb-4">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">{{ curso.nombre }}</h1>
            <p class="text-body-1 text-grey-darken-1" style="max-width:600px">{{ curso.descripcion ?? 'Sin descripción.' }}</p>
          </div>
          <div class="d-flex ga-2 align-center">
            <v-chip :color="estadoConfig[curso.estado]?.color" :prepend-icon="estadoConfig[curso.estado]?.icon" size="default" rounded="lg" class="font-weight-bold">
              {{ curso.estado.charAt(0).toUpperCase() + curso.estado.slice(1) }}
            </v-chip>
            <!-- Menú cambiar estado solo si NO es solo lectura -->
            <v-menu v-if="!soloLectura">
              <template #activator="{ props: menuProps }">
                <v-btn v-bind="menuProps" icon variant="tonal" size="small" rounded="lg">
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-list rounded="xl" elevation="4" min-width="180">
                <v-list-item
                  v-for="est in ['activo','finalizado','cancelado'].filter(e => e !== curso.estado)"
                  :key="est"
                  :prepend-icon="estadoConfig[est]?.icon"
                  :title="`Marcar como ${est}`"
                  @click="nuevoEstado = est; dialogEstado = true"
                />
              </v-list>
            </v-menu>
          </div>
        </div>

        <!-- Stats -->
        <v-row class="mb-0" dense>
          <v-col v-for="(s, i) in [
            { label: 'Clases',      value: clases.length },
            { label: 'Aprendices', value: estudiantes.length },
            { label: 'Horas',       value: `${curso.horas_cumplidas}/${curso.horas_requeridas}h` },
            { label: 'Progreso',    value: `${porcentajeHoras}%` },
          ]" :key="i" cols="6" sm="3">
            <div class="stat-box text-center">
              <div class="text-h5 font-weight-bold" :style="`color:${colorAccent}`">{{ s.value }}</div>
              <div class="text-caption text-grey">{{ s.label }}</div>
            </div>
          </v-col>
        </v-row>

        <v-progress-linear :model-value="porcentajeHoras" :color="colorAccent" bg-color="rgba(0,0,0,0.08)" height="8" rounded class="mb-0" />

        <div class="d-flex flex-wrap ga-4 py-4 text-body-2 text-grey-darken-1">
          <div class="d-flex align-center ga-1"><v-icon size="16" :color="colorAccent">mdi-map-marker-outline</v-icon>{{ curso.regional?.nombre ?? '—' }}</div>
          <div class="d-flex align-center ga-1"><v-icon size="16" :color="colorAccent">mdi-calendar-start</v-icon>{{ formatFecha(curso.fecha_inicio) }}</div>
          <div v-if="curso.fecha_fin" class="d-flex align-center ga-1"><v-icon size="16" :color="colorAccent">mdi-calendar-end</v-icon>{{ formatFecha(curso.fecha_fin) }}</div>
          <div class="d-flex align-center ga-1"><v-icon size="16" :color="colorAccent">mdi-account-outline</v-icon>{{ curso.creado_por?.nombre ?? '—' }}</div>
        </div>

        <!-- Tabs — si soloLectura, esconder tab de formularios -->
        <v-tabs v-model="tab" :color="colorAccent" bg-color="transparent">
          <v-tab value="clases"><v-icon start size="18">mdi-calendar-clock</v-icon>Clases ({{ clases.length }})</v-tab>
          <v-tab value="estudiantes"><v-icon start size="18">mdi-account-group-outline</v-icon>Aprendices ({{ estudiantes.length }})</v-tab>
          <v-tab v-if="!soloLectura" value="formularios"><v-icon start size="18">mdi-link-variant</v-icon>Inscripciones</v-tab>
        </v-tabs>
      </div>

      <v-divider />

      <div class="pa-6">
        <v-tabs-window v-model="tab">

          <!-- ══ CLASES ════════════════════════════════════════════════ -->
          <v-tabs-window-item value="clases">
            <div class="d-flex justify-space-between align-center mb-4">
              <h3 class="text-h6 font-weight-bold">Clases del curso</h3>
              <v-btn v-if="!soloLectura" :color="colorAccent" rounded="lg" prepend-icon="mdi-plus" @click="abrirNuevaClase">
                Nueva Clase
              </v-btn>
            </div>

            <div v-if="clases.length === 0" class="text-center pa-12">
              <v-icon size="64" color="black-lighten-1">mdi-calendar-blank-outline</v-icon>
              <p class="text-body-1 text-black mt-3">No hay clases registradas aún.</p>
            </div>

            <v-row v-else>
              <v-col v-for="(clase, i) in clases" :key="clase.id" cols="12" sm="6" lg="4">
                <v-card rounded="xl" elevation="0" class="clase-card pa-4">
                  <div class="d-flex align-start justify-space-between mb-3">
                    <div class="d-flex align-center ga-2">
                      <v-avatar color="#0a1628" size="36" class="text-white text-body-2 font-weight-bold">{{ i + 1 }}</v-avatar>
                      <v-chip :color="clase.tipo === 'presencial' ? 'blue' : 'purple'" size="x-small" rounded="lg">{{ clase.tipo }}</v-chip>
                    </div>
                    <!-- Acciones solo si NO es solo lectura -->
                    <div v-if="!soloLectura" class="d-flex ga-1">
                      <v-btn icon size="x-small" variant="text" @click="abrirEditarClase(clase)"><v-icon size="16">mdi-pencil</v-icon></v-btn>
                      <v-btn icon size="x-small" variant="text" color="error" @click="confirmEliminarClase = clase"><v-icon size="16">mdi-delete-outline</v-icon></v-btn>
                    </div>
                  </div>

                  <div class="text-body-1 font-weight-semibold mb-2 nombre-clase">{{ clase.tema }}</div>
                  <div class="d-flex flex-column ga-1 text-caption text-grey">
                    <div class="d-flex align-center ga-1"><v-icon size="13">mdi-calendar</v-icon>{{ formatFechaHora(clase.fecha_hora) }}</div>
                    <div class="d-flex align-center ga-1"><v-icon size="13">mdi-clock-outline</v-icon>{{ clase.duracion_horas }}h</div>
                  </div>

                  <!-- Botón ver asistencia solo si NO es solo lectura -->
                  <template v-if="!soloLectura">
                    <v-divider class="my-3" />
                    <v-btn block size="small" variant="tonal" :color="colorAccent" rounded="lg"
                      :to="`${dashboardBase}/cursos/${cursoId}/clases/${clase.id}`">
                      Ver asistencia y notas
                    </v-btn>
                  </template>
                </v-card>
              </v-col>
            </v-row>
          </v-tabs-window-item>

          <!-- ══ ESTUDIANTES ═══════════════════════════════════════════ -->
          <v-tabs-window-item value="estudiantes">
            <div class="d-flex justify-space-between align-center mb-4">
              <h3 class="text-h6 font-weight-bold">Aprendices inscritos</h3>
              <v-chip color="grey" variant="tonal" size="small">{{ estudiantes.length }} registrados</v-chip>
            </div>

            <div v-if="estudiantes.length === 0" class="text-center pa-12">
              <v-icon size="64" color="black-lighten-1">mdi-account-off-outline</v-icon>
              <p class="text-body-1 text-black mt-3">Aún no hay Aprendices inscritos.</p>
              <v-btn v-if="!soloLectura" :color="colorAccent" rounded="lg" class="mt-4" prepend-icon="mdi-link-plus" @click="tab = 'formularios'">
                Ir a Inscripciones
              </v-btn>
            </div>

            <v-table v-else rounded="xl" class="estudiantes-table">
              <thead>
                <tr>
                  <th>Aprendiz</th>
                  <th>Celular</th>
                  <th>Estado</th>
                  <th v-if="!soloLectura" class="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="reg in estudiantes" :key="reg.id">
                  <td>
                    <div class="d-flex align-center ga-2 py-2">
                      <v-avatar color="#0a1628" size="32" class="text-white text-caption font-weight-bold">{{ reg.nombre[0] }}{{ reg.apellidos[0] }}</v-avatar>
                      <div>
                        <div class="font-weight-medium text-body-2">{{ reg.nombre }} {{ reg.apellidos }}</div>
                        <div class="text-caption text-grey">{{ reg.user?.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="text-body-2">{{ reg.celular }}</td>
                  <td>
                    <v-chip :color="estadoEstColor[reg.estado]" size="x-small" rounded="lg" class="font-weight-bold text-uppercase">{{ reg.estado }}</v-chip>
                  </td>
                  <td v-if="!soloLectura" class="text-center">
                    <v-btn size="x-small" variant="tonal" :color="colorAccent" rounded="lg"
                      :to="`${dashboardBase}/cursos/${cursoId}/estudiantes/${reg.id}`">
                      Ver progreso
                    </v-btn>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-tabs-window-item>

          <!-- ══ FORMULARIOS (solo si no es lectura) ══════════════════ -->
          <v-tabs-window-item v-if="!soloLectura" value="formularios">
            <div class="mb-5">
              <h3 class="text-h6 font-weight-bold mb-1">Formularios de inscripción</h3>
              <p class="text-body-2 text-grey">Genera links únicos para que los aprendices se inscriban.</p>
            </div>

            <v-card rounded="xl" elevation="0" class="pa-5 mb-5 generador-card">
              <div class="text-body-1 font-weight-bold mb-3">Generar nuevo formulario</div>
              <div class="d-flex ga-3 align-end flex-wrap">
                <v-text-field v-model="expiraEn" label="Fecha de expiración (opcional)" type="datetime-local" variant="outlined" rounded="lg" density="comfortable" bg-color="white" hide-details style="max-width:280px" />
                <v-btn :color="colorAccent" rounded="lg" prepend-icon="mdi-link-plus" :loading="generandoForm" @click="generarFormulario">Generar link</v-btn>
              </div>
            </v-card>

            <div v-if="formularios.length === 0" class="text-center pa-8">
              <v-icon size="48" color="black-lighten-1">mdi-link-off</v-icon>
              <p class="text-body-2 text-black mt-2">No hay formularios generados aún.</p>
            </div>

            <v-card v-for="form in formularios" :key="form.id" rounded="xl" elevation="0" class="form-item pa-4 mb-3">
              <div class="d-flex align-center justify-space-between flex-wrap ga-2">
                <div class="d-flex align-center ga-3">
                  <v-icon :color="form.activo ? colorAccent : 'grey'">{{ form.activo ? 'mdi-link-variant' : 'mdi-link-variant-off' }}</v-icon>
                  <div>
                    <div class="text-body-2 font-weight-medium">{{ form.activo ? 'Formulario activo' : 'Formulario inactivo' }}</div>
                    <div class="text-caption text-grey">Creado {{ formatFecha(form.created_at) }}<span v-if="form.expira_en"> · Expira {{ formatFechaHora(form.expira_en) }}</span></div>
                  </div>
                </div>
                <div class="d-flex ga-2 align-center">
                  <v-chip :color="form.activo ? 'success' : 'grey'" size="x-small" rounded="lg" class="font-weight-bold">{{ form.activo ? 'Activo' : 'Inactivo' }}</v-chip>
                  <v-btn size="small" variant="tonal" :color="colorAccent" rounded="lg" prepend-icon="mdi-content-copy"
                    @click="copiarLink(`${$config.public.apiBase.replace('/api','')}/inscripcion/${form.token}`)">
                    Copiar link
                  </v-btn>
                </div>
              </div>
            </v-card>
          </v-tabs-window-item>

        </v-tabs-window>
      </div>
    </template>

    <!-- ── Dialogs ────────────────────────────────────────────────────── -->
    <v-dialog v-model="dialogClase" max-width="520">
      <v-card rounded="xl" class="pa-6">
        <div class="text-h6 font-weight-bold mb-5">{{ claseEditando ? 'Editar clase' : 'Nueva clase' }}</div>
        <v-text-field v-model="formClase.tema" label="Tema *" variant="outlined" rounded="lg" density="comfortable" class="mb-3" />
        <v-text-field v-model="formClase.fecha_hora" label="Fecha y hora *" type="datetime-local" variant="outlined" rounded="lg" density="comfortable" class="mb-3" />
        <v-row dense>
          <v-col cols="6"><v-select v-model="formClase.tipo" label="Modalidad" :items="['presencial','virtual']" variant="outlined" rounded="lg" density="comfortable" /></v-col>
          <v-col cols="6"><v-text-field v-model.number="formClase.duracion_horas" label="Duración (h)" type="number" min="1" max="12" variant="outlined" rounded="lg" density="comfortable" /></v-col>
        </v-row>
        <div class="d-flex ga-3 mt-2">
          <v-btn :color="colorAccent" rounded="lg" :loading="guardandoClase" :disabled="!formClase.tema || !formClase.fecha_hora" @click="guardarClase">
            {{ claseEditando ? 'Guardar' : 'Crear clase' }}
          </v-btn>
          <v-btn variant="text" rounded="lg" @click="dialogClase = false">Cancelar</v-btn>
        </div>
      </v-card>
    </v-dialog>

    <v-dialog v-model="confirmEliminarClase" max-width="400">
      <v-card rounded="xl" class="pa-6">
        <div class="text-h6 font-weight-bold mb-2">¿Eliminar clase?</div>
        <p class="text-body-2 text-grey mb-5">Se eliminará <strong>{{ confirmEliminarClase?.tema }}</strong> y se descontarán {{ confirmEliminarClase?.duracion_horas }}h. No se puede deshacer.</p>
        <div class="d-flex ga-3">
          <v-btn color="error" rounded="lg" @click="eliminarClase(confirmEliminarClase)">Sí, eliminar</v-btn>
          <v-btn variant="text" rounded="lg" @click="confirmEliminarClase = null">Cancelar</v-btn>
        </div>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogLink" max-width="520">
      <v-card rounded="xl" class="pa-6">
        <div class="d-flex align-center ga-3 mb-4">
          <v-avatar color="success" size="44"><v-icon color="white">mdi-check</v-icon></v-avatar>
          <div><div class="text-h6 font-weight-bold">¡Formulario generado!</div><div class="text-body-2 text-grey">Compártelo con los aprendices</div></div>
        </div>
        <v-card color="rgba(57,169,0,0.08)" rounded="lg" class="pa-3 mb-4">
          <div class="text-caption text-grey mb-1">Link de inscripción</div>
          <div class="text-body-2 font-weight-medium" style="word-break:break-all">{{ linkGenerado }}</div>
        </v-card>
        <div class="d-flex ga-2">
          <v-btn :color="colorAccent" rounded="lg" prepend-icon="mdi-content-copy" @click="copiarLink(linkGenerado)">Copiar</v-btn>
          <v-btn variant="text" rounded="lg" @click="dialogLink = false">Cerrar</v-btn>
        </div>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogEstado" max-width="380">
      <v-card rounded="xl" class="pa-6">
        <div class="text-h6 font-weight-bold mb-2">Cambiar estado</div>
        <p class="text-body-2 text-grey mb-5">¿Marcar el curso como <strong>{{ nuevoEstado }}</strong>?</p>
        <div class="d-flex ga-3">
          <v-btn :color="estadoConfig[nuevoEstado]?.color" rounded="lg" :loading="cambiandoEstado" @click="cambiarEstado">Confirmar</v-btn>
          <v-btn variant="text" rounded="lg" @click="dialogEstado = false">Cancelar</v-btn>
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
.curso-hero   { background: rgba(200,215,200,0.3); backdrop-filter: blur(4px); }
.stat-box     { background: rgba(255,255,255,0.6); border-radius: 12px; padding: 12px 16px; }
.clase-card   { background: rgba(255,255,255,0.7); border: 1px solid rgba(0,0,0,0.06); transition: transform 0.2s; }
.clase-card:hover { transform: translateY(-2px); }
.nombre-clase { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.estudiantes-table { background: rgba(255,255,255,0.7) !important; }
.generador-card { background: rgba(57,169,0,0.06); border: 1px dashed rgba(57,169,0,0.3); }
.form-item    { background: rgba(255,255,255,0.7); border: 1px solid rgba(0,0,0,0.06); }
.hover-link:hover { opacity: 0.7; }
</style>