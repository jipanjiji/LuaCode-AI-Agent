import { defineStore } from 'pinia'
import {
  FALLBACK_GEMINI_MODELS,
  FALLBACK_GROQ_MODELS,
  getModelTier,
  type ModelInfo
} from '~/utils/model-list'

const DEFAULT_SYSTEM_PROMPT = `You are **LuaScript AI Agent**, an elite Senior Roblox Scripting Consultant. You provide high-performance, executor-ready Luau solutions.

### Core Principles:
1. **Contextual Awareness**: If the user is only greeting you or asking a general non-technical question, respond naturally and professionally. ONLY provide code blocks if the user's request requires technical implementation.
2. **Language Adaptive**: Your default response language is **English**. However, if the user communicates in **Indonesian**, you must respond in Indonesian.
3. **Professional Standards**: NEVER use deprecated practices (e.g., \`BodyVelocity\`). Use modern alternatives (\`LinearVelocity\`, \`CFrame\` manipulation).
4. **Strict Expert Persona**: You are NOT a tutor. Do NOT provide "Peringatan" or tutorial commentary for simple tasks. Provide the code directly.
5. **Complexity Scaling**: 
   - SIMPLE: Direct snippets, one-liners, or basic loops.
   - COMPLEX: Modular, robust systems only when asked for "Complex", "UI", or "Hub" features.
6. **No Meta-Talk**: Do not apologize or explain technical decisions unless requested.

### Response Structure (If technical):
1. **The Code Block**: Optimized Luau script.
2. **Technical Notes**: One or two bullet points for critical variables only.`

const STORAGE_KEY = 'luascript-settings'

export interface SettingsState {
  provider: 'google' | 'groq' | 'ollama'
  geminiApiKey: string
  groqApiKey: string
  ollamaBaseUrl: string
  ollamaModel: string
  systemPrompt: string
  model: string
  availableModels: ModelInfo[]
  groqAvailableModels: ModelInfo[]
  modelHealth: Record<string, { status: string; latency?: string; lastChecked: number }>
  isFetchingModels: boolean
  geminiKeyStatus: 'idle' | 'validating' | 'valid' | 'invalid'
  groqKeyStatus: 'idle' | 'validating' | 'valid' | 'invalid'
}

function loadFromStorage(): Partial<SettingsState> {
  if (import.meta.server) return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)

    // Migration: if old 'apiKey' exists, move it to 'geminiApiKey'
    if (parsed.apiKey && !parsed.geminiApiKey) {
      parsed.geminiApiKey = parsed.apiKey
      delete parsed.apiKey
    }

    return parsed
  } catch {
    return {}
  }
}

