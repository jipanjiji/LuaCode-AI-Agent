import type { GeminiMessage } from '../ai-knowledge'

/**
 * @file security.ts
 * @description Technical Specifications for Anti-Cheat Bypass, 
 * Environment Guarding, and Metatable Spoofing.
 */

export const SECURITY_KNOWLEDGE: GeminiMessage[] = [
  {
    role: 'user',
    parts: [{ text: 'Provide the technical specification for Security Bypass and Anti-Cheat Mitigation.' }]
  },
  {
    role: 'model',
    parts: [{ text: `REFERENSI TEKNIS: SECURITY & BYPASS
Spesifikasi untuk Environment Protection and Stealth:

\`\`\`typescript
/**
 * Metatable Hooking Strategy (Stealth Layer)
 * Avoids direct property modification detection.
 */
export interface MetatableSpoofer {
  /**
   * Dual-layer spoofing for WalkSpeed/JumpPower.
   * Logic: __index returns fake value, __newindex blocks game modifications.
   */
  spoofProperty(target: Instance, key: string, fakeValue: any): void;
  
  /**
   * Environment Check (checkcaller)
   * Mandatory safeguard for all hooks to prevent self-looping and detection.
   */
  isSafeCall(): boolean;
}

/**
 * Anti-Cheat Signal Blocking
 * Technique: Intercepting RemoteEvents related to Heartbeats/Reporting.
 */
export interface SignalBlocker {
  remotePattern: string; -- e.g. "AC_Check" or "Heartbeat"
  
  /**
   * Uses hookmetamethod(__namecall) to drop packets.
   * Returns: nil to the game to simulate successful but empty send.
   */
  blockRemote(path: string): void;
}

/**
 * Constant Patching
 * Method: Modification of script-internal constants via getgc/getupvalues.
 */
export interface ConstantPatcher {
  targetScript: LocalScript;
  
  /**
   * Locates and overwrites numerical constants (e.g. SpeedCap = 50 -> 500).
   */
  patchConstant(name: string, value: any): void;
}
\`\`\`` }]
  }
]
