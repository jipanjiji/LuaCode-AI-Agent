import type { GeminiMessage } from '../ai-knowledge'

/**
 * @file engine.ts
 * @description Technical Specifications for Metatable operations, 
 * Task Scheduler, and Luau VM behaviors.
 */

export const ENGINE_KNOWLEDGE: GeminiMessage[] = [
  {
    role: 'user',
    parts: [{ text: 'Provide the technical specification for Engine Internals and Metatable Logic.' }]
  },
  {
    role: 'model',
    parts: [{ text: `REFERENSI TEKNIS: ENGINE & VM
Spesifikasi untuk Metatable Manipulation and Task Scheduling:

\`\`\`typescript
/**
 * Metatable Hooking (Low-level)
 * Method: getrawmetatable + setreadonly
 */
export interface MetatableHook {
  readonly target: any;
  oldMethod: LuaFunction;
  
  /**
   * Safe hooking pattern to avoid AC detection on read-only tables.
   */
  install(metamethod: string, hook: LuaFunction): void;
}

/**
 * Modern Task Scheduler
 * Replacement for legacy wait/spawn/delay APIs.
 */
export interface TaskScheduler {
  /** High-precision frame synchronization. */
  wait(n: number): number;
  /** Thread creation via Luau task library. */
  spawn(fn: Function, ...args: any[]): void;
  /** Deferred execution on current frame. */
  defer(fn: Function): void;
}
\`\`\`` }]
  }
]
