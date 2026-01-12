<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4"
  >
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h1 class="font-display text-4xl text-white mb-2">Admin Login</h1>
        <p class="text-gray-400">Sign in to manage your photos</p>
      </div>

      <form
        class="mt-8 space-y-6 bg-gray-800/50 backdrop-blur-sm p-8 rounded-lg shadow-xl"
        @submit.prevent="handleLogin"
      >
        <div
          v-if="error"
          class="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded"
        >
          {{ error }}
        </div>

        <div class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input
              id="email"
              v-model="credentials.email"
              type="email"
              required
              class="appearance-none relative block w-full px-4 py-3 border border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-300 mb-1"
              >Password</label
            >
            <input
              id="password"
              v-model="credentials.password"
              type="password"
              required
              class="appearance-none relative block w-full px-4 py-3 border border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-gray-900 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading">Signing in...</span>
          <span v-else>Sign in</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';

  const credentials = ref({
    email: '',
    password: '',
  });

  const error = ref('');
  const loading = ref(false);

  const handleLogin = async () => {
    error.value = '';
    loading.value = true;

    try {
      const response = await $fetch('/api/auth/login', {
        method: 'POST',
        body: credentials.value,
      });

      if (response.success && response.token) {
        // Store token in localStorage
        localStorage.setItem('authToken', response.token);

        // Redirect to dashboard
        navigateTo('/admin/dashboard');
      }
    } catch (err: any) {
      error.value = err.data?.message || 'Login failed. Please check your credentials.';
    } finally {
      loading.value = false;
    }
  };

  // Redirect if already logged in
  onMounted(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      navigateTo('/admin/dashboard');
    }
  });
</script>

<style scoped>
  .font-display {
    font-family: var(--font-heading);
  }
</style>
