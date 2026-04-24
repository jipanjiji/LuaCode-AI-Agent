<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" id="settings-modal-overlay" class="modal-overlay" @click.self="handleClose">
        <div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="settings-title">

          <!-- Header -->
          <div class="modal-header">
            <div class="modal-title-group">
              <div class="modal-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              </div>
              <div>
                <h2 id="settings-title" class="modal-title">Settings</h2>
                <p class="modal-subtitle">Configure your AI assistant</p>
              </div>
            </div>
            <button id="close-settings-btn" class="close-btn" @click="handleClose" title="Close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="modal-body">

            <!-- Service Provider Selection -->
            <div class="form-section">
              <div class="section-label">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
                Service Provider
              </div>
              <div class="provider-selector">
                <button
                  v-for="p in ['google', 'groq', 'ollama']"
                  :key="p"
                  class="provider-card"
                  :class="{ active: localProvider === p }"
                  @click="localProvider = p"
                >
                  <div class="provider-card-icon">
                    <svg v-if="p === 'google'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                    <svg v-else-if="p === 'groq'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>
                    <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
                  </div>
                  <div class="provider-card-info">
                    <span class="provider-name">{{ p === 'google' ? 'Gemini' : (p === 'groq' ? 'Groq' : 'Ollama') }}</span>
                    <span class="provider-type">{{ p === 'ollama' ? 'Local Host' : 'Cloud API' }}</span>
                  </div>
                </button>
              </div>
            </div>

            <!-- API Key section -->
            <div class="form-section">
              <div class="section-label">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
                </svg>
                {{ localProvider === 'google' ? 'Gemini' : (localProvider === 'groq' ? 'Groq' : 'Ollama') }} {{ localProvider === 'ollama' ? 'Configuration' : 'API Key' }}
                <button 
                  v-if="localProvider !== 'ollama' && (localProvider === 'google' ? localGeminiKey : localGroqKey)" 
                  class="disconnect-link" 
                  @click="localProvider === 'google' ? (localGeminiKey = '') : (localGroqKey = '')"
                >
                  Remove
                </button>
              </div>

              <div v-if="localProvider === 'google'" class="input-group">
                <input
                  v-model="localGeminiKey"
                  :type="showApiKey ? 'text' : 'password'"
                  class="form-input input-glow"
                  placeholder="AIzaSy..."
                  autocomplete="off"
                />
                <button class="eye-btn" @click="showApiKey = !showApiKey" type="button">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path v-if="!showApiKey" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle v-if="!showApiKey" cx="12" cy="12" r="3"/>
                    <path v-else d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line v-if="showApiKey" x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </button>
                <div v-if="localGeminiKey" class="key-validation-status" :class="settings.geminiKeyStatus">
                  <template v-if="settings.geminiKeyStatus === 'validating'">
                    <div class="spinner-tiny"></div> Verifying...
                  </template>
                  <template v-else-if="settings.geminiKeyStatus === 'valid'">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Key Valid
                  </template>
                  <template v-else-if="settings.geminiKeyStatus === 'invalid'">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                    Invalid Key
                  </template>
                </div>
              </div>

              <div v-else-if="localProvider === 'groq'" class="input-group">
                <input
                  v-model="localGroqKey"
                  :type="showApiKey ? 'text' : 'password'"
                  class="form-input input-glow"
                  placeholder="gsk_..."
                  autocomplete="off"
                />
                <button class="eye-btn" @click="showApiKey = !showApiKey" type="button">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path v-if="!showApiKey" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle v-if="!showApiKey" cx="12" cy="12" r="3"/>
                    <path v-else d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line v-if="showApiKey" x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </button>
                <div v-if="localGroqKey" class="key-validation-status" :class="settings.groqKeyStatus">
                  <template v-if="settings.groqKeyStatus === 'validating'">
                    <div class="spinner-tiny"></div> Verifying...
                  </template>
                  <template v-else-if="settings.groqKeyStatus === 'valid'">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Key Valid
                  </template>
                  <template v-else-if="settings.groqKeyStatus === 'invalid'">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                    Invalid Key
                  </template>
                </div>
              </div>

              <div v-else class="local-info-box">
                <div class="info-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div class="info-text">
                  <strong>Local Server Active</strong>
                  <span>Using configuration from server .env file. No client-side key required.</span>
                </div>
              </div>

              <p class="field-hint">
                <template v-if="localProvider === 'google'">
                  Get key from <a href="https://aistudio.google.com/app/apikey" target="_blank" class="link">Google Studio ↗</a>
                </template>
                <template v-else>
                  Get key from <a href="https://console.groq.com/keys" target="_blank" class="link">Groq Console ↗</a>
                </template>
              </p>

              <!-- Privacy Notice -->
              <div class="privacy-notice">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <span><b>Privacy Focus:</b> Your API key is <u>never</u> saved to our servers. It stays securely in your browser's LocalStorage.</span>
              </div>
            </div>

            <!-- Model selection -->
            <div class="form-section">
              <div class="section-label">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                  <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                </svg>
                AI Model Selection
              </div>
              
              <!-- Model Selection Dropdown -->
              <div class="model-dropdown-container">
                <button 
                  class="dropdown-trigger input-glow" 
                  :class="{ open: showModelDropdown }"
                  @click="showModelDropdown = !showModelDropdown"
                  type="button"
                >
                  <div class="trigger-content">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                    </svg>
                    <span class="selected-label">{{ selectedModelLabel }}</span>
                  </div>
                  <svg 
                    class="chevron" 
                    width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                    :style="{ transform: showModelDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }"
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>

                <Transition name="dropdown">
                  <div v-if="showModelDropdown" class="dropdown-menu">
                    <div class="search-box">
                      <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      </svg>
                      <input 
                        v-model="modelSearch" 
                        type="text" 
                        class="search-input" 
                        placeholder="Search model (e.g. 2.5, flash)..."
                        @click.stop
                      />
                    </div>
                    
                    <div class="model-list-wrapper">
                      <div class="model-list">
                        <div v-for="tier in ['Ultra', 'High', 'Medium', 'Low']" :key="tier">
                          <div v-if="getTierModels(tier).length > 0" class="tier-header">
                            {{ tier }}
                          </div>
                          
                          <div 
                            v-for="m in getTierModels(tier)" 
                            :key="m.id"
                            class="model-option"
                            :class="{ active: localModel === m.id }"
                            @click="localModel = m.id; showModelDropdown = false"
                          >
                            <div class="model-info">
                              <div class="model-name-row">
                                <span class="model-display">{{ m.label }}</span>
                                <div 
                                  v-if="m.provider === 'google'"
                                  class="status-indicator" 
                                  :class="getModelHealthStatus(m.id)"
                                />
                              </div>
                              <span class="model-id">{{ m.id }}</span>
                            </div>
                            <div v-if="localModel === m.id" class="check-mark">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                            </div>
                          </div>
                        </div>

                        <div v-if="settings.isFetchingModels" class="loading-models">
                          <div class="spinner-small" />
                          Discovering latest models...
                        </div>
                        
                        <div v-else-if="filteredModels.length === 0" class="no-results">
                          No models matching your search...
                        </div>
                      </div>
                    </div>
                  </div>
                </Transition>
              </div>
            </div>

            <!-- System prompt section -->
            <div class="form-section">
              <div class="section-label-row">
                <div class="section-label">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  System Prompt
                </div>
                <button class="reset-btn" @click="resetSystemPrompt">
                  Reset default
                </button>
              </div>
              <textarea
                v-model="localSystemPrompt"
                class="form-textarea input-glow"
                rows="15"
              />
            </div>
          </div>

          <!-- Footer -->
          <div class="modal-footer">
            <div class="save-status" :class="saveStatus">
              <template v-if="saveStatus === 'saved'">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Settings saved!
              </template>
            </div>
            <div class="footer-btns">
              <button id="cancel-settings-btn" class="btn-secondary" @click="handleClose">Cancel</button>
              <button 
                id="save-settings-btn" 
                class="btn-primary" 
                :disabled="!isKeyValid || saveStatus === 'saved'"
                @click="handleSave"
              >
                <template v-if="settings.geminiKeyStatus === 'validating' || settings.groqKeyStatus === 'validating'">
                  <div class="spinner-tiny"></div> Verifying...
                </template>
                <template v-else>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/>
                    <polyline points="7 3 7 8 15 8"/>
                  </svg>
                  Save Settings
                </template>
              </button>
            </div>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useSettingsStore } from '~/stores/settings'

