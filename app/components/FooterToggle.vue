<template>
  <div class="footer-drawer-container">
    <!-- Drawer handle - centered rectangle -->
    <button
      class="drawer-handle"
      :class="{ active: isVisible }"
      @click="toggleFooter"
      aria-label="Toggle footer panel"
      title="Toggle footer"
    >
      <span class="handle-bar"></span>
    </button>

    <!-- Footer panel that slides up -->
    <Transition name="footer-drawer" @enter="onEnter" @leave="onLeave">
      <div v-show="isVisible" class="footer-panel">
        <slot></slot>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  interface Props {
    isVisible: boolean;
  }

  interface Emits {
    (e: 'toggle'): void;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<Emits>();

  const isVisible = computed(() => props.isVisible);

  const toggleFooter = () => {
    emit('toggle');
  };

  const onEnter = (el: Element) => {
    const htmlEl = el as HTMLElement;
    htmlEl.style.transform = 'translateY(100%)';

    setTimeout(() => {
      htmlEl.style.transition = 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      htmlEl.style.transform = 'translateY(0)';
    }, 0);
  };

  const onLeave = (el: Element) => {
    const htmlEl = el as HTMLElement;
    htmlEl.style.transition = 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    htmlEl.style.transform = 'translateY(100%)';
  };
</script>

<style scoped>
  .footer-drawer-container {
    position: relative;
    width: 100%;
  }

  /* Centered drawer handle - rectangle positioned 20px above footer */
  .drawer-handle {
    position: fixed;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    width: 120px;
    height: 10px;
    background-color: black;

    cursor: pointer;
    z-index: 160;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  }

  .drawer-handle:hover {
    background-color: var(--bg-primary);

    transform: translateX(-50%) translateY(-2px);
  }

  .drawer-handle:active {
    transform: translateX(-50%) translateY(0px);
  }

  .drawer-handle.active {
    background-color: var(--bg-secondary);
    border-color: var(--text-secondary);
  }

  /* Handle bar indicator */
  .handle-bar {
    width: 30px;
    height: 3px;
    background-color: var(--text-primary);
    border-radius: 2px;
    transition: all 0.3s ease;
  }

  .drawer-handle.active .handle-bar {
    background-color: var(--text-secondary);
  }

  /* Footer panel that slides up */
  .footer-panel {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: var(--bg-primary, #fff);
    z-index: 150;
    border-top: 1px solid var(--border-color, #e0e0e0);
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.1);
  }

  /* Transition animations - faster, smooth easing */
  .footer-drawer-enter-active,
  .footer-drawer-leave-active {
    transition: transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  .footer-drawer-enter-from,
  .footer-drawer-leave-to {
    transform: translateY(100%);
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .drawer-handle {
      width: 100px;
      height: 36px;
      border-radius: 18px 18px 0 0;
    }

    .handle-bar {
      width: 28px;
      height: 2.5px;
    }

    .footer-panel {
      max-height: 90vh;
    }
  }
</style>
