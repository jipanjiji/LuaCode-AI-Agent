<template>
  <aside class="sidebar" :class="{ collapsed: isCollapsed, 'mobile-open': isMobileOpen }">
    <!-- Brand -->
    <div class="sidebar-brand" :class="{ 'clickable': isCollapsed }" @click="isCollapsed ? isCollapsed = false : null">
      <div class="brand-icon">
        <img src="/logo.png" alt="Logo" class="logo-img" />
      </div>
      <Transition name="fade-text">
        <div v-if="!isCollapsed" class="brand-text">
          <span class="brand-name gradient-text">LuaScript</span>
          <span class="brand-sub">AI Agent</span>
        </div>
      </Transition>
      <button v-if="!isCollapsed" class="collapse-btn" @click.stop="handleCollapse" title="Collapse">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
    </div>

    <!-- New Chat -->
    <button id="new-chat-btn" class="new-chat-btn" @click="handleNewChat" :title="isCollapsed ? 'New Chat' : ''">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M12 5v14M5 12h14"/>
      </svg>
      <Transition name="fade-text">
        <span v-if="!isCollapsed">New Chat</span>
      </Transition>
    </button>

    <!-- Chat History -->
    <div class="history-section" v-if="!isCollapsed">
      <p class="history-label">Recent</p>
      <TransitionGroup name="history-list" tag="div" class="history-list">
        <div
          v-for="item in recentChats"
          :key="item.id"
          class="history-item-container"
          :class="{ active: item.id === activeChatId }"
        >
          <button
            class="history-item"
            @click="selectChat(item.id)"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span class="history-item-text">{{ item.title }}</span>
          </button>
          
          <button class="history-action-btn rename" @click.stop="handleRename(item.id, item.title)" title="Rename chat">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          
          <button class="history-action-btn delete" @click.stop="chat.deleteChat(item.id)" title="Delete chat">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </TransitionGroup>

      <p v-if="recentChats.length === 0" class="history-empty">
        No conversations yet
      </p>
    </div>

    <!-- Spacer -->
    <div class="flex-1" />

    <!-- Bottom actions -->
    <div class="sidebar-footer">
      <button
        id="settings-btn"
        class="footer-btn"
        @click="$emit('open-settings')"
        :title="isCollapsed ? 'Settings' : ''"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
        <Transition name="fade-text">
          <span v-if="!isCollapsed">Settings</span>
        </Transition>
      </button>

      <!-- API Key status indicator -->
      <div v-if="!isCollapsed" class="api-status" :class="hasApiKey ? 'connected' : 'disconnected'">
        <span class="status-dot" />
        <span class="status-text">{{ hasApiKey ? 'API Connected' : 'No API Key' }}</span>
      </div>
    </div>

    <!-- Custom Rename Modal -->
    <RenameModal
      :is-open="renameModalOpen"
      :current-title="renamingChatTitle"
      @close="renameModalOpen = false"
      @save="onRenameSave"
    />
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSettingsStore } from '~/stores/settings'
import { useChatStore } from '~/stores/chat'
import RenameModal from './RenameModal.vue'

interface ChatHistoryItem {
  id: string
  title: string
}

const props = defineProps<{
  activeChatId?: string
  recentChats?: ChatHistoryItem[]
  isMobileOpen?: boolean
}>()

const emit = defineEmits<{
  'open-settings': []
  'select-chat': [id: string]
  'close-mobile': []
}>()

const settings = useSettingsStore()
const chat = useChatStore()
const isCollapsed = ref(false)

// Rename Modal State
const renameModalOpen = ref(false)
const renamingChatId = ref('')
const renamingChatTitle = ref('')

const hasApiKey = computed(() => settings.hasApiKey)

const recentChats = computed(() => props.recentChats || [])

const selectChat = (id: string) => {
  emit('select-chat', id)
  emit('close-mobile')
}

function handleRename(id: string, oldTitle: string) {
  renamingChatId.value = id
  renamingChatTitle.value = oldTitle
  renameModalOpen.value = true
}

function onRenameSave(newTitle: string) {
  chat.renameChat(renamingChatId.value, newTitle)
  renameModalOpen.value = false
}

function handleNewChat() {
  chat.newChat()
  emit('close-mobile')
}

function handleCollapse() {
  // On mobile, this button should close the drawer
  if (window.innerWidth <= 768) {
    emit('close-mobile')
  } else {
    isCollapsed.value = !isCollapsed.value
  }
}
</script>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  width: 240px;
  min-width: 240px;
  height: 100%;
  background: #0d1117;
  border-right: 1px solid #252f45;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  position: relative;
  z-index: 100;
}