const props = defineProps<{ isOpen: boolean }>()
const emit = defineEmits<{ close: [] }>()

const settings = useSettingsStore()

const localProvider = ref<'google' | 'groq'>('google')
const localGeminiKey = ref('')
const localGroqKey = ref('')
const localSystemPrompt = ref('')
const localModel = ref('')
const showApiKey = ref(false)
const saveStatus = ref<'idle' | 'saved'>('idle')

const modelSearch = ref('')
const pollingInterval = ref<any>(null)
let validationTimeout: any = null
const showModelDropdown = ref(false)

const selectedModelLabel = computed(() => {
  const models = localProvider.value === 'google' 
    ? settings.availableModels 
    : settings.groqAvailableModels
  const found = models.find(m => m.id === localModel.value)
  return found ? found.label : localModel.value
})

// Watch for manual key edits to trigger validation (Debounced)

// Watch for manual key edits to trigger validation (Debounced)
watch(localGeminiKey, (newVal) => {
  clearTimeout(validationTimeout)
  validationTimeout = setTimeout(() => {
    settings.validateKey('google', newVal)
  }, 600)
})

watch(localGroqKey, (newVal) => {
  clearTimeout(validationTimeout)
  validationTimeout = setTimeout(() => {
    settings.validateKey('groq', newVal)
  }, 600)
})

