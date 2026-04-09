<script setup>
import { ref, reactive, computed, onMounted } from 'vue'

definePageMeta({ layout: 'coordinador' })

const { apiFetch } = useApi()

// ── Estado ────────────────────────────────────────────────────────────────
const usuarios    = ref([])
const regionales  = ref([])
const loading     = ref(true)
const error       = ref('')
const busqueda    = ref('')
const filtroRol   = ref('todos')
const snackbar    = reactive({ show: false, text: '', color: 'success' })

// ── Dialogs ───────────────────────────────────────────────────────────────
const dialogNuevo     = ref(false)
const guardando       = ref(false)
const errorForm       = ref('')
const showPass        = ref(false)
const confirmToggle   = ref(null) // usuario a activar/desactivar

const formNuevo = reactive({
  nombre: '', apellidos: '', email: '', password: '',
  rol: 'instructor', regional_id: null, telefono: '', ocupacion: '',
})

// ── Carga ─────────────────────────────────────────────────────────────────
async function cargarTodo() {
  loading.value = true
  try {
    const [usrs, regs] = await Promise.all([
      apiFetch('/usuarios'),
      apiFetch('/regionales'),
    ])
    usuarios.value   = usrs
    regionales.value = regs
  } catch {
    error.value = 'No se pudieron cargar los usuarios.'
  } finally {
    loading.value = false
  }
}

onMounted(cargarTodo)

// ── Filtrado local ────────────────────────────────────────────────────────
const usuariosFiltrados = computed(() => {
  let lista = usuarios.value
  if (filtroRol.value !== 'todos') {
    lista = lista.filter(u => u.rol === filtroRol.value)
  }
  if (busqueda.value.trim()) {
    const q = busqueda.value.toLowerCase()
    lista = lista.filter(u =>
      `${u.nombre} ${u.apellidos} ${u.email}`.toLowerCase().includes(q)
    )
  }
  return lista
})

// ── Crear usuario ─────────────────────────────────────────────────────────
async function crearUsuario() {
  errorForm.value = ''
  if (!formNuevo.nombre || !formNuevo.apellidos || !formNuevo.email || !formNuevo.password || !formNuevo.regional_id) {
    errorForm.value = 'Completa todos los campos requeridos.'
    return
  }
  guardando.value = true
  try {
    const nuevo = await apiFetch('/usuarios', { method: 'POST', body: { ...formNuevo } })
    usuarios.value.unshift(nuevo)
    dialogNuevo.value = false
    resetForm()
    toast('Usuario creado correctamente.')
  } catch (err) {
    errorForm.value = err?.response?._data?.message ?? 'No se pudo crear el usuario.'
  } finally {
    guardando.value = false
  }
}

function resetForm() {
  Object.assign(formNuevo, {
    nombre: '', apellidos: '', email: '', password: '',
    rol: 'instructor', regional_id: null, telefono: '', ocupacion: '',
  })
  errorForm.value = ''
  showPass.value  = false
}

