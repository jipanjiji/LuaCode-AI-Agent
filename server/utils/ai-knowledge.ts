import { MOVEMENT_KNOWLEDGE } from './knowledge/movement'
import { VISUALS_KNOWLEDGE } from './knowledge/visuals'
import { ENGINE_KNOWLEDGE } from './knowledge/engine'
import { SECURITY_KNOWLEDGE } from './knowledge/security'
import { LIBRARIES_KNOWLEDGE } from './knowledge/libraries'
import { SAFETY_KNOWLEDGE } from './knowledge/safety'
import { PATTERNS_KNOWLEDGE } from './knowledge/patterns'
import { TECHNICAL_REFERENCE_KNOWLEDGE } from './knowledge/advanced-ref'
import { STRATEGIES_KNOWLEDGE } from './knowledge/strategies'

// Import your new high-level technical specifications
import { LUAU_CORE_KNOWLEDGE } from './knowledge/luau-core'
import { CUSTOM_ENV_KNOWLEDGE } from './knowledge/custom-env'
import { REMOTE_UTILS_KNOWLEDGE } from './knowledge/remote-utils'
import { UI_RENDERER_KNOWLEDGE } from './knowledge/ui-renderer'

export interface GeminiMessage {
  role: 'user' | 'model'
  parts: { text: string }[]
}

/**
 * Consolidated Expert Knowledge Base (V3 - God-Tier Implementation)
 * This federated system integrates technical specifications, category-specific 
 * expertise, and high-level strategic implementation patterns.
 */
export const AI_EXPERT_HISTORY: GeminiMessage[] = [
  // Technical Foundation (Raw Specifications)
  LUAU_CORE_KNOWLEDGE,
  CUSTOM_ENV_KNOWLEDGE,
  REMOTE_UTILS_KNOWLEDGE,
  UI_RENDERER_KNOWLEDGE,

  // Knowledge Handshake & Multi-Layer Strategies
  ...TECHNICAL_REFERENCE_KNOWLEDGE,
  ...STRATEGIES_KNOWLEDGE,

  // Domain Expertise
  ...MOVEMENT_KNOWLEDGE,
  ...VISUALS_KNOWLEDGE,
  ...ENGINE_KNOWLEDGE,
  ...SECURITY_KNOWLEDGE,
  ...LIBRARIES_KNOWLEDGE,
  ...SAFETY_KNOWLEDGE,
  ...PATTERNS_KNOWLEDGE
]
