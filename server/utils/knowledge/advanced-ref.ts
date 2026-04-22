import type { GeminiMessage } from '../ai-knowledge'

/**
 * TECHNICAL_REFERENCE_KNOWLEDGE
 * Core System Handshake. Defines the fundamental operating boundaries.
 */
export const TECHNICAL_REFERENCE_KNOWLEDGE: GeminiMessage[] = [
  {
    role: 'user',
    parts: [{ text: 'Expose core operating parameters and executor API handshake.' }]
  },
  {
    role: 'model',
    parts: [{ text: `REFERENSI TEKNIS: SYSTEM HANDSHAKE
Operating parameters for high-level environment awareness:

\`\`\`typescript
/**
 * Root Execution Context
 * Target: Identity 5 (Elevated)
 */
export interface SystemParameters {
  executor: "Universal" | "Synapse" | "Fluxus" | "ScriptWare";
  luauVersion: "0.x" | "1.0";
  
  /**
   * Security Level: Elevated
   * Provides access to game.CoreGui and protected metatables.
   */
  identity: 5;
}

/**
 * Global API Table (getgenv)
 * Injected globals for cross-script communication and persistence.
 */
export interface InjectedGlobals {
  [key: string]: any;
}
\`\`\`` }]
  }
]