// ── Toggle activo ─────────────────────────────────────────────────────────
async function toggleActivo(usuario) {
  try {
    await apiFetch(`/usuarios/${usuario.id}/toggle-activo`, { method: 'PATCH' })
    const idx = usuarios.value.findIndex(u => u.id === usuario.id)
    if (idx !== -1) usuarios.value[idx].activo = !usuarios.value[idx].activo
    confirmToggle.value = null
    toast(`Usuario ${usuarios.value.find(u => u.id === usuario.id)?.activo ? 'activado' : 'desactivado'} correctamente.`)
  } catch {
    toast('No se pudo cambiar el estado del usuario.', 'error')
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────
function toast(text, color = 'success') {
  snackbar.text = text; snackbar.color = color; snackbar.show = true
}

const rolColor   = { instructor: '#39A900', aliado: '#7B1FA2', coordinador: '#1976D2', estudiante: '#E65100' }
const rolIcon    = { instructor: 'mdi-account-tie', aliado: 'mdi-handshake-outline', coordinador: 'mdi-shield-crown-outline', estudiante: 'mdi-school-outline' }
const filtrosRol = [
  { label: 'Todos', value: 'todos' },
  { label: 'Instructores', value: 'instructor' },
  { label: 'Aliados', value: 'aliado' },
]
</script>

<template>
  <div class="pa-6">

    <!-- Encabezado -->
    <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-6">
      <div>
        <h2 class="text-h5 font-weight-bold">Gestión de Usuarios</h2>
        <p class="text-body-2 text-grey-darken-1 mt-1">Administra instructores y aliados del sistema.</p>
      </div>
      <v-btn color="#1976D2" rounded="lg" prepend-icon="mdi-account-plus" @click="dialogNuevo = true">
        Nuevo Usuario
      </v-btn>
    </div>

    <!-- Filtros + búsqueda -->
    <div class="d-flex ga-3 flex-wrap align-center mb-5">
      <v-text-field
        v-model="busqueda"
        placeholder="Buscar por nombre o email..."
        variant="outlined" rounded="lg" density="compact"
        prepend-inner-icon="mdi-magnify" hide-details bg-color="white"
        style="max-width:300px"
        clearable
      />
      <div class="d-flex ga-2">
        <v-btn
          v-for="f in filtrosRol" :key="f.value" size="small" rounded="lg"
          :variant="filtroRol === f.value ? 'flat' : 'tonal'"
          :color="filtroRol === f.value ? '#1976D2' : 'grey'"
          @click="filtroRol = f.value"
        >
          {{ f.label }}
        </v-btn>
      </div>
    </div>

    <v-alert v-if="error" type="error" variant="tonal" rounded="lg" class="mb-4">{{ error }}</v-alert>

    <!-- Skeleton -->
    <div v-if="loading">
      <v-skeleton-loader v-for="i in 5" :key="i" type="list-item-avatar-two-line" class="mb-2" rounded="xl" />
    </div>

    <!-- Tabla -->
    <v-card v-else rounded="xl" elevation="0" class="usuarios-card">
      <v-table>
        <thead>
          <tr>
            <th>Usuario</th>
            <th class="d-none d-sm-table-cell">Regional</th>
            <th>Rol</th>
            <th class="text-center">Estado</th>
            <th class="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="usuariosFiltrados.length === 0">
            <td colspan="5" class="text-center text-grey pa-8">No se encontraron usuarios.</td>
          </tr>
          <tr v-for="u in usuariosFiltrados" :key="u.id" class="user-row">
            <td>
              <div class="d-flex align-center ga-3 py-2">
                <v-avatar :color="rolColor[u.rol]" size="38" class="text-white text-body-2 font-weight-bold flex-shrink-0">
                  {{ u.nombre[0] }}{{ u.apellidos?.[0] ?? '' }}
                </v-avatar>
                <div>
                  <div class="font-weight-medium text-body-2">{{ u.nombre }} {{ u.apellidos }}</div>
                  <div class="text-caption text-grey">{{ u.email }}</div>
                </div>
              </div>
            </td>
            <td class="text-body-2 d-none d-sm-table-cell">{{ u.regional?.nombre ?? '—' }}</td>
            <td>
              <v-chip :color="rolColor[u.rol]" :prepend-icon="rolIcon[u.rol]" size="x-small" rounded="lg" class="font-weight-bold text-uppercase">
                {{ u.rol }}
              </v-chip>
            </td>
            <td class="text-center">
              <v-chip :color="u.activo ? 'success' : 'error'" size="x-small" rounded="lg" class="font-weight-bold">
                {{ u.activo ? 'Activo' : 'Inactivo' }}
              </v-chip>
            </td>
            <td class="text-center">
              <v-btn
                :color="u.activo ? 'error' : 'success'"
                size="x-small" variant="tonal" rounded="lg"
                @click="confirmToggle = u"
              >
                {{ u.activo ? 'Desactivar' : 'Activar' }}
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- ── Dialog: Nuevo usuario ──────────────────────────────────────── -->
    <v-dialog v-model="dialogNuevo" max-width="560">
      <v-card rounded="xl" class="pa-6">
        <div class="text-h6 font-weight-bold mb-5">Crear nuevo usuario</div>

        <v-alert v-if="errorForm" type="error" variant="tonal" rounded="lg" class="mb-4" closable>{{ errorForm }}</v-alert>

        <v-row dense>
          <v-col cols="12" sm="6">
            <v-text-field v-model="formNuevo.nombre" label="Nombre *" variant="outlined" rounded="lg" density="comfortable" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="formNuevo.apellidos" label="Apellidos *" variant="outlined" rounded="lg" density="comfortable" />
          </v-col>
          <v-col cols="12">
            <v-text-field v-model="formNuevo.email" label="Correo electrónico *" type="email" variant="outlined" rounded="lg" density="comfortable" />
          </v-col>
          <v-col cols="12">
            <v-text-field
              v-model="formNuevo.password" label="Contraseña *"
              :type="showPass ? 'text' : 'password'"
              variant="outlined" rounded="lg" density="comfortable"
              :append-inner-icon="showPass ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPass = !showPass"
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-select
              v-model="formNuevo.rol" label="Rol *"
              :items="[{title:'Instructor', value:'instructor'},{title:'Aliado', value:'aliado'}]"
              variant="outlined" rounded="lg" density="comfortable"
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-select
              v-model="formNuevo.regional_id" label="Regional *"
              :items="regionales" item-title="nombre" item-value="id"
              variant="outlined" rounded="lg" density="comfortable"
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="formNuevo.telefono" label="Teléfono" variant="outlined" rounded="lg" density="comfortable" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="formNuevo.ocupacion" label="Ocupación" variant="outlined" rounded="lg" density="comfortable" />
          </v-col>
        </v-row>

        <div class="d-flex ga-3 mt-2">
          <v-btn color="#1976D2" rounded="lg" :loading="guardando" @click="crearUsuario">Crear usuario</v-btn>
          <v-btn variant="text" rounded="lg" @click="dialogNuevo = false; resetForm()">Cancelar</v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- ── Dialog: Confirmar toggle ───────────────────────────────────── -->
    <v-dialog v-model="confirmToggle" max-width="380">
      <v-card v-if="confirmToggle" rounded="xl" class="pa-6">
        <div class="text-h6 font-weight-bold mb-2">
          {{ confirmToggle.activo ? 'Desactivar' : 'Activar' }} usuario
        </div>
        <p class="text-body-2 text-grey mb-5">
          ¿Estás seguro de {{ confirmToggle.activo ? 'desactivar' : 'activar' }} a
          <strong>{{ confirmToggle.nombre }} {{ confirmToggle.apellidos }}</strong>?
          {{ confirmToggle.activo ? 'No podrá iniciar sesión.' : 'Podrá volver a iniciar sesión.' }}
        </p>
        <div class="d-flex ga-3">
          <v-btn :color="confirmToggle.activo ? 'error' : 'success'" rounded="lg" @click="toggleActivo(confirmToggle)">
            Confirmar
          </v-btn>
          <v-btn variant="text" rounded="lg" @click="confirmToggle = null">Cancelar</v-btn>
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
.usuarios-card { background: rgba(255,255,255,0.75); border: 1px solid rgba(0,0,0,0.06); }
.user-row:hover { background: rgba(25,118,210,0.04) !important; }
</style>