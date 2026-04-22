import type { GeminiMessage } from '../ai-knowledge'

/**
 * @file safety.ts
 * @description Technical Specifications for Defensive Programming, 
 * Error Handling, and Runtime Object Validation.
 */

export const SAFETY_KNOWLEDGE: GeminiMessage[] = [
  {
    role: 'user',
    parts: [{ text: 'Provide the technical specification for Safety and Defensive Programming.' }]
  },
  {
    role: 'model',
    parts: [{ text: `REFERENSI TEKNIS: SAFETY & VALIDATION
Spesifikasi untuk Error-Handling and Object Checks:

\`\`\`typescript
/**
 * Protected Execution Pattern
 * Prevents script-termination on runtime errors.
 */
export interface ErrorGuard {
  /**
   * Execution via pcall/xpcall.
   * xpcall provides full stack-trace for critical debug cycles.
   */
  pcall(fn: Function, ...args: any[]): [boolean, any];
}

/**
 * Object Validation Logic
 * Mandatory checks before property access or method invocation.
 */
export interface ObjectValidator {
  /**
   * Safe child retrieval.
   * Includes timeout to prevent thread stalling.
   */
  waitForChild(parent: Instance, name: string, timeout?: number): Instance | null;
  
  /**
   * Conditional existence check.
   * Returns nil if target is missing, avoiding 'attempt to index nil' errors.
   */
  getPart(parent: Instance, name: string): BasePart | null;
}
\`\`\`` }]
  }
]
