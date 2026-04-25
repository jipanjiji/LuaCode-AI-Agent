import { MOVEMENT_KNOWLEDGE } from './knowledge/movement'
import { VISUALS_KNOWLEDGE } from './knowledge/visuals'
import { ENGINE_KNOWLEDGE } from './knowledge/engine'
import { SECURITY_KNOWLEDGE } from './knowledge/security'
import { LIBRARIES_KNOWLEDGE } from './knowledge/libraries'
import { SAFETY_KNOWLEDGE } from './knowledge/safety'
import { PATTERNS_KNOWLEDGE } from './knowledge/patterns'
import { STRATEGIES_KNOWLEDGE } from './knowledge/strategies'

// High-level technical specifications (TypeScript modeled)
import { LUAU_CORE_KNOWLEDGE } from './knowledge/luau-core'
import { CUSTOM_ENV_KNOWLEDGE } from './knowledge/custom-env'
import { REMOTE_UTILS_KNOWLEDGE } from './knowledge/remote-utils'
import { UI_RENDERER_KNOWLEDGE } from './knowledge/ui-renderer'

// New knowledge modules (V4)
import { ROBLOX_SERVICES_KNOWLEDGE } from './knowledge/roblox-services'
import { DATA_TYPES_KNOWLEDGE } from './knowledge/data-types'
import { STRING_TABLE_MATH_KNOWLEDGE } from './knowledge/string-table-math'
import { AUTOFARM_KNOWLEDGE } from './knowledge/autofarm-architecture'
import { NETWORKING_ADVANCED_KNOWLEDGE } from './knowledge/networking-advanced'
import { GAME_PATTERNS_KNOWLEDGE } from './knowledge/game-specific-patterns'
import { FILESYSTEM_KNOWLEDGE } from './knowledge/filesystem-persistence'

/**
 * Universal message format used by the knowledge system.
 * Compatible with all providers (Gemini, Groq, Ollama).
 */
export interface KnowledgeMessage {
  role: 'user' | 'model'
  parts: { text: string }[]
}

/**
 * Consolidated Expert Knowledge Base (V4 - Complete Overhaul)
 * 
 * Structure:
 * 1. Core Technical Foundation (TypeScript-modeled deep specs)
 * 2. Roblox Platform Knowledge (services, data types, standard library)
 * 3. Domain Expertise (movement, visuals, security, networking)
 * 4. Architecture Patterns (auto-farm, game-specific, coding patterns)
 * 5. Tooling & Persistence (filesystem, UI libraries, engine internals)
 */
export const AI_EXPERT_HISTORY: GeminiMessage[] = [
  // ── Layer 1: Core Technical Foundation ──
  LUAU_CORE_KNOWLEDGE,
  CUSTOM_ENV_KNOWLEDGE,
  REMOTE_UTILS_KNOWLEDGE,
  UI_RENDERER_KNOWLEDGE,

  // ── Layer 2: Roblox Platform Knowledge ──
  ...ROBLOX_SERVICES_KNOWLEDGE,
  ...DATA_TYPES_KNOWLEDGE,
  ...STRING_TABLE_MATH_KNOWLEDGE,
  ...ENGINE_KNOWLEDGE,

  // ── Layer 3: Domain Expertise ──
  ...MOVEMENT_KNOWLEDGE,
  ...VISUALS_KNOWLEDGE,
  ...SECURITY_KNOWLEDGE,
  ...NETWORKING_ADVANCED_KNOWLEDGE,
  ...SAFETY_KNOWLEDGE,

  // ── Layer 4: Architecture & Patterns ──
  ...AUTOFARM_KNOWLEDGE,
  ...GAME_PATTERNS_KNOWLEDGE,
  ...STRATEGIES_KNOWLEDGE,
  ...PATTERNS_KNOWLEDGE,

  // ── Layer 5: Tooling & Libraries ──
  ...LIBRARIES_KNOWLEDGE,
  ...FILESYSTEM_KNOWLEDGE,
]
