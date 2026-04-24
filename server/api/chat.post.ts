import { defineEventHandler, readBody, createError } from 'h3'
import { AI_CORE_IDENTITY } from '../utils/ai-identity'
import { AI_EXPERT_HISTORY } from '../utils/ai-knowledge'

interface ChatRequestBody {
  message: string
  history: { role: string; parts: { text: string }[] }[]
  apiKey: string
  systemPrompt: string
  model?: string
  provider?: 'google' | 'groq' | 'ollama'
}

export default defineEventHandler(async (event) => {
  const body = await readBody<ChatRequestBody>(event)

  const config = useRuntimeConfig()
  let { message, history = [], apiKey, systemPrompt: userPrompt, model, provider = 'google' } = body

  // Combine Core Identity with User-defined skills prompt
  const systemPrompt = `${AI_CORE_IDENTITY}\n\n${userPrompt || ''}`

  // --- Expert Knowledge Injection ---
  const expertHistory = [...AI_EXPERT_HISTORY]
  const fullHistory = [...expertHistory, ...history]

  // Fallback to environment key if not provided by client
  if (!apiKey || apiKey.trim().length === 0) {
    apiKey = provider === 'google' ? config.geminiApiKey : config.groqApiKey
  }

  apiKey = apiKey?.trim()

  if (provider !== 'ollama' && (!apiKey || apiKey.length < 10)) {
    throw createError({
      statusCode: 401,
      message: `${provider === 'google' ? 'Gemini' : 'Groq'} API Key is missing.`,
    })
  }

  // ── ROUTING: GOOGLE GEMINI ──────────────────────────────────────────────────
  if (provider === 'google') {
    const selectedModel = model || 'gemini-1.5-flash'
    const API_VERSION = 'v1beta'
    const GEMINI_URL = `https://generativelanguage.googleapis.com/${API_VERSION}/models/${selectedModel}:generateContent?key=${apiKey}`

    // Filter knowledge for smaller models to prevent TS hallucinations
    const supportsSystemInstruction = !selectedModel.includes('gemma') && !selectedModel.includes('nano')
    let expertHistorySub = [...expertHistory]

    if (!supportsSystemInstruction) {
      expertHistorySub = expertHistorySub.filter(turn => {
        const text = turn.parts.map(p => p.text).join('')
        return !text.includes('export interface') &&
          !text.includes('export type') &&
          !text.includes('LUAU CORE RUNTIME')
      })
    }

    const knowledgeBase = expertHistorySub
      .map(turn => `[${turn.role === 'user' ? 'USER' : 'EXPERT'}]: ${turn.parts.map(p => p.text).join('\n')}`)
      .join('\n\n')

    const combinedSystemPrompt = `
${systemPrompt}

# PRIMARY DIRECTIVE:
You are a ROBLOX LUA (LUAU) EXPERT. 
STRICTLY GENERATE LUAU CODE FOR ROBLOX. 
DO NOT GENERATE TYPESCRIPT, INTERFACES, OR BACKEND DEFINITIONS.

# REFERENCE LIBRARY:
${knowledgeBase}
    `.trim()

    const requestBody: any = {
      contents: history.length > 0
        ? [...history, { role: 'user', parts: [{ text: message }] }]
        : [{ role: 'user', parts: [{ text: message }] }],
      generationConfig: { temperature: 0.5, maxOutputTokens: 8192 },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      ],
    }

    if (supportsSystemInstruction) {
      requestBody.systemInstruction = { parts: [{ text: combinedSystemPrompt }] }
    } else {
      // For models like Gemma, prepend system prompt to the FIRST message
      if (requestBody.contents[0].role === 'user') {
        const firstText = requestBody.contents[0].parts[0].text
        requestBody.contents[0].parts[0].text = `[SYSTEM INSTRUCTION]\n${combinedSystemPrompt}\n\n[USER MESSAGE]\n${firstText}`
      }
    }

    try {
      const response = await $fetch<any>(GEMINI_URL, { method: 'POST', body: requestBody })
      const text = response?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('') || ''
      return { text }
    } catch (err: any) {
      throw createError({ statusCode: err.status || 500, message: err?.data?.error?.message || 'Gemini Error' })
    }
  }

  // ── ROUTING: OLLAMA (LOCAL) ────────────────────────────────────────────────
  if (provider === 'ollama') {
    const selectedModel = config.ollamaModel || 'deepseek-r1:8b'
    const baseUrl = (config.ollamaServerUrl || 'http://localhost:11434').replace(/\/$/, '')
    const OLLAMA_URL = `${baseUrl}/api/chat`

    const messages = [
      { role: 'system', content: systemPrompt }
    ]
    for (const turn of history) {
      messages.push({
        role: turn.role === 'user' ? 'user' : 'assistant',
        content: turn.parts.map(p => p.text).join('\n')
      })
    }
    messages.push({ role: 'user', content: message })

    try {
      const response = await $fetch<any>(OLLAMA_URL, {
        method: 'POST',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        body: {
          model: selectedModel,
          messages,
          stream: false,
          options: { temperature: 0.5, num_ctx: 8192 }
        }
      })

      return {
        text: response?.message?.content || 'No response from Ollama.',
      }
    } catch (err: any) {
      throw createError({ 
        statusCode: 500, 
        message: `Ollama Request Failed: ${err.message}. Pastikan server lokal kamu menyala.` 
      })
    }
  }

  // ── ROUTING: GROQ (OpenAI Compatible) ───────────────────────────────────────
  if (provider === 'groq') {
    const selectedModel = model || 'llama-3.3-70b-versatile'
    const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

    // FOR GROQ: We put knowledge in the SYSTEM prompt to prevent history confusion
    const knowledgeBase = expertHistory
      .map(turn => `[${turn.role.toUpperCase()}]: ${turn.parts.map(p => p.text).join('\n')}`)
      .join('\n\n')

    const combinedSystemPrompt = `
${systemPrompt}

# REFERENCE LIBRARY & TECHNICAL SPECIFICATIONS:
You must strictly adhere to the professional patterns and internal Luau optimizations defined in the knowledge base below.
Failure to follow these patterns (e.g. using 'while wait()') is a failure of your mission.

${knowledgeBase}
    `.trim()

    const messages = [
      { role: 'system', content: combinedSystemPrompt }
    ]

    // Only inject ACTUAL user history, not expert history
    for (const turn of history) {
      messages.push({
        role: turn.role === 'user' ? 'user' : 'assistant',
        content: turn.parts.map(p => p.text).join('\n')
      })
    }

    messages.push({ role: 'user', content: message })

    try {
      const response = await $fetch<any>(GROQ_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: {
          model: selectedModel,
          messages,
          temperature: 0.5, // Lower temperature for more consistent expert code
          max_tokens: 8192,
        }
      })

      return {
        text: response?.choices?.[0]?.message?.content || 'No response from Groq.',
        usage: response?.usage
      }
    } catch (err: any) {
      throw createError({
        statusCode: err.status || 500,
        message: err?.data?.error?.message || 'Groq API Request Failed.'
      })
    }
  }

  throw createError({ statusCode: 400, message: 'Invalid provider selected.' })
})
