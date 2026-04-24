<template>
  <div class="message-wrapper" :class="message.role" ref="wrapperRef">
    <!-- Avatar -->
    <div class="avatar" :class="message.role">
      <template v-if="message.role === 'user'">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>
        </svg>
      </template>
      <template v-else>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      </template>
    </div>

    <!-- Bubble -->
    <div class="message-bubble" :class="[ message.role, { error: message.isError } ]">
      <!-- Role label -->
      <div class="message-header">
        <span class="role-label">{{ message.role === 'user' ? 'You' : 'LuaCode AI' }}</span>
        <span class="timestamp">{{ formatTime(message.timestamp) }}</span>
      </div>

      <!-- Content -->
      <div v-if="message.reasoning" class="reasoning-block">
        <button class="reasoning-toggle" @click="showReasoning = !showReasoning">
          <svg 
            width="12" height="12" viewBox="0 0 24 24" fill="none" 
            stroke="currentColor" stroke-width="2.5"
            :style="{ transform: showReasoning ? 'rotate(90deg)' : 'rotate(0deg)' }"
          >
            <polyline points="9 18 15 12 9 6"/>
          </svg>
          {{ showReasoning ? 'Hide Thinking Process' : 'Show Thinking Process' }}
        </button>
        <div v-show="showReasoning" class="reasoning-content">
          {{ message.reasoning }}
        </div>
      </div>

      <div
        class="message-content prose"
        v-html="renderedContent"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, nextTick, watch } from 'vue'
import type { Message } from '~/stores/chat'

const props = defineProps<{ message: Message }>()

const wrapperRef = ref<HTMLElement | null>(null)
const showReasoning = ref(false)

// ── Markdown rendering ──────────────────────────────────────────────────────
const renderedContent = computed(() => {
  if (import.meta.server) return escapeHtml(props.message.content)
  return renderMarkdown(props.message.content)
})

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function renderMarkdown(text: string): string {
  try {
    const MarkdownIt = (window as any).__markdownIt
    if (!MarkdownIt) return `<p>${escapeHtml(text)}</p>`
    return MarkdownIt.render(text)
  } catch {
    return `<p>${escapeHtml(text)}</p>`
  }
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

// ── Copy buttons for code blocks ────────────────────────────────────────────
onMounted(() => {
  nextTick(() => attachCopyButtons())
})

// Re-attach buttons when content changes (important for streaming)
watch(() => props.message.content, () => {
  nextTick(() => attachCopyButtons())
})

function attachCopyButtons() {
  if (!wrapperRef.value) return
  const codeBlocks = wrapperRef.value.querySelectorAll('.code-block-wrapper')
  codeBlocks.forEach((wrapper) => {
    const btn = wrapper.querySelector('.copy-btn') as HTMLButtonElement
    const code = wrapper.querySelector('code')
    
    // Prevent double-binding
    if (btn && code && !btn.hasAttribute('data-attached')) {
      btn.setAttribute('data-attached', 'true')
      btn.addEventListener('click', async () => {
        const text = code.innerText || code.textContent || ''
        try {
          await navigator.clipboard.writeText(text)
          btn.classList.add('copied')
          btn.innerHTML = `
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Copied!
          `
          setTimeout(() => {
            btn.classList.remove('copied')
            btn.innerHTML = `
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              Copy
            `
          }, 2000)
        } catch (e) {
          console.error('Copy failed', e)
        }
      })
    }
  })
}
</script>

<style scoped>
.message-wrapper {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 8px 0;
  animation: slideUpMsg 0.65s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.message-wrapper.user { flex-direction: row-reverse; }

@keyframes slideUpMsg {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Avatar */
.avatar {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar.user {
  background: linear-gradient(135deg, #a78bfa, #7c3aed);
  color: white;
}

.avatar.assistant {
  background: linear-gradient(135deg, #fbbf24, #d97706);
  color: #0d1117;
  box-shadow: 0 0 10px rgba(251,191,36,0.25);
}

/* Bubble */
.message-bubble {
  max-width: min(680px, 78vw);
  border-radius: 14px;
  padding: 14px 18px;
  position: relative;
}

.message-bubble.user {
  background: linear-gradient(135deg, #1e2a50, #162040);
  border: 1px solid #2d3f6c;
  border-top-right-radius: 4px;
}

.message-bubble.assistant {
  background: #141922;
  border: 1px solid #252f45;
  border-top-left-radius: 4px;
}

.message-bubble.error {
  background: rgba(244,63,94,0.07);
  border-color: rgba(244,63,94,0.3);
}

/* Header */
.message-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.role-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.user .role-label { color: #a78bfa; }
.assistant .role-label { color: #fbbf24; }
.error .role-label { color: #fb7185; }

.timestamp {
  font-size: 0.68rem;
  color: #6b7fa3;
}

/* Content */
.message-content {
  font-size: 0.9rem;
  line-height: 1.75;
}

/* Prevent prose styles from being over-specific */
.message-content :deep(p:first-child) { margin-top: 0; }
.message-content :deep(p:last-child) { margin-bottom: 0; }
/* Reasoning Block */
.reasoning-block {
  margin-bottom: 12px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 8px;
  overflow: hidden;
}

.reasoning-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: none;
  border: none;
  color: #6b7fa3;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.reasoning-toggle:hover {
  background: rgba(255,255,255,0.03);
  color: #94a3b8;
}

.reasoning-toggle svg {
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.reasoning-content {
  padding: 0 14px 12px;
  font-size: 0.8rem;
  color: #6b7fa3;
  font-style: italic;
  line-height: 1.6;
  white-space: pre-wrap;
}

</style>