// Static Groq list
const groqModels = [
  { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B (High Performance)' },
  { id: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B (Ultra Fast)' },
  { id: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B (Deep Reasoning)' },
]

const filteredModels = computed(() => {
  const models = localProvider.value === 'google' 
    ? settings.availableModels 
    : settings.groqAvailableModels
  
  const search = modelSearch.value.toLowerCase()
  return models.filter(m => 
    m.label.toLowerCase().includes(search) || 
    m.id.toLowerCase().includes(search)
  )
})

const isKeyValid = computed(() => {
  if (localProvider.value === 'google') {
    return localGeminiKey.value === '' || settings.geminiKeyStatus === 'valid'
  }
  return localGroqKey.value === '' || settings.groqKeyStatus === 'valid'
})

function getTierModels(tier: string) {
  const models = localProvider.value === 'google' 
    ? settings.availableModels 
    : settings.groqAvailableModels
  
  const filtered = models.filter(m => {
    if (m.provider !== localProvider.value) return false
    if (!modelSearch.value) return m.tier === tier
    const search = modelSearch.value.toLowerCase()
    return m.tier === tier && (
      m.label.toLowerCase().includes(search) || 
      m.id.toLowerCase().includes(search)
    )
  })
  return filtered
}

function getModelHealthStatus(id: string) {
  const health = settings.modelHealth[id]
  if (!health) return 'unknown'
  return health.status
}

function getModelHealthTitle(id: string) {
  const health = settings.modelHealth[id]
  if (!health) return 'Status: Unknown'
  if (health.status === 'healthy') return `Healthy (${health.latency})`
  if (health.status === 'limited') return 'Warning: Rate Limited'
  return 'Error: Unavailable'
}

// Sync local state when modal opens
watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      localProvider.value = settings.provider
      localGeminiKey.value = settings.geminiApiKey
      localGroqKey.value = settings.groqApiKey
      localSystemPrompt.value = settings.systemPrompt
      localModel.value = settings.model
      saveStatus.value = 'idle'
      showApiKey.value = false
      
      // Discovery & Polling
      settings.discoverModels()
      startHealthPolling()

      // Initial validation if keys exist
      if (localGeminiKey.value) settings.validateKey('google', localGeminiKey.value)
      if (localGroqKey.value) settings.validateKey('groq', localGroqKey.value)
    } else {
      stopHealthPolling()
    }
  }
)

