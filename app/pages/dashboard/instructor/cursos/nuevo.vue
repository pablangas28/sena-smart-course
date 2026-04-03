<script setup>
import { ref, reactive, onMounted } from 'vue'

definePageMeta({ layout: 'instructor' })

const { apiFetch } = useApi()
const router       = useRouter()

const guardando  = ref(false)
const error      = ref('')
const regionales = ref([])

const form = reactive({
  nombre:           '',
  descripcion:      '',
  regional_id:      null,
  fecha_inicio:     '',
  fecha_fin:        '',
  horas_requeridas: 40,
})

async function cargarRegionales() {
  try {
    regionales.value = await apiFetch('/regionales')
  } catch {
    error.value = 'No se pudieron cargar las regionales.'
  }
}

async function crearCurso() {
  if (!form.nombre || !form.regional_id || !form.fecha_inicio) return
  guardando.value = true
  error.value     = ''
  try {
    const body = {
      nombre:           form.nombre,
      regional_id:      form.regional_id,
      fecha_inicio:     form.fecha_inicio,
      horas_requeridas: form.horas_requeridas,
      ...(form.descripcion && { descripcion: form.descripcion }),
      ...(form.fecha_fin    && { fecha_fin: form.fecha_fin }),
    }
    const nuevo = await apiFetch('/cursos', { method: 'POST', body })
    router.push(`/dashboard/instructor/cursos/${nuevo.id}`)
  } catch (err) {
    const msg = err?.response?._data?.message
    error.value = msg ?? 'No se pudo crear el curso. Verificá los datos.'
  } finally {
    guardando.value = false
  }
}

onMounted(cargarRegionales)
</script>

<template>
  <div class="pa-6" style="max-width: 700px;">

    <!-- Cabecera -->
    <div class="d-flex align-center ga-3 mb-6">
      <v-btn icon variant="text" size="small" to="/dashboard/instructor">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <div>
        <h2 class="text-h5 font-weight-bold">Nuevo Curso</h2>
        <p class="text-body-2 text-grey">Completa los datos para registrar el curso.</p>
      </div>
    </div>

    <v-card rounded="xl" elevation="0" class="pa-6" color="rgba(200,215,200,0.55)">

      <v-alert v-if="error" type="error" variant="tonal" rounded="lg" class="mb-5" closable>
        {{ error }}
      </v-alert>

      <!-- Nombre -->
      <v-text-field
        v-model="form.nombre"
        label="Nombre del curso *"
        variant="outlined"
        rounded="lg"
        density="comfortable"
        bg-color="white"
        class="mb-4"
        placeholder="Ej: Docencia Universitaria"
      />

      <!-- Descripción -->
      <v-textarea
        v-model="form.descripcion"
        label="Descripción"
        variant="outlined"
        rounded="lg"
        density="comfortable"
        bg-color="white"
        class="mb-4"
        rows="3"
        auto-grow
        placeholder="Describe brevemente el objetivo del curso..."
      />

      <v-row>
        <!-- Regional -->
        <v-col cols="12" sm="6">
          <v-select
            v-model="form.regional_id"
            label="Regional *"
            :items="regionales"
            item-title="nombre"
            item-value="id"
            variant="outlined"
            rounded="lg"
            density="comfortable"
            bg-color="white"
            no-data-text="Cargando regionales..."
          />
        </v-col>

        <!-- Horas requeridas -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model.number="form.horas_requeridas"
            label="Horas requeridas *"
            type="number"
            min="1"
            variant="outlined"
            rounded="lg"
            density="comfortable"
            bg-color="white"
            prepend-inner-icon="mdi-clock-outline"
          />
        </v-col>

        <!-- Fecha inicio -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="form.fecha_inicio"
            label="Fecha de inicio *"
            type="date"
            variant="outlined"
            rounded="lg"
            density="comfortable"
            bg-color="white"
          />
        </v-col>

        <!-- Fecha fin -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="form.fecha_fin"
            label="Fecha de finalización (opcional)"
            type="date"
            variant="outlined"
            rounded="lg"
            density="comfortable"
            bg-color="white"
          />
        </v-col>
      </v-row>

      <!-- Acciones -->
      <div class="d-flex ga-3 mt-2">
        <v-btn
          color="#39A900"
          rounded="lg"
          size="large"
          :loading="guardando"
          :disabled="!form.nombre || !form.regional_id || !form.fecha_inicio"
          @click="crearCurso"
        >
          Crear curso
        </v-btn>
        <v-btn variant="text" rounded="lg" size="large" to="/dashboard/instructor">
          Cancelar
        </v-btn>
      </div>
    </v-card>
  </div>
</template>