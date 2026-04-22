<template>
  <div class="chat-window" ref="containerRef">
    <!-- Empty state -->
    <Transition name="empty-fade">
      <div v-if="!chat.hasMessages" class="empty-state">
        <div class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <h1 class="empty-title">LuaScript AI Agent</h1>
        <p class="empty-subtitle">Your expert AI for Lua & Luau scripting</p>

        <div class="suggestions">
          <button
            v-for="suggestion in suggestions"
            :key="suggestion.text"
            class="suggestion-chip"
            :disabled="!settings.hasApiKey"
            @click="$emit('use-suggestion', suggestion.text)"
          >
            <span class="chip-icon">{{ suggestion.icon }}</span>
            <span>{{ suggestion.text }}</span>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Messages -->
    <div v-if="chat.hasMessages" class="messages-container">
      <TransitionGroup name="message" tag="div" class="messages-list">
        <ChatMessage
          v-for="msg in chat.messages"
          :key="msg.id"
          :message="msg"
        />
      </TransitionGroup>

      <!-- Advanced Thinking Indicator -->
      <ThinkingIndicator />

      <!-- Scroll anchor -->
      <div ref="bottomRef" class="scroll-anchor" />
    </div>

    <!-- Scroll to bottom button -->
    <Transition name="scroll-btn">
      <button
        v-if="showScrollBtn"
        id="scroll-to-bottom"
        class="scroll-to-bottom-btn"
        @click="scrollToBottom"
        title="Scroll to bottom"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useChatStore } from '~/stores/chat'
import { useSettingsStore } from '~/stores/settings'
import ThinkingIndicator from './ThinkingIndicator.vue'

defineEmits<{ 
  'use-suggestion': [text: string],
  'open-settings': []
}>()

const chat = useChatStore()
const settings = useSettingsStore()

const containerRef = ref<HTMLElement | null>(null)
const bottomRef = ref<HTMLElement | null>(null)
const showScrollBtn = ref(false)

const suggestions = [
  { icon: '⚔️', text: 'Create an auto-farm script for Roblox' },
  { icon: '🔒', text: 'How do I create an anti-exploit system?' },
  { icon: '🎮', text: 'Explain the difference between Lua 5.1 and Luau' },
  { icon: '🐛', text: 'Debug: My script is not running on the server' },
  { icon: '⚡', text: 'Optimize heavy loops for mobile games' },
  { icon: '🏗️', text: 'Best OOP structure for ModuleScripts' },
]

function scrollToBottom(smooth = true) {
  bottomRef.value?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant', block: 'end' })
}

function handleScroll() {
  if (!containerRef.value) return
  const { scrollTop, scrollHeight, clientHeight } = containerRef.value
  showScrollBtn.value = scrollHeight - scrollTop - clientHeight > 200
}

watch(
  () => [chat.messages.length, chat.isLoading],
  async () => {
    await nextTick()
    if (!showScrollBtn.value) scrollToBottom()
  }
)

// Watch for specific content changes (during typewriter effect)
watch(
  () => chat.messages[chat.messages.length - 1]?.content,
  async () => {
    if (!showScrollBtn.value) {
      await nextTick()
      scrollToBottom(false) // instant scroll during typing for stability
    }
  }
)

onMounted(() => {
  containerRef.value?.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  containerRef.value?.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.chat-window {
  flex: 1;
  overflow-y: auto;
  padding: 24px 20px;
  position: relative;
  scroll-behavior: smooth;
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 60vh;
  text-align: center;
  padding: 40px 20px;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.empty-icon {
  width: 84px;
  height: 84px;
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.05));
  border: 1px solid rgba(251,191,36,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fbbf24;
  margin-bottom: 24px;
  box-shadow: 0 0 30px rgba(251,191,36,0.1);
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  from { box-shadow: 0 0 10px rgba(251,191,36,0.1); }
  to { box-shadow: 0 0 30px rgba(251,191,36,0.25), 0 0 60px rgba(251,191,36,0.1); }
}

.empty-title {
  font-size: 1.8rem;
  font-weight: 700;
  background: linear-gradient(135deg, #fbbf24 0%, #fcd34d 50%, #f59e0b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 8px;
}

.empty-subtitle {
  color: #6b7fa3;
  font-size: 0.95rem;
  margin: 0 0 36px;
}

.suggestions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  max-width: 600px;
  width: 100%;
  margin-bottom: 28px;
}

.suggestion-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 10px;
  background: #141922;
  border: 1px solid #252f45;
  color: #94a3b8;
  font-size: 0.8rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
  line-height: 1.4;
}

.suggestion-chip:hover:not(:disabled) {
  background: rgba(255,255,255,0.08);
  border-color: rgba(255,255,255,0.15);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.suggestion-chip:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(0.5);
  border-color: rgba(255,255,255,0.05);
  box-shadow: none;
}

.chip-icon { font-size: 1.1rem; flex-shrink: 0; }

.empty-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  background: rgba(251,191,36,0.07);
  border: 1px solid rgba(251,191,36,0.2);
  color: #94a3b8;
  font-size: 0.8rem;
  max-width: 420px;
}

.empty-warning strong { color: #fbbf24; }

/* Messages */
.messages-container {
  max-width: 820px;
  margin: 0 auto;
}

.messages-list { display: flex; flex-direction: column; gap: 4px; }

/* Typing indicator */
.typing-indicator {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 8px 0;
}

.typing-avatar {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: linear-gradient(135deg, #fbbf24, #d97706);
  color: #0d1117;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 0 10px rgba(251,191,36,0.25);
}

.typing-bubble {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #141922;
  border: 1px solid #252f45;
  border-radius: 14px;
  border-top-left-radius: 4px;
  padding: 12px 18px;
}

.typing-label { font-size: 0.78rem; color: #6b7fa3; }

.typing-dots { display: flex; gap: 4px; align-items: center; }

.scroll-anchor { height: 1px; }

/* Scroll to bottom */
.scroll-to-bottom-btn {
  position: sticky;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #1e2940;
  border: 1px solid #252f45;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 16px rgba(0,0,0,0.4);
  margin: 0 auto;
}

.scroll-to-bottom-btn:hover {
  background: #252f45;
  color: #fbbf24;
  border-color: rgba(251,191,36,0.3);
}

/* Transitions */
.empty-fade-enter-active, .empty-fade-leave-active { transition: opacity 0.3s; }
.empty-fade-enter-from, .empty-fade-leave-to { opacity: 0; }

.typing-fade-enter-active { transition: all 0.25s ease; }
.typing-fade-enter-from { opacity: 0; transform: translateY(8px); }
.typing-fade-leave-active { transition: all 0.15s ease; }
.typing-fade-leave-to { opacity: 0; }

.scroll-btn-enter-active, .scroll-btn-leave-active { transition: all 0.2s ease; }
.scroll-btn-enter-from, .scroll-btn-leave-to { opacity: 0; transform: translateX(-50%) translateY(8px); }

.message-enter-active { transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
.message-enter-from { opacity: 0; transform: translateY(14px); }
@media (max-width: 768px) {
  .chat-window {
    padding: 16px 12px;
  }

  .empty-state {
    padding: 40px 10px 20px;
    justify-content: flex-start;
    min-height: auto;
  }

  .empty-title {
    font-size: 1.5rem;
  }

  .empty-icon {
    width: 60px;
    height: 60px;
    margin-bottom: 12px;
  }

  .suggestions {
    grid-template-columns: 1fr;
    padding: 0 10px;
    margin-top: 10px;
  }

  .suggestion-chip {
    padding: 10px 14px;
    font-size: 0.75rem;
  }
}
</style>