function startHealthPolling() {
  stopHealthPolling()
  // Initial check
  settings.checkHealth(localModel.value)
  // Interval every 30s
  pollingInterval.value = setInterval(() => {
    settings.checkHealth(localModel.value)
  }, 30000)
}

function stopHealthPolling() {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value)
    pollingInterval.value = null
  }
}

// Only reset model if the user manually changes provider WHILE the modal is open
watch(localProvider, (newProvider, oldProvider) => {
  if (!props.isOpen) return
  if (newProvider === oldProvider) return
  
  if (newProvider === 'google') {
    localModel.value = 'gemini-2.5-flash'
  } else {
    localModel.value = 'llama-3.3-70b-versatile'
  }
})

function handleSave() {
  if (!isKeyValid.value) return
  
  settings.saveSettings({
    provider: localProvider.value,
    geminiApiKey: localGeminiKey.value,
    groqApiKey: localGroqKey.value,
    systemPrompt: localSystemPrompt.value,
    model: localModel.value,
  })
  saveStatus.value = 'saved'
  setTimeout(() => {
    saveStatus.value = 'idle'
    emit('close')
  }, 800)
}

function handleClose() {
  emit('close')
}

function resetSystemPrompt() {
  settings.resetSystemPrompt()
  localSystemPrompt.value = settings.systemPrompt
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.65);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}

.modal-panel {
  background: #0f1520;
  border: 1px solid #252f45;
  border-radius: 18px;
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow: hidden; /* Prevent double scrollbars */
  box-shadow: 0 25px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(251,191,36,0.05);
  display: flex;
  flex-direction: column;
  transition: max-width 0.3s ease;
}

@media (min-width: 768px) {
  .modal-panel {
    max-width: 720px;
  }
}

/* Header */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 24px 18px;
  border-bottom: 1px solid #252f45;
}

.modal-title-group { display: flex; align-items: center; gap: 14px; }

.modal-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.05));
  border: 1px solid rgba(251,191,36,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fbbf24;
}

.modal-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0;
}

.modal-subtitle { font-size: 0.78rem; color: #6b7fa3; margin: 2px 0 0; }

.close-btn {
  width: 34px;
  height: 34px;
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

.close-btn:hover { background: #1e2940; color: #e2e8f0; border-color: #344060; }

/* Body */
.modal-body {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  overflow-y: auto;
}

.form-section { display: flex; flex-direction: column; gap: 8px; }

/* Provider Selector Redesign */
.provider-selector {
  display: flex;
  gap: 10px;
  width: 100%;
}

.provider-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 12px;
  background: #141922;
  border: 1px solid #252f45;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  color: #6b7fa3;
}

.provider-card:hover {
  border-color: #3b4c73;
  background: #1a212e;
  transform: translateY(-2px);
}

.provider-card.active {
  background: linear-gradient(135deg, rgba(59,130,246,0.1), rgba(59,130,246,0.03));
  border-color: #3b82f6;
  color: #e2e8f0;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2), inset 0 0 12px rgba(59,130,246,0.05);
}

.provider-card-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.03);
  border-radius: 10px;
  transition: all 0.2s;
}

.active .provider-card-icon {
  background: #3b82f6;
  color: white;
  box-shadow: 0 0 12px rgba(59,130,246,0.4);
}

.provider-card-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.provider-name {
  font-size: 0.85rem;
  font-weight: 700;
}

