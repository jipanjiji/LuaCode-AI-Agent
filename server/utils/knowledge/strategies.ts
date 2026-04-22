import type { GeminiMessage } from '../ai-knowledge'

/**
 * @file strategies.ts
 * @description Advanced Technical Specifications for Combined Gameplay 
 * Interaction, Remote Forgery, and Cross-module Security bypass.
 */

export const STRATEGIES_KNOWLEDGE: GeminiMessage[] = [
  {
    role: 'user',
    parts: [{ text: 'Provide the technical specification for Strategic Combat and Packet Manipulation.' }]
  },
  {
    role: 'model',
    parts: [{ text: `REFERENSI TEKNIS: STRATEGIES & FORGERY
Spesifikasi untuk Complex Multi-Module Operations:

\`\`\`typescript
/**
 * Remote Forgery (Packet Signature Hijacking)
 * Technique: Borrowing game-internal encryption functions to sign false data.
 */
export interface RemoteForgery {
  readonly signFunc: LuaFunction; -- Extracted via getsenv or getgc
  
  /**
   * Intercepts a protected remote and injects custom arguments 
   * while maintaining a valid server-side signature.
   */
  forgeAndFire(remote: RemoteEvent, data: any): void;
}

/**
 * Advanced AC Nullification (Dual-Layer Identity Masking)
 * Strategy: Blocking detection signals while spoofing physical properties.
 */
export interface ACNullifier {
  /**
   * Installs index/newindex hooks to spoof WalkSpeed/JumpPower 
   * and drops AC heartbeat remotes.
   */
  nullify(targetSpeed: number): void;
}

/**
 * Targeted Snippet Strategy (Elite Minimalism)
 * Scenario: Simple request -> Simple result.
 */
export interface TargetedSnippet {
  /**
   * Example: "Make character transparent"
   * WRONG: Full global system with UI and listeners.
   * RIGHT: Simple local loop:
   * for _,v in pairs(char:GetDescendants()) do if v:IsA("BasePart") then v.Transparency = 1 end end
   */
  minimal(logic: string): void;
}
\`\`\`` }]
  }
]
