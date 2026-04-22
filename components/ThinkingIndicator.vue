<template>
  <div v-if="chat.isLoading" class="thinking-container">
    <div class="thinking-bubble">
      <div class="thinking-dots">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
      <div class="thinking-text">
        Thinking...
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useChatStore } from '~/stores/chat'
const chat = useChatStore()
</script>

<style scoped>
.thinking-container {
  display: flex;
  margin: 12px 0;
  padding-left: 12px;
  animation: fadeIn 0.3s ease-out;
}

.thinking-bubble {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(20, 25, 34, 0.6);
  border: 1px solid rgba(37, 47, 69, 0.5);
  padding: 8px 16px;
  border-radius: 20px;
  border-bottom-left-radius: 4px;
}

.thinking-dots {
  display: flex;
  gap: 4px;
}

.dot {
  width: 5px;
  height: 5px;
  background: #fbbf24;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1.0); }
}

.thinking-text {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 500;
  letter-spacing: 0.02em;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
