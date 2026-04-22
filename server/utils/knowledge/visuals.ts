import type { GeminiMessage } from '../ai-knowledge'

/**
 * @file visuals.ts
 * @description Technical Specifications for Drawing API, ESP Rendering, 
 * Highlight objects, and UI Visual components.
 */

export const VISUALS_KNOWLEDGE: GeminiMessage[] = [
  {
    role: 'user',
    parts: [{ text: 'Provide the technical specification for Visual Rendering and ESP Systems.' }]
  },
  {
    role: 'model',
    parts: [{ text: `REFERENSI TEKNIS: VISUALS & RENDERING
Spesifikasi untuk sistem ESP and High-Performance UI:

\`\`\`typescript
/**
 * ESP Highlight Configuration (Modern)
 * Uses Roblox Highlight Instance for X-Ray rendering.
 */
export interface HighlightESP {
  fillColor: Color3;
  outlineColor: Color3;
  fillTransparency: number;
  outlineTransparency: number;
  
  /**
   * Automatically handles team-checks and character-added signals.
   */
  mount(player: Player): Highlight;
}

/**
 * Drawing API 2D Overlay
 * Low-level pixel rendering for Aimbot FOV, Boxes, and Tracers.
 */
export interface DrawingAPI {
  readonly items: Set<DrawingObject>;
  
  /**
   * Standard 2D Box implementation.
   * Logic: WorldToViewportPoint calculation for dynamic scaling.
   */
  createBox(target: Instance): DrawingBox;
  
  /**
   * FOV Circle for Aimbot systems.
   */
  createCircle(radius: number): DrawingCircle;
}

/**
 * UI Library Integration Interface
 * Standardizes API calls for Orion, Rayfield, and Custom Hubs.
 */
export interface UILibraryStub {
  name: string;
  createWindow(config: WindowConfig): UIWindow;
  
  /**
   * Refresh API for dynamic components (Dropdowns/Lists).
   * Note: Always use proper :Refresh() signature to avoid API hallucinations.
   */
  refreshDropdown(obj: UIDropdown, newList: string[]): void;
}
\`\`\`` }]
  }
]
