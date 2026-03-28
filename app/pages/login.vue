<script setup>
    definePageMeta ({
        layout: 'default',
    })

    const handleLogin = async () => {
        if (loading.value) return

        loading.value = true
        errorMessage.value = ''

        try {
            await new Promise(resolve => setTimeout(resolve, 1000))
            await auth.login(document.value, password.value)

            const redirectTo = useCookie('redirect_to')
            const destination = redirectTo.value || '/welcome'
            redirectTo.value = null
            return navigateTo(destination);

        } catch (error) {
            errorMessage.value = error.message
        } finally {
            loading.value = false
        }
    }
</script>


<template>
    <template>
        
    </template>
    <template>
        <card :width="smAndDown">
            <v-form>
                <v-text-field v-model="document" label="Documento" placeholder="Ingrese su documento" clearable />
                <v-text-field v-model="password" label="Contraseña" type="password" placeholder="Ingrese su contraseña"
                    clearable />
        
                <div class="text-center">
                    <v-btn size="large" class="mt-4 " color="rgb(0,69,124)" type="submit" :loading="loading"
                        @click="handleLogin" :disabled="!document || !password || loading">
                        Ingresar
                        <template #loader>
                            <v-progress-linear indeterminate color="white"></v-progress-linear>
                        </template>
                    </v-btn>
                </div>
            </v-form>
            <v-alert v-if="errorMessage" type="error" class="mt-4">
                {{ errorMessage }}
            </v-alert>
        </card>
    </template>
</template>
