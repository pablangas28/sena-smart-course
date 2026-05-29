<template>
  <v-footer color="#0A1628" class="text-white py-4 px-6 border-t" border="rgba(255,255,255,0.1)">
    <v-row no-gutters class="align-center justify-space-between text-body-2 w-100">
      
      <v-col cols="12" sm="auto" class="text-center text-sm-left mb-2 mb-sm-0">
        <span class="font-weight-bold tracking-wider opacity-70">SMARTCOURSE</span> 
        <span class="mx-2 opacity-30">|</span> 
        <span class="opacity-60">&copy; {{ new Date().getFullYear() }} - Todos los derechos reservados.</span>
      </v-col>

      <v-col cols="12" sm="auto" class="text-center text-sm-right">
        <v-chip 
          variant="text" 
          color="#39A900" 
          size="small" 
          class="font-weight-bold px-0"
          prepend-icon="mdi-leaf"
        >
          Servicio Nacional de Aprendizaje SENA
        </v-chip>
      </v-col>

    </v-row>
  </v-footer>
</template>

<style scoped>
.tracking-wider {
  letter-spacing: 0.05em;
}
.opacity-60 { opacity: 0.6; }
.opacity-70 { opacity: 0.7; }
.opacity-30 { opacity: 0.3; }
</style>