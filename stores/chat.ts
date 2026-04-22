import { defineStore } from 'pinia'
import { useSettingsStore } from './settings'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  isError?: boolean
}

export interface ChatSession {
  id: string
  title: string
  messages: Message[]
  timestamp: number
}

export interface ChatState {
  messages: Message[]
  isLoading: boolean
  conversationId: string
  sessions: Record<string, ChatSession>
}

const HISTORY_KEY = 'luascript-chats-v1'

function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
}

export const useChatStore = defineStore('chat', {
  state: (): ChatState => ({
    messages: [],
    isLoading: false,
    conversationId: generateId(),
    sessions: {},
  }),

  getters: {
    hasMessages: (state) => state.messages.length > 0,
    lastMessage: (state) => state.messages[state.messages.length - 1],

    // Build Gemini-format history (excludes the current user message)
    // Ensures roles alternate correctly (user, model, user, model...)
    geminiHistory(state): { role: string; parts: { text: string }[] }[] {
      const history: { role: string; parts: { text: string }[] }[] = []
      
      const validMessages = state.messages.filter((m) => !m.isError)
      
      for (const msg of validMessages) {
        const role = msg.role === 'user' ? 'user' : 'model'
        
        // Gemini requires alternating roles. If the last role is the same, 
        // we skip this message to maintain valid history sequence.
        if (history.length > 0 && history[history.length - 1].role === role) {
          continue
        }
        
        history.push({
          role,
          parts: [{ text: msg.content }],
        })
      }
      
      return history
    },
  },

  actions: {
    async sendMessage(userText: string) {
      const settings = useSettingsStore()
      if (!userText.trim()) return

      // Push user message
      const userMsg: Message = {
        id: generateId(),
        role: 'user',
        content: userText.trim(),
        timestamp: Date.now(),
      }
      this.messages.push(userMsg)
      this.isLoading = true
      
      // Update session title on first message
      this.updateCurrentSession()

      try {
        const response = await $fetch('/api/chat', {
          method: 'POST',
          body: {
            message: userMsg.content,
            history: this.geminiHistory.slice(0, -1),
            apiKey: settings.apiKey,
            systemPrompt: settings.systemPrompt,
            model: settings.model,
            provider: settings.provider,
          },
        })

        const fullText = (response as any).text || 'No response received.'
        
        // Create an empty assistant message for streaming
        const assistantMsg: Message = {
          id: generateId(),
          role: 'assistant',
          content: '',
          timestamp: Date.now(),
        }
        this.messages.push(assistantMsg)
        this.isLoading = false // Hide thinking indicator before streaming starts

        // Typewriter effect logic
        await this.streamText(assistantMsg.id, fullText)
        this.updateCurrentSession()

      } catch (err: any) {
        const errText = err?.data?.message || err?.message || 'An unknown error occurred.'
        this.pushError(`❌ API Error: ${errText}`)
      } finally {
        this.isLoading = false
      }
    },

    async streamText(messageId: string, fullText: string) {
      const msg = this.messages.find(m => m.id === messageId)
      if (!msg) return

      // Adjust speed for a very deliberate and premium typewriter feel
      const delay = fullText.length > 500 ? 25 : 50 
      const chunks = fullText.split(' ')
      
      for (let i = 0; i < chunks.length; i++) {
        msg.content += (i === 0 ? '' : ' ') + chunks[i]
        // Small delay between words/chunks for smooth visual flow
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    },

    pushError(text: string) {
      this.messages.push({
        id: generateId(),
        role: 'assistant',
        content: text,
        timestamp: Date.now(),
        isError: true,
      })
    },

    newChat() {
      this.messages = []
      this.isLoading = false
      this.conversationId = generateId()
      this.saveToStorage()
    },

    updateCurrentSession() {
      if (this.messages.length === 0) return

      const firstUserMsg = this.messages.find(m => m.role === 'user')
      const title = firstUserMsg 
        ? firstUserMsg.content.substring(0, 40) + (firstUserMsg.content.length > 40 ? '…' : '')
        : 'New Chat'

      this.sessions[this.conversationId] = {
        id: this.conversationId,
        title,
        messages: [...this.messages],
        timestamp: Date.now()
      }
      this.saveToStorage()
    },

    saveToStorage() {
      if (import.meta.server) return
      localStorage.setItem(HISTORY_KEY, JSON.stringify(this.sessions))
    },

    initialize() {
      if (import.meta.server) return
      const raw = localStorage.getItem(HISTORY_KEY)
      if (raw) {
        try {
          this.sessions = JSON.parse(raw)
          // Always start with a fresh new chat on refresh
          this.newChat()
        } catch (err) {
          console.error('Failed to parse chat history:', err)
        }
      }
    },

    switchChat(id: string) {
      const session = this.sessions[id]
      if (session) {
        this.conversationId = session.id
        this.messages = [...session.messages]
        this.isLoading = false
      }
    },

    deleteChat(id: string) {
      delete this.sessions[id]
      if (this.conversationId === id) {
        this.newChat()
      } else {
        this.saveToStorage()
      }
    },

    renameChat(id: string, newTitle: string) {
      if (this.sessions[id]) {
        this.sessions[id].title = newTitle.trim() || 'Untitled Chat'
        this.saveToStorage()
      }
    },
  },
})
