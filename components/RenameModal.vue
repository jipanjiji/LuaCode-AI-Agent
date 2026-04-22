<template>
  <Transition name="modal-fade">
    <div v-if="isOpen" class="modal-overlay" @click.self="handleClose">
      <div class="modal-panel animate-in">
        <!-- Header -->
        <div class="modal-header">
          <div class="modal-title-group">
            <div class="modal-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </div>
            <div>
              <h3 class="modal-title">Rename Conversation</h3>
              <p class="modal-subtitle">Give your chat a descriptive title</p>
            </div>
          </div>
          <button class="close-btn" @click="handleClose">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <div class="input-container">
            <input
              ref="titleInput"
              v-model="tempTitle"
              type="text"
              class="rename-input"
              placeholder="Enter new title..."
              @keyup.enter="handleSave"
              @keyup.esc="handleClose"
            />
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button class="btn-cancel" @click="handleClose">Cancel</button>
          <button class="btn-save" @click="handleSave" :disabled="!tempTitle.trim()">
            Update Title
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

const props = defineProps<{
  isOpen: boolean
  currentTitle: string
}>()

const emit = defineEmits<{
  'close': []
  'save': [newTitle: string]
}>()

const tempTitle = ref('')
const titleInput = ref<HTMLInputElement | null>(null)

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    tempTitle.value = props.currentTitle
    nextTick(() => {
      titleInput.value?.focus()
      titleInput.value?.select()
    })
  }
})

function handleSave() {
  if (tempTitle.value.trim()) {
    emit('save', tempTitle.value.trim())
  }
}

function handleClose() {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-panel {
  background: #0f1520;
  border: 1px solid #252f45;
  border-radius: 16px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 25px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(251,191,36,0.1);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #252f45;
}

.modal-title-group { display: flex; align-items: center; gap: 14px; }

.modal-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(251,191,36,0.1);
  border: 1px solid rgba(251,191,36,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fbbf24;
}

.modal-title { font-size: 1.1rem; font-weight: 700; color: #f1f5f9; margin: 0; }
.modal-subtitle { font-size: 0.78rem; color: #6b7fa3; margin: 2px 0 0; }

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid #252f45;
  color: #6b7fa3;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover { background: #1e2940; color: #e2e8f0; }

.modal-body { padding: 24px; }

.rename-input {
  width: 100%;
  background: #141922;
  border: 1px solid #252f45;
  border-radius: 10px;
  padding: 12px 16px;
  color: #e2e8f0;
  font-size: 0.95rem;
  font-family: inherit;
  transition: all 0.2s;
}

.rename-input:focus {
  outline: none;
  border-color: #fbbf24;
  background: #1a202c;
  box-shadow: 0 0 0 3px rgba(251,191,36,0.1);
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  background: rgba(255,255,255,0.02);
  border-top: 1px solid #252f45;
}

.btn-cancel {
  padding: 10px 16px;
  border-radius: 10px;
  background: transparent;
  border: 1px solid #252f45;
  color: #94a3b8;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover { background: #1e2940; color: #e2e8f0; }

.btn-save {
  padding: 10px 20px;
  border-radius: 10px;
  background: #fbbf24;
  border: 1px solid #fbbf24;
  color: #0d1117;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save:hover { background: #fcd34d; transform: translateY(-1px); }
.btn-save:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

/* Transitions */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

.animate-in { animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes slideIn {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
</style>
