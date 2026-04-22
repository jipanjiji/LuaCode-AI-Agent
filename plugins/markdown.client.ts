import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js/lib/core'

// Register languages
import lua from 'highlight.js/lib/languages/lua'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import json from 'highlight.js/lib/languages/json'
import bash from 'highlight.js/lib/languages/bash'
import plaintext from 'highlight.js/lib/languages/plaintext'

hljs.registerLanguage('lua', lua)
hljs.registerLanguage('luau', lua) // Luau = Lua superset
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('json', json)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('sh', bash)
hljs.registerLanguage('plaintext', plaintext)

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  highlight(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext'
    const highlighted = hljs.highlight(code, { language, ignoreIllegals: true }).value
    const langLabel = lang || 'text'

    const copyIcon = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`

    return `<div class="code-block-wrapper"><div class="code-block-header"><span class="code-block-lang">${langLabel}</span><button class="copy-btn">${copyIcon}Copy</button></div><pre><code class="hljs language-${language}">${highlighted}</code></pre></div>`
  },
})

// Override link renderer to add target="_blank"
const defaultLinkRender = md.renderer.rules.link_open || function (tokens, idx, options, _env, self) {
  return self.renderToken(tokens, idx, options)
}
md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  tokens[idx].attrSet('target', '_blank')
  tokens[idx].attrSet('rel', 'noopener noreferrer')
  return defaultLinkRender(tokens, idx, options, env, self)
}

export default defineNuxtPlugin(() => {
  // Expose on window for use in components (client-side rendering)
  if (import.meta.client) {
    ;(window as any).__markdownIt = md
  }

  return {
    provide: {
      md,
    },
  }
})