function saveToStorage(state: SettingsState) {
  if (import.meta.server) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      provider: state.provider,
      geminiApiKey: state.geminiApiKey,
      groqApiKey: state.groqApiKey,
      ollamaBaseUrl: state.ollamaBaseUrl,
      ollamaModel: state.ollamaModel,
      systemPrompt: state.systemPrompt,
      model: state.model
    }))
  } catch (err) {
    console.error('Failed to save settings:', err)
  }
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => {
    const saved = loadFromStorage()
    const provider = saved.provider || 'google'

    return {
      provider: provider as 'google' | 'groq' | 'ollama',
      geminiApiKey: saved.geminiApiKey || '',
      groqApiKey: saved.groqApiKey || '',
      ollamaBaseUrl: saved.ollamaBaseUrl || 'https://laptop-evaluation-gauge-magnificent.trycloudflare.com/',
      ollamaModel: saved.ollamaModel || 'deepseek-r1:8b',
      systemPrompt: saved.systemPrompt || DEFAULT_SYSTEM_PROMPT,
      model: saved.model || (provider === 'google' ? 'gemini-2.5-flash' : (provider === 'groq' ? 'llama-3.3-70b-versatile' : saved.ollamaModel || 'deepseek-r1:8b')),

      // Initialize with Hardcoded Fallbacks
      availableModels: [...FALLBACK_GEMINI_MODELS],
      groqAvailableModels: [...FALLBACK_GROQ_MODELS],
      modelHealth: {},
      isFetchingModels: false,
      geminiKeyStatus: 'idle',
      groqKeyStatus: 'idle',
    }
  },

  getters: {
    apiKey: (state) => state.provider === 'google' ? state.geminiApiKey : state.groqApiKey,
    hasApiKey: (state) => {
      const key = state.provider === 'google' ? state.geminiApiKey : state.groqApiKey
      return key.trim().length > 0
    },
    maskedApiKey: (state) => {
      const key = state.provider === 'google' ? state.geminiApiKey : state.groqApiKey
      if (!key) return ''
      if (key.length <= 8) return '••••••••'
      return key.substring(0, 4) + '••••••••' + key.substring(key.length - 4)
    },
  },

  actions: {
    saveSettings(payload: Partial<SettingsState>) {
      if (payload.provider !== undefined) this.provider = payload.provider
      if (payload.geminiApiKey !== undefined) this.geminiApiKey = payload.geminiApiKey
      if (payload.groqApiKey !== undefined) this.groqApiKey = payload.groqApiKey
      if (payload.ollamaBaseUrl !== undefined) this.ollamaBaseUrl = payload.ollamaBaseUrl
      if (payload.ollamaModel !== undefined) this.ollamaModel = payload.ollamaModel
      if (payload.systemPrompt !== undefined) this.systemPrompt = payload.systemPrompt
      if (payload.model !== undefined) this.model = payload.model
      saveToStorage(this.$state)
    },

    async validateKey(provider: 'google' | 'groq', key: string) {
      if (!key.trim()) {
        if (provider === 'google') this.geminiKeyStatus = 'idle'
        else this.groqKeyStatus = 'idle'
        return
      }

      if (provider === 'google') this.geminiKeyStatus = 'validating'
      else this.groqKeyStatus = 'validating'

      try {
        const endpoint = provider === 'google' ? '/api/models' : '/api/groq-models'
        const result = await $fetch(endpoint, { query: { key } }) as any

        const isValid = !result.fallback && result.models?.length > 0

        if (provider === 'google') {
          this.geminiKeyStatus = isValid ? 'valid' : 'invalid'
          if (isValid) {
            this.availableModels = result.models.map((m: any) => ({
              ...m,
              tier: getModelTier(m.id),
              provider: 'google'
            }))
          }
        } else {
          this.groqKeyStatus = isValid ? 'valid' : 'invalid'
          if (isValid) {
            this.groqAvailableModels = result.models.map((m: any) => ({
              ...m,
              tier: getModelTier(m.id),
              provider: 'groq'
            }))
          }
        }
      } catch (err) {
        if (provider === 'google') this.geminiKeyStatus = 'invalid'
        else this.groqKeyStatus = 'invalid'
      }
    },

    async discoverModels() {
      if (this.isFetchingModels) return
      this.isFetchingModels = true

      try {
        // 1. Discover Google Models
        const gResult = await $fetch('/api/models', {
          query: { key: this.geminiApiKey }
        }) as any

        if (!gResult.fallback && gResult.models?.length > 0) {
          this.availableModels = gResult.models.map((m: any) => ({
            ...m,
            tier: getModelTier(m.id),
            provider: 'google'
          }))
        }

        // 2. Discover Groq Models
        const groqResult = await $fetch('/api/groq-models', {
          query: { key: this.groqApiKey }
        }) as any

        if (!groqResult.fallback && groqResult.models?.length > 0) {
          this.groqAvailableModels = groqResult.models.map((m: any) => ({
            ...m,
            tier: getModelTier(m.id),
            provider: 'groq'
          }))
        }

        this.fullHealthScan()
      } catch (err) {
        console.error('Failed to discover models:', err)
      } finally {
        this.isFetchingModels = false
      }
    },

    async checkHealth(modelId: string) {
      if (this.provider !== 'google') return

      try {
        const data = await $fetch('/api/health', { query: { model: modelId } }) as any
        this.modelHealth[modelId] = {
          status: data.status,
          latency: data.latency,
          lastChecked: Date.now()
        }
      } catch (err) {
        this.modelHealth[modelId] = {
          status: 'error',
          lastChecked: Date.now()
        }
      }
    },

    async fullHealthScan() {
      const topModels = this.availableModels.slice(0, 5)
      for (const m of topModels) {
        await this.checkHealth(m.id)
      }
    },

    initialize() {
      if (import.meta.server) return
      const saved = loadFromStorage()
      if (Object.keys(saved).length > 0) {
        this.saveSettings(saved)
        // Refresh models if we have a key
        if (this.hasApiKey) {
          this.discoverModels()
        }
      }
    },

    resetSystemPrompt() {
      this.systemPrompt = DEFAULT_SYSTEM_PROMPT
      saveToStorage(this.$state)
    },
  },
})
