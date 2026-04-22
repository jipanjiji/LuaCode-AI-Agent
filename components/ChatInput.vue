<template>
  <div class="input-area">
    <!-- No API key warning -->
    <div v-if="!settings.hasApiKey" class="no-api-banner">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
      <span>Please enter your API Key in <button class="inline-settings-link" @click="$emit('open-settings')">Settings</button> to start.</span>
    </div>

    <div class="input-row">
      <!-- Textarea -->
      <div class="textarea-wrapper">
        <textarea
          id="chat-input"
          ref="textareaRef"
          v-model="inputText"
          class="chat-textarea input-glow"
          :placeholder="settings.hasApiKey ? 'Ask me anything about Lua / Luau...' : 'Locked: API Key required...'"
          :disabled="chat.isLoading || !settings.hasApiKey"
          rows="1"
          @keydown.enter.exact.prevent="handleSend"
          @keydown.enter.shift.exact="handleShiftEnter"
          @input="autoResize"
        />
        <div class="hint-text" v-if="!chat.isLoading">
          <span>Enter to send</span>
          <span class="divider">·</span>
          <span>Shift+Enter for newline</span>
        </div>
      </div>

      <!-- Send button -->
      <button
        id="send-btn"
        class="send-btn"
        :disabled="!canSend"
        @click="handleSend"
        title="Send message"
      >
        <svg
          v-if="!chat.isLoading"
          width="18" height="18" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2.5"
        >
          <line x1="22" y1="2" x2="11" y2="13"/>
          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
        <svg
          v-else
          class="spinner"
          width="18" height="18" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2.5"
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useChatStore } from '~/stores/chat'
import { useSettingsStore } from '~/stores/settings'

defineEmits<{ 'open-settings': [] }>()

const chat = useChatStore()
const settings = useSettingsStore()

const inputText = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const canSend = computed(
  () => inputText.value.trim().length > 0 && !chat.isLoading
)

async function handleSend() {
  if (!canSend.value) return
  const text = inputText.value.trim()
  inputText.value = ''
  await nextTick()
  resetHeight()
  await chat.sendMessage(text)
}

function handleShiftEnter() {
  // Allow default newline behavior
}

function autoResize() {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  const maxHeight = 200
  el.style.height = Math.min(el.scrollHeight, maxHeight) + 'px'
}

function resetHeight() {
  if (textareaRef.value) textareaRef.value.style.height = 'auto'
}
</script>

<style scoped>
.input-area {
  padding: 16px 20px 32px; /* Increased bottom padding for absolute hint */
  border-top: 1px solid #252f45;
  background: #0d1117;
  flex-shrink: 0;
}

.input-row {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  max-width: 820px;
  margin: 0 auto;
}

.textarea-wrapper { 
  flex: 1; 
  position: relative; 
  display: flex;
  flex-direction: column;
}

.chat-textarea {
  width: 100%;
  background: #141922;
  border: 1px solid #252f45;
  border-radius: 12px;
  padding: 14px 16px;
  color: #e2e8f0;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  line-height: 1.6;
  resize: none;
  min-height: 50px;
  max-height: 200px;
  overflow-y: auto;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.chat-textarea::placeholder { color: #6b7fa3; }

.chat-textarea:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* input-glow is in main.css */

.hint-text {
  position: absolute;
  top: calc(100% + 6px);
  left: 4px;
  display: flex;
  gap: 6px;
  font-size: 0.68rem;
  color: #6b7fa3;
}

.hint-text .divider { color: #252f45; }

/* Send button */
.send-btn {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: linear-gradient(135deg, #fbbf24, #d97706);
  border: none;
  color: #0d1117;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  box-shadow: 0 4px 16px rgba(251,191,36,0.3);
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(251,191,36,0.4);
  background: linear-gradient(135deg, #fcd34d, #fbbf24);
}

.send-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(251,191,36,0.25);
}

.send-btn:disabled {
  background: #1e2940;
  color: #6b7fa3;
  cursor: not-allowed;
  box-shadow: none;
}

/* Spinner */
.spinner {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* No API banner */
.no-api-banner {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 0.78rem;
  color: #6b7fa3;
  max-width: 820px;
  margin: 0 auto 12px;
  padding: 8px 14px;
  background: rgba(251,191,36,0.05);
  border: 1px solid rgba(251,191,36,0.15);
  border-radius: 8px;
}

.inline-settings-link {
  background: none;
  border: none;
  color: #fbbf24;
  font-size: inherit;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.inline-settings-link:hover { color: #fcd34d; }
@media (max-width: 768px) {
  .input-area {
    padding: 12px 14px 14px;
  }

  .chat-textarea {
    padding: 10px 14px;
    font-size: 0.85rem;
    min-height: 44px;
  }

  .send-btn {
    width: 44px;
    height: 44px;
    border-radius: 10px;
  }

  .hint-text {
    display: none; /* Save vertical space on mobile */
  }
}
</style>
