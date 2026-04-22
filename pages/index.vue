<template>
  <div class="app-layout dark">
    <!-- Sidebar -->
    <Sidebar
      :active-chat-id="chat.conversationId"
      :recent-chats="recentChats"
      :is-mobile-open="isMobileOpen"
      @open-settings="settingsOpen = true"
      @close-mobile="isMobileOpen = false"
      @select-chat="handleSelectChat"
    />

    <!-- Mobile Backdrop -->
    <Transition name="fade">
      <div v-if="isMobileOpen" class="sidebar-backdrop" @click="isMobileOpen = false" />
    </Transition>

    <!-- Main area -->
    <main class="main-area">
      <!-- Top bar -->
      <header class="top-bar">
        <div class="top-bar-left">
          <button class="menu-btn mobile-only" @click="isMobileOpen = true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <h2 class="page-title">
            <span class="gradient-text">Lua</span> Chat
          </h2>
          <div class="model-badge" v-if="settings.model">
            <span class="model-dot" />
            {{ modelLabel }}
          </div>
        </div>
        <div class="top-bar-right">
          <button
            id="clear-chat-btn"
            class="icon-btn"
            v-if="chat.hasMessages"
            @click="chat.newChat()"
            title="Clear conversation"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
          <button
            class="icon-btn"
            @click="settingsOpen = true"
            title="Open settings"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
        </div>
      </header>

      <!-- Chat window -->
      <ChatWindow @use-suggestion="handleSuggestion" @open-settings="settingsOpen = true" />

      <!-- Input -->
      <ChatInput @open-settings="settingsOpen = true" />
    </main>

    <!-- Settings modal -->
    <SettingsModal :is-open="settingsOpen" @close="settingsOpen = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useChatStore } from '~/stores/chat'
import { useSettingsStore } from '~/stores/settings'

const chat = useChatStore()
const settings = useSettingsStore()

const settingsOpen = ref(false)
const isMobileOpen = ref(false)

const modelLabel = computed(() => {
  const model = settings.model
  const labels: Record<string, string> = {
    'gemini-2.5-flash': 'Gemini 2.5 Flash',
    'gemini-2.5-pro': 'Gemini 2.5 Pro',
    'gemini-2.5-flash-lite': 'Gemini 2.5 Flash-Lite',
    'gemini-2.0-flash': 'Gemini 2.0 Flash',
    'gemini-2.0-flash-lite': 'Gemini 2.0 Flash-Lite',
    'gemini-3-pro-preview': 'Gemini 3 Pro',
    'deep-research-max-preview-04-2026': 'Deep Research Max',
    'deep-research-preview-04-2026': 'Deep Research',
    'gemma-4-31b-it': 'Gemma 4 31B',
    'llama-3.3-70b-versatile': 'Llama 3.3 70B',
  }
  
  if (labels[model]) return labels[model]
  
  // Dynamic fallback: Format "gemini-3.1-pro-preview" -> "3.1 Pro Preview"
  return model
    .replace('gemini-', '')
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
})

// Build recent chats list from session history
const recentChats = computed(() => {
  return Object.values(chat.sessions)
    .sort((a, b) => b.timestamp - a.timestamp)
    .map(s => ({ id: s.id, title: s.title }))
})

function handleSelectChat(id: string) {
  chat.switchChat(id)
}

function handleSuggestion(text: string) {
  chat.sendMessage(text)
}
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: #0d1117;
  position: relative;
}

.main-area {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  min-width: 0;
  background: radial-gradient(ellipse at 20% 0%, rgba(251,191,36,0.04) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 100%, rgba(16,185,129,0.03) 0%, transparent 50%),
              #0d1117;
}

.sidebar-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 40;
}

/* Top bar */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  border-bottom: 1px solid #252f45;
  flex-shrink: 0;
  background: rgba(13,17,23,0.8);
  backdrop-filter: blur(8px);
}

.top-bar-left { display: flex; align-items: center; gap: 14px; }
.top-bar-right { display: flex; align-items: center; gap: 8px; }

.menu-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid #252f45;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
  margin-right: -4px;
}

.menu-btn:hover {
  background: #1e2940;
  border-color: #344060;
  color: #e2e8f0;
}

.mobile-only { display: none; }

@media (max-width: 768px) {
  .mobile-only { display: flex; }
  .top-bar { padding: 12px 16px; }
}

.page-title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  color: #f1f5f9;
}

.model-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  background: rgba(251,191,36,0.08);
  border: 1px solid rgba(251,191,36,0.18);
  font-size: 0.72rem;
  color: #fbbf24;
  font-weight: 500;
}

.model-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #34d399;
  box-shadow: 0 0 5px rgba(52,211,153,0.6);
  animation: breathe 2s ease-in-out infinite;
}

@keyframes breathe {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid #252f45;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-btn:hover {
  background: #1e2940;
  border-color: #344060;
  color: #e2e8f0;
}
</style>