.provider-type {
  font-size: 0.65rem;
  font-weight: 500;
  opacity: 0.6;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.provider-toggle {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  background: #141922;
  padding: 4px;
  border-radius: 12px;
  border: 1px solid #252f45;
}

.provider-btn {
  padding: 8px 12px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid transparent;
  color: #6b7fa3;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.provider-btn.active {
  background: #1e2940;
  border-color: #344060;
  color: #fbbf24;
  box-shadow: 0 2px 10px rgba(0,0,0,0.3);
}

.provider-btn:hover:not(.active) {
  color: #e2e8f0;
  background: rgba(255,255,255,0.03);
}

.section-label {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  width: 100%;
}

.disconnect-link {
  margin-left: auto;
  background: none;
  border: none;
  color: #ef4444;
  font-size: 0.65rem;
  font-weight: 700;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.disconnect-link:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
}

.section-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.reset-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  background: none;
  border: 1px solid #252f45;
  color: #6b7fa3;
  font-size: 0.72rem;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-btn:hover { color: #fbbf24; border-color: rgba(251,191,36,0.3); background: rgba(251,191,36,0.05); }

/* Inputs */
.input-group { position: relative; }

.form-input, .form-textarea {
  width: 100%;
  background: #141922;
  border: 1px solid #252f45;
  border-radius: 10px;
  padding: 12px 16px;
  color: #e2e8f0;
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.input-group .form-input { padding-right: 44px; }

.form-input::placeholder, .form-textarea::placeholder { color: #6b7fa3; }

.form-textarea {
  resize: vertical;
  min-height: 120px;
  line-height: 1.6;
  font-size: 0.82rem;
}

.eye-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6b7fa3;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}

.eye-btn:hover { color: #94a3b8; }

/* Model Selector Searchable */
.model-selector-container {
  background: #141922;
  border: 1px solid #252f45;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-bottom: 1px solid #252f45;
  background: rgba(255,255,255,0.02);
}

.search-icon { color: #6b7fa3; flex-shrink: 0; }

.model-dropdown-container {
  position: relative;
  width: 100%;
}

.dropdown-trigger {
  width: 100%;
  background: #141922;
  border: 1px solid #252f45;
  border-radius: 10px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s;
  color: #e2e8f0;
}

.dropdown-trigger:hover {
  border-color: #344060;
  background: #1a202c;
}

.dropdown-trigger.open {
  border-color: #fbbf24;
  box-shadow: 0 0 0 3px rgba(251,191,36,0.1);
}

.trigger-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.selected-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #f1f5f9;
}

.chevron {
  color: #6b7fa3;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: #111827;
  border: 1px solid #252f45;
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.6);
  z-index: 100;
  overflow: hidden;
  backdrop-filter: blur(8px);
}

.dropdown-menu .search-box {
  position: relative;
  padding: 14px;
  background: rgba(255,255,255,0.02);
  border-bottom: 1px solid #252f45;
}

.dropdown-menu .search-input {
  width: 100%;
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 10px;
  padding: 10px 12px 10px 38px;
  font-size: 0.85rem;
  color: #e2e8f0;
}

.dropdown-menu .search-icon {
  position: absolute;
  left: 26px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7fa3;
}

.dropdown-menu .model-list-wrapper {
  max-height: 280px;
  overflow-y: auto;
}

.dropdown-menu .model-option:hover {
  background: rgba(255,255,255,0.03);
}

/* Dropdown Transitions */
.dropdown-enter-active, .dropdown-leave-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.98);
}

.search-input {
  background: transparent;
  border: none;
  color: #e2e8f0;
  font-size: 0.85rem;
  width: 100%;
  outline: none;
}

.model-list-wrapper {
  max-height: 250px;
  overflow-y: auto;
}

.model-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  cursor: pointer;
  transition: all 0.15s;
}

