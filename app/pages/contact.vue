<template>
  <section class="contact-page">
    <header class="contact-hero">
      <h1 class="title">Get in touch</h1>
      <p class="lede">Email, subject, message — plus who you are.</p>
    </header>

    <form class="contact-form" @submit.prevent="onSubmit">
      <label class="field required" :class="{ error: errors.email }">
        <span>Email</span>
        <input v-model.trim="form.email" type="email" autocomplete="email" required />
        <small v-if="errors.email">{{ errors.email }}</small>
      </label>

      <label class="field required" :class="{ error: errors.customerType }">
        <span>Type of customer</span>
        <select v-model="form.customerType" required>
          <option disabled value="">Select…</option>
          <option value="School">School</option>
          <option value="Private">Private</option>
          <option value="Professional">Professional</option>
        </select>
        <small v-if="errors.customerType">{{ errors.customerType }}</small>
      </label>

      <label class="field required" :class="{ error: errors.subject }">
        <span>Subject</span>
        <input v-model.trim="form.subject" type="text" required />
        <small v-if="errors.subject">{{ errors.subject }}</small>
      </label>

      <label class="field required" :class="{ error: errors.message }">
        <span>Message</span>
        <textarea v-model.trim="form.message" rows="6" required placeholder="Your message…" />
        <small v-if="errors.message">{{ errors.message }}</small>
      </label>

      <div class="actions">
        <button class="btn" type="submit" :disabled="submitting">
          <span v-if="!submitting">Send</span>
          <span v-else>Sending…</span>
        </button>
        <p v-if="status" class="status" :class="status">
          {{ status === 'success' ? 'Message sent. Thanks!' : 'Something went wrong. Try again.' }}
        </p>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

const form = reactive({
  email: '',
  customerType: '',
  subject: '',
  message: '',
})

const errors = reactive<{ email?: string; subject?: string; message?: string; customerType?: string }>({})
const submitting = ref(false)
const status = ref<'success' | 'error' | ''>('')

const validate = () => {
  errors.email = ''
  errors.subject = ''
  errors.message = ''
  errors.customerType = ''
  let ok = true
  if (!form.email || !/.+@.+\..+/.test(form.email)) {
    errors.email = 'Please enter a valid email.'
    ok = false
  }
  if (!form.customerType) {
    errors.customerType = 'Please select your type.'
    ok = false
  }
  if (!form.subject || form.subject.length < 2) {
    errors.subject = 'Please add a subject.'
    ok = false
  }
  if (!form.message || form.message.length < 10) {
    errors.message = 'Please add a short message (min 10 chars).'
    ok = false
  }
  return ok
}

const onSubmit = async () => {
  status.value = ''
  if (!validate()) return
  submitting.value = true
  try {
    const res = await $fetch('/api/contact', { method: 'POST', body: { ...form } })
    if ((res as any)?.success) {
      status.value = 'success'
      form.subject = ''
      form.message = ''
    } else {
      status.value = 'error'
    }
  } catch (e) {
    status.value = 'error'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.contact-page {
  max-width: 880px;
  margin: 0 auto;
  padding: 48px 24px 80px;
}

.contact-hero { text-align: center; margin-bottom: 28px; }
.title { font-size: 2.2rem; letter-spacing: -0.02em; margin: 0 0 8px; }
.lede { color: var(--text-secondary); }

.contact-form { display: flex; flex-direction: column; gap: 18px; }

.field { display: flex; flex-direction: column; gap: 6px; }
.field > span { color: var(--text-secondary); font-size: 0.9rem; }
.field input, .field select, .field textarea {
  appearance: none;
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  border-radius: 8px;
  outline: none;
  transition: border-color .2s ease, box-shadow .2s ease;
}
.field input:focus, .field select:focus, .field textarea:focus {
  border-color: #a44a48;
  box-shadow: 0 0 0 3px rgba(164, 74, 72, .18);
}
.field.required > span::after { content: ' *'; color: #a44a48; }
.field.error input, .field.error textarea { border-color: #c44; }
.field small { color: #c44; }

.actions { display: flex; align-items: center; gap: 12px; margin-top: 8px; }
.btn {
  appearance: none; border: none; cursor: pointer;
  background: #a44a48; color: white; padding: 10px 18px; border-radius: 8px;
  transition: transform .15s ease, box-shadow .15s ease; font-weight: 600;
}
.btn:hover { transform: translateY(-1px); box-shadow: 0 8px 18px rgba(164,74,72,.25); }
.btn:disabled { opacity: .6; cursor: default; box-shadow: none; transform: none; }

.status { margin-left: 6px; font-size: 0.95rem; }
.status.success { color: #2e7d32; }
.status.error { color: #c62828; }
</style>