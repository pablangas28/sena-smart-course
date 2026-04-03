<script setup>
definePageMeta({ layout: 'default' })

const devs = [
  {
    nombre: 'Juan Pablo Erira',
    iniciales: 'JPE',
    rol: 'Desarrollador Full Stack',
    color: '#0a1628',
  },
  {
    nombre: 'Juan Esteban González Pérez',
    iniciales: 'JEG',
    rol: 'Desarrollador Full Stack',
    color: '#39A900',
  },
]

const tecnologias = [
  { nombre: 'Nuxt 3',    icono: 'mdi-nuxt',           desc: 'Framework Frontend',  color: '#00DC82' },
  { nombre: 'Vue 3',     icono: 'mdi-vuejs',           desc: 'UI Framework',        color: '#42b883' },
  { nombre: 'Laravel',   icono: 'mdi-laravel',         desc: 'Backend API REST',    color: '#FF2D20' },
  { nombre: 'Vuetify',   icono: 'mdi-material-design', desc: 'Componentes UI',      color: '#1697F6' },
  { nombre: 'Pinia',     icono: 'mdi-pine-tree',       desc: 'State Management',    color: '#FFD859' },
  { nombre: 'MySQL',     icono: 'mdi-database',        desc: 'Base de Datos',       color: '#4479A1' },
  { nombre: 'Railway',   icono: 'mdi-train',           desc: 'Deploy Backend',      color: '#0B0D0E' },
  { nombre: 'Sanctum',   icono: 'mdi-shield-key',      desc: 'Autenticación API',   color: '#FF2D20' },
]
</script>

<template>
  <div class="acerca-page">
    <div class="page-inner pa-6">

      <!-- ── Hero ─────────────────────────────────────────────────────── -->
      <div class="hero-section text-center mb-12">
        <div class="d-flex justify-center mb-4">
          <div class="sena-badge">
            <img src="/images/sena-sideBar.png" width="52" height="52" />
          </div>
        </div>
        <h1 class="text-h3 font-weight-black mb-2">
          SENA <span style="color:#39A900">SmartCourse</span>
        </h1>
        <div class="overline-line mx-auto mb-6" />
        <p class="text-h6 font-weight-regular text-grey-darken-1 mx-auto" style="max-width:600px; line-height:1.6;">
          Plataforma de gestión de cursos complementarios para el SENA
        </p>
      </div>

      <!-- ── Sobre la plataforma ──────────────────────────────────────── -->
      <v-row justify="center" class="mb-12">
        <v-col cols="12" md="9" lg="8">
          <v-card rounded="xl" elevation="0" class="about-card pa-8">
            <div class="d-flex align-center ga-3 mb-5">
              <div class="accent-line" />
              <h2 class="text-h5 font-weight-bold">Acerca de esta plataforma</h2>
            </div>
            <p class="text-body-1 text-grey-darken-1 mb-4" style="line-height:1.8;">
              Este sitio web ha sido desarrollado para optimizar la gestión de los instructores del
              SENA en la programación de cursos complementarios. Dichos cursos permiten a los
              instructores cumplir con las horas pendientes estipuladas en sus contratos, mediante la
              colaboración con aliados estratégicos, como fundaciones o grupos empresariales
              interesados en capacitar a sus equipos en áreas específicas.
            </p>
            <p class="text-body-1 text-grey-darken-1" style="line-height:1.8;">
              La plataforma facilita la organización, la comunicación y el seguimiento de estas
              iniciativas, promoviendo la formación continua y el aprovechamiento eficiente del
              talento humano.
            </p>
          </v-card>
        </v-col>
      </v-row>

      <!-- ── Desarrolladores ──────────────────────────────────────────── -->
      <div class="text-center mb-6">
        <h2 class="text-h5 font-weight-bold mb-1">Equipo de desarrollo</h2>
        <div class="overline-line mx-auto" />
      </div>

      <v-row justify="center" class="mb-12">
        <v-col
          v-for="dev in devs"
          :key="dev.nombre"
          cols="12"
          sm="6"
          md="4"
        >
          <v-card rounded="xl" elevation="0" class="dev-card pa-6 text-center">
            <v-avatar :color="dev.color" size="80" class="text-white text-h5 font-weight-bold mb-4">
              {{ dev.iniciales }}
            </v-avatar>
            <div class="text-h6 font-weight-bold mb-1">{{ dev.nombre }}</div>
            <v-chip color="#39A900" size="small" rounded="lg" class="font-weight-medium">
              {{ dev.rol }}
            </v-chip>
            <div class="mt-4 pt-4" style="border-top: 1px solid rgba(0,0,0,0.07);">
              <div class="text-caption text-grey">Proyecto académico</div>
              <div class="text-caption font-weight-medium">SENA — 2026</div>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- ── Tecnologías ──────────────────────────────────────────────── -->
      <div class="text-center mb-6">
        <h2 class="text-h5 font-weight-bold mb-1">Tecnologías utilizadas</h2>
        <div class="overline-line mx-auto" />
      </div>

      <v-row justify="center" class="mb-12">
        <v-col
          v-for="tech in tecnologias"
          :key="tech.nombre"
          cols="6"
          sm="4"
          md="3"
          lg="2"
        >
          <v-card rounded="xl" elevation="0" class="tech-card pa-4 text-center">
            <v-icon :color="tech.color" size="36" class="mb-2">{{ tech.icono }}</v-icon>
            <div class="text-body-2 font-weight-bold">{{ tech.nombre }}</div>
            <div class="text-caption text-grey">{{ tech.desc }}</div>
          </v-card>
        </v-col>
      </v-row>

      <!-- ── Footer ──────────────────────────────────────────────────── -->
      <div class="text-center pa-6">
        <div style="width:40px; height:3px; background:#39A900; border-radius:2px; margin:0 auto 12px;" />
        <p class="text-caption text-grey">
          SENA SmartCourse · Proyecto académico · 2026
        </p>
        <p class="text-caption text-grey">
          Servicio Nacional de Aprendizaje — Regional Caldas
        </p>
      </div>

    </div>
  </div>
</template>

<style scoped>
.acerca-page {
  min-height: calc(100vh - 64px);
}

.page-inner {
  max-width: 1100px;
  margin: 0 auto;
}

.hero-section {
  padding-top: 48px;
}

.sena-badge {
  background: rgba(255,255,255,0.8);
  border-radius: 20px;
  padding: 12px;
  backdrop-filter: blur(4px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.overline-line {
  width: 48px;
  height: 4px;
  background: #39A900;
  border-radius: 2px;
  margin-top: 12px;
}

.accent-line {
  width: 4px;
  height: 28px;
  background: #39A900;
  border-radius: 2px;
  flex-shrink: 0;
}

.about-card {
  background: rgba(200, 215, 200, 0.55);
  backdrop-filter: blur(4px);
}

.dev-card {
  background: rgba(200, 215, 200, 0.55);
  backdrop-filter: blur(4px);
  transition: transform 0.2s;
}

.dev-card:hover {
  transform: translateY(-4px);
}

.tech-card {
  background: rgba(255,255,255,0.7);
  border: 1px solid rgba(0,0,0,0.06);
  transition: transform 0.2s;
}

.tech-card:hover {
  transform: translateY(-3px);
}
</style>