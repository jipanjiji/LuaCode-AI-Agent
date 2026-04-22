import type { GeminiMessage } from '../ai-knowledge'

/**
 * @file libraries.ts
 * @description Technical Specifications for External UI Libraries (Orion, Rayfield)
 * and Custom Framework integration.
 */

export const LIBRARIES_KNOWLEDGE: GeminiMessage[] = [
  {
    role: 'user',
    parts: [{ text: 'Provide the technical specification for External UI Library Integration.' }]
  },
  {
    role: 'model',
    parts: [{ text: `REFERENSI TEKNIS: UI LIBRARIES
Spesifikasi untuk integrasi Library pihak ketiga:

\`\`\`typescript
/**
 * Orion Library Interface
 * Endpoint: https://raw.githubusercontent.com/shlexware/Orion/main/source
 */
export interface OrionLibrary {
  MakeWindow(config: WindowConfig): UIWindow;
  
  /**
   * Component: Dropdown
   * Correct Refresh Signature: :Refresh(optionTable, settoDefault)
   */
  RefreshDropdown(obj: any, newList: string[]): void;
}

/**
 * Rayfield Library Interface
 * Endpoint: https://sirius.menu/rayfield
 */
export interface RayfieldLibrary {
  CreateWindow(config: WindowConfig): UIWindow;
  
  /**
   * Component: Section
   * Logical divider for organization.
   */
  AddSection(tab: any, name: string): void;
}
\`\`\`` }]
  }
]
