import type { GeminiMessage } from '../ai-knowledge'

/**
 * @file patterns.ts
 * @description Technical Specifications for Software Engineering Patterns 
 * applied to Luau (Memory Management, Signals, State).
 */

export const PATTERNS_KNOWLEDGE: GeminiMessage[] = [
  {
    role: 'user',
    parts: [{ text: 'Provide the technical specification for Luau Coding Patterns and Memory Management.' }]
  },
  {
    role: 'model',
    parts: [{ text: `REFERENSI TEKNIS: PATTERNS & MEMORY
Spesifikasi untuk Efficient Logic Flow and Clean-up:

\`\`\`typescript
/**
 * Connection lifecycle Management
 * Prevents Memory Leaks by ensuring all events are disconnected.
 */
export interface EventManager {
  activeConnections: RBXScriptConnection[];
  
  /**
   * Tracks a new connection and handles automatic disconnection 
   * upon character death or script termination.
   */
  track(connection: RBXScriptConnection): void;
  
  /**
   * Mass disconnection of all tracked signals.
   */
  cleanup(): void;
}

/**
 * State Machines
 * Logic: Control flow based on Enum-like states (Idle, Farming, Teleporting).
 */
export interface StateMachine {
  currentState: string;
  transitions: Record<string, Function>;
  
  /**
   * Handles safe transition between states, executing Enter/Exit logic.
   */
  transitionTo(newState: string): void;
}

/**
 * Lightweight Snippet Pattern (Direct Execution)
 * Use for simple one-off requests. Avoids persistence and overhead.
 */
export interface SnippetPattern {
  /**
   * Logic: Direct iteration over descendants with immediate property application.
   * Format: Single task.spawn or for-loop with local scope only.
   */
  oneOff(logic: Function): void;
}
\`\`\`` }]
  }
]
