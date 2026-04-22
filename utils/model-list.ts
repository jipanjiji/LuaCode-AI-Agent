export type ModelTier = 'Ultra' | 'High' | 'Medium' | 'Low'

export interface ModelInfo {
  id: string
  label: string
  tier: ModelTier
  provider: 'google' | 'groq'
}

export const FALLBACK_GEMINI_MODELS: ModelInfo[] = [
  // Ultra Tier (Elite Intelligence)
  { id: 'gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro (Elite Preview)', tier: 'Ultra', provider: 'google' },
  { id: 'deep-research-max-preview-04-2026', label: 'Deep Research Max (April 2026)', tier: 'Ultra', provider: 'google' },
  { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', tier: 'Ultra', provider: 'google' },
  { id: 'gemini-3-pro-preview', label: 'Gemini 3 Pro', tier: 'Ultra', provider: 'google' },
  { id: 'deep-research-preview-04-2026', label: 'Deep Research (April 2026)', tier: 'Ultra', provider: 'google' },
  
  // High Tier (Fast & Capable)
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', tier: 'High', provider: 'google' },
  { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', tier: 'High', provider: 'google' },
  { id: 'gemini-3-flash-preview', label: 'Gemini 3 Flash', tier: 'High', provider: 'google' },
  { id: 'gemini-3.1-flash-image-preview', label: 'Nano Banana 2 (Image)', tier: 'High', provider: 'google' },
  
  // Medium Tier (Efficient)
  { id: 'gemini-3.1-flash-lite-preview', label: 'Gemini 3.1 Flash-Lite', tier: 'Medium', provider: 'google' },
  { id: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash-Lite', tier: 'Medium', provider: 'google' },
  { id: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash-Lite', tier: 'Medium', provider: 'google' },
  { id: 'gemini-robotics-er-1.6-preview', label: 'Gemini Robotics 1.6', tier: 'Medium', provider: 'google' },
  
  // Low Tier (Compact)
  { id: 'gemma-4-31b-it', label: 'Gemma 4 31B IT', tier: 'Low', provider: 'google' },
  { id: 'gemma-3-27b-it', label: 'Gemma 3 27B', tier: 'Low', provider: 'google' },
  { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', tier: 'Low', provider: 'google' },
]

export const FALLBACK_GROQ_MODELS: ModelInfo[] = [
  // Ultra Tier
  { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B (State of the Art)', tier: 'Ultra', provider: 'groq' },
  
  // High Tier
  { id: 'llama-3.1-70b-versatile', label: 'Llama 3.1 70B', tier: 'High', provider: 'groq' },
  { id: 'llama-3.2-90b-vision-preview', label: 'Llama 3.2 90B (Vision)', tier: 'High', provider: 'groq' },
  
  // Medium Tier
  { id: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B (Deep Reasoning)', tier: 'Medium', provider: 'groq' },
  { id: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B (Instant)', tier: 'Medium', provider: 'groq' },
  
  // Low Tier
  { id: 'llama3-8b-8192', label: 'Llama 3 8B (Classic)', tier: 'Low', provider: 'groq' },
  { id: 'gemma2-9b-it', label: 'Gemma 2 9B', tier: 'Low', provider: 'groq' },
]

/**
 * Assigns a tier to a model based on its ID if not already known.
 * This is used for dynamically discovered models.
 */
export function getModelTier(id: string): ModelTier {
  const lowId = id.toLowerCase();
  
  // Ultra: Version 3.x Pro, 2.x Pro, and Deep Research
  if (
    lowId.includes('3.1-pro') || 
    lowId.includes('3-pro') || 
    lowId.includes('2.5-pro') || 
    lowId.includes('pro-exp') ||
    lowId.includes('deep-research') ||
    lowId.includes('lyria-3-pro') ||
    lowId.includes('3.3-70b') ||
    lowId.includes('o1-')
  ) return 'Ultra';
  
  // High: Modern Flash models and large architectures
  if (
    lowId.includes('-flash') || 
    lowId.includes('70b') || 
    lowId.includes('robotics') ||
    lowId.includes('nano-banana-pro')
  ) {
    if (lowId.includes('lite') || lowId.includes('1.5')) return 'Medium';
    return 'High';
  }
  
  // Medium: Lite models and older Pro architectures
  if (
    lowId.includes('lite') || 
    lowId.includes('1.5-pro') ||
    lowId.includes('8b') || 
    lowId.includes('8x7b') ||
    lowId.includes('nano-banana')
  ) return 'Medium';
  
  // Default to Low for unknowns (Gemma, tiny models)
  return 'Low';
}