.model-option:hover { background: #1e2940; }
.model-option.active { background: rgba(251,191,36,0.08); }

.model-info { display: flex; flex-direction: column; gap: 2px; flex: 1; }
.model-name-row { display: flex; align-items: center; gap: 8px; }
.model-display { font-size: 0.85rem; font-weight: 600; color: #e2e8f0; }
.model-option.active .model-display { color: #fbbf24; }

.status-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-indicator.healthy { 
  background: #34d399; 
  box-shadow: 0 0 6px rgba(52, 211, 153, 0.4);
}
.status-indicator.limited { 
  background: #fbbf24; 
  box-shadow: 0 0 6px rgba(251, 191, 36, 0.4);
}
.status-indicator.error { 
  background: #f87171; 
  box-shadow: 0 0 6px rgba(248, 113, 113, 0.4);
}
.status-indicator.unknown { background: #4b5563; opacity: 0.5; }

.key-validation-status {
  position: absolute;
  right: 48px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.65rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  pointer-events: none;
  text-transform: uppercase;
}

.key-validation-status.validating { color: #94a3b8; background: rgba(148, 163, 184, 0.1); }
.key-validation-status.valid { color: #10b981; background: rgba(16, 185, 129, 0.1); }
.key-validation-status.invalid { color: #ef4444; background: rgba(239, 68, 68, 0.1); }

.spinner-tiny {
  width: 10px;
  height: 10px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: key-spin 0.8s linear infinite;
}

@keyframes key-spin {
  to { transform: rotate(360deg); }
}

.tier-header {
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.03);
  border-left: 2px solid #344060;
  color: #94a3b8;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 12px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tier-header:first-child { margin-top: 0; }

.model-id { font-size: 0.72rem; color: #6b7fa3; font-family: monospace; }

.check-mark { color: #fbbf24; }

.no-results {
  padding: 20px;
  text-align: center;
  font-size: 0.8rem;
  color: #6b7fa3;
}

.field-hint { font-size: 0.73rem; color: #6b7fa3; margin: 0; }

.privacy-notice {
  margin-top: 10px;
  padding: 10px 12px;
  background: rgba(16, 185, 129, 0.04);
  border: 1px solid rgba(16, 185, 129, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  color: #94a3b8;
  font-size: 0.72rem;
  line-height: 1.4;
}

.privacy-notice svg {
  color: #10b981;
  margin-top: 2px;
  flex-shrink: 0;
}

.privacy-notice b { color: #10b981; font-weight: 700; }
.privacy-notice u { text-underline-offset: 2px; text-decoration-color: rgba(16, 185, 129, 0.3); }

.link { color: #fbbf24; text-decoration: none; }
.link:hover { color: #fcd34d; text-decoration: underline; }

/* Footer */
.modal-footer {
  padding: 16px 24px 20px;
  border-top: 1px solid #252f45;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.save-status {
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 100px;
}

.save-status.saved { color: #34d399; }

.footer-btns { display: flex; gap: 10px; }

.btn-secondary, .btn-primary {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: transparent;
  border: 1px solid #252f45;
  color: #94a3b8;
}

.btn-secondary:hover { background: #1e2940; color: #e2e8f0; border-color: #344060; }

.btn-primary {
  background: linear-gradient(135deg, #fbbf24, #d97706);
  border: none;
  color: #0d1117;
  box-shadow: 0 4px 14px rgba(251,191,36,0.3);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(251,191,36,0.4);
  background: linear-gradient(135deg, #fcd34d, #fbbf24);
}

.btn-primary:disabled {
  background: #252f45;
  color: #6b7fa3;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  border: 1px solid #344060;
}

.local-info-box {
  display: flex;
  gap: 14px;
  padding: 14px 16px;
  background: rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 12px;
  margin-bottom: 4px;
}

.info-icon {
  width: 32px;
  height: 32px;
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.info-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-text strong {
  font-size: 0.85rem;
  color: #e2e8f0;
}

.info-text span {
  font-size: 0.72rem;
  color: #94a3b8;
  line-height: 1.4;
}

/* Modal transition */
.modal-enter-active { transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
.modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from { opacity: 0; transform: scale(0.94) translateY(16px); }
.modal-leave-to { opacity: 0; transform: scale(0.97) translateY(8px); }
</style>