.sidebar.collapsed {
  width: 64px;
  min-width: 64px;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 280px;
    min-width: 280px;
    transform: translateX(-100%);
    box-shadow: 20px 0 50px rgba(0,0,0,0.5);
  }

  .sidebar.mobile-open {
    transform: translateX(0);
  }

  .sidebar.collapsed {
    width: 280px;
    min-width: 280px;
  }
  
  .collapse-btn { display: none; }
}

/* Brand */
.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 14px;
  border-bottom: 1px solid #252f45;
  user-select: none;
  transition: all 0.2s;
}

.sidebar-brand.clickable {
  cursor: pointer;
}

.sidebar-brand.clickable:hover {
  background: #1e2940;
}

.sidebar.collapsed .sidebar-brand {
  padding: 18px 10px;
  justify-content: center;
}

.brand-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  flex-shrink: 0;
  overflow: hidden;
}

.logo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.brand-text {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.brand-name {
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.2;
  white-space: nowrap;
}

.brand-sub {
  font-size: 0.7rem;
  color: #6b7fa3;
  font-weight: 400;
  white-space: nowrap;
}

.collapse-btn {
  margin-left: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  border: 1px solid #252f45;
  background: transparent;
  color: #6b7fa3;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.sidebar.collapsed .collapse-btn {
  position: absolute;
  right: -12px;
  top: 40px;
  background: #141922;
  border-color: #252f45;
  z-index: 10;
  width: 20px;
  height: 32px;
  border-radius: 0 6px 6px 0;
  padding-left: 2px;
}

.collapse-btn:hover {
  background: #1e2940;
  color: #e2e8f0;
}

/* New Chat */
.new-chat-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 12px;
  padding: 10px 14px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(251,191,36,0.12), rgba(245,158,11,0.08));
  border: 1px solid rgba(251,191,36,0.25);
  color: #fbbf24;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  overflow: hidden;
}

.sidebar.collapsed .new-chat-btn {
  justify-content: center;
  padding: 10px;
  margin: 12px 14px;
}

.new-chat-btn:hover {
  background: linear-gradient(135deg, rgba(251,191,36,0.2), rgba(245,158,11,0.15));
  border-color: rgba(251,191,36,0.5);
  box-shadow: 0 0 16px rgba(251,191,36,0.15);
}

/* History */
.history-section {
  padding: 0 8px;
  overflow-y: auto;
  flex: 1;
}

.history-label {
  font-size: 0.68rem;
  font-weight: 600;
  color: #6b7fa3;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 8px 8px 4px;
  margin: 0;
}

.history-list { display: flex; flex-direction: column; gap: 2px; }

.history-item-container {
  display: flex;
  align-items: center;
  gap: 2px;
  border-radius: 8px;
  position: relative;
  transition: all 0.2s;
  padding-right: 4px;
}

.history-item-container:hover {
  background: rgba(255, 255, 255, 0.03);
}

.history-item-container.active {
  background: #1e2940;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
  min-width: 0;
  text-align: left;
}

.history-item-container.active .history-item {
  color: #fbbf24;
}

.history-item-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.history-action-btn {
  opacity: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.history-item-container:hover .history-action-btn {
  opacity: 1;
}

.history-action-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #e2e8f0;
}

.history-action-btn.delete:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.history-action-btn.rename:hover {
  color: #fbbf24;
}

.history-empty {
  font-size: 0.76rem;
  color: #6b7fa3;
  text-align: center;
  padding: 20px 8px;
  margin: 0;
}

/* Footer */
.sidebar-footer {
  padding: 12px;
  border-top: 1px solid #252f45;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.footer-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid transparent;
  color: #94a3b8;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  overflow: hidden;
}

.sidebar.collapsed .footer-btn {
  justify-content: center;
  padding: 9px;
}

.footer-btn:hover {
  background: #1e2940;
  border-color: #252f45;
  color: #e2e8f0;
}

/* API status */
.api-status {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.74rem;
}

.api-status.connected { color: #34d399; }
.api-status.disconnected { color: #6b7fa3; }

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.connected .status-dot {
  background: #34d399;
  box-shadow: 0 0 6px rgba(52, 211, 153, 0.5);
  animation: breathe 2s ease-in-out infinite;
}

.disconnected .status-dot { background: #6b7fa3; }

@keyframes breathe {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Transitions */
.fade-text-enter-active, .fade-text-leave-active {
  transition: opacity 0.15s, width 0.25s;
}
.fade-text-enter-from, .fade-text-leave-to { opacity: 0; }

.history-list-enter-active { transition: all 0.3s ease; }
.history-list-enter-from { opacity: 0; transform: translateX(-10px); }
.history-list-leave-active { transition: all 0.2s ease; position: absolute; }
.history-list-leave-to { opacity: 0; }
</style>
