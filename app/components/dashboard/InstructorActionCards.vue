<template>
  <div>
    <!-- Bienvenida -->
    <div class="d-flex align-center ga-4 mb-10">
      <v-icon size="44" color="#333">mdi-account-circle</v-icon>
      <h2 class="text-h5 font-weight-bold">¡Bienvenido, {{ nombre }}!</h2>
    </div>

    <!-- Cards -->
    <v-row>
      <v-col
        v-for="card in cards"
        :key="card.key"
        cols="12"
        sm="6"
        md="4"
      >
        <v-card
          rounded="xl"
          elevation="0"
          color="rgba(200,215,200,0.65)"
          class="pa-6"
          style="cursor:pointer; backdrop-filter:blur(2px);"
          @click="$emit('action', card.key)"
        >
          <v-avatar color="#0a1628" size="64" rounded="lg" class="mb-4">
            <v-icon size="32" color="white">{{ card.icon }}</v-icon>
          </v-avatar>
          <div class="text-h6 font-weight-semibold mb-4">{{ card.label }}</div>
          <v-divider />
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
defineProps({
  nombre: { type: String, default: 'Instructor' },
})

defineEmits(['action'])

const cards = [
  { key: 'cursos',      label: 'Consultar cursos',      icon: 'mdi-bank' },
  { key: 'estudiantes', label: 'Consultar Estudiantes',  icon: 'mdi-account-group' },
  { key: 'formulario',  label: 'Crear formulario',       icon: 'mdi-file-document-plus' },
]
</script>
