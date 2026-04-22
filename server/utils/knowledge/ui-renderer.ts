/**
 * @file ui-renderer.ts
 * @description TypeScript representation of a Luau-based custom UI framework
 * as typically built in Roblox executor scripts.
 *
 * Maps the common pattern of programmatically creating ScreenGui hierarchies,
 * applying dark themes, rounded corners (UICorner), and drag-to-move logic
 * into typed, React-like component structures.
 *
 * Luau runtime context: UI is created by inserting Roblox `Instance` objects
 * (Frames, TextLabels, TextButtons, etc.) into a ScreenGui parented to
 * `game.CoreGui` (requires identity ≥ 5) or `PlayerGui`.
 */

import type {
  LuaString,
  LuaNumber,
  LuaBoolean,
  LuaFunction,
  RobloxInstance,
} from "./luau-core";

// ---------------------------------------------------------------------------
// §1  Color & Theme Primitives
// ---------------------------------------------------------------------------

/**
 * A Roblox `Color3` value stored as normalized RGB floats `[0, 1]`.
 *
 * **Luau equivalent:**
 * ```lua
 * Color3.fromRGB(30, 30, 30)  -- → { r=0.118, g=0.118, b=0.118 }
 * ```
 */
export interface Color3 {
  /** Red channel, 0–1. */
  r: LuaNumber;
  /** Green channel, 0–1. */
  g: LuaNumber;
  /** Blue channel, 0–1. */
  b: LuaNumber;
}

/** Helper to construct a `Color3` from 0-255 integer channels. */
export function color3FromRGB(r: number, g: number, b: number): Color3 {
  return { r: r / 255, g: g / 255, b: b / 255 };
}

/**
 * Complete dark-theme color palette used by the UI framework.
 *
 * Mirrors the color constants defined at the top of typical executor UI scripts.
 */
export interface DarkTheme {
  /** Main window background. Typical: `Color3.fromRGB(25, 25, 25)`. */
  background: Color3;
  /** Secondary surface (side-panels, tab bars). */
  surface: Color3;
  /** Elevated surface (dropdowns, tooltips). */
  surfaceVariant: Color3;
  /** Active / selected accent (highlight border, toggle ON). */
  accent: Color3;
  /** Accent in hover state. */
  accentHover: Color3;
  /** Primary text color. */
  textPrimary: Color3;
  /** Muted / secondary text. */
  textSecondary: Color3;
  /** Destructive / danger (close button, error toast). */
  danger: Color3;
  /** Success / confirmation (toggle confirmed, copy success). */
  success: Color3;
  /** Divider / border lines. */
  border: Color3;
}

/** The default dark theme shipped with most executor UI frameworks. */
export const DEFAULT_DARK_THEME: DarkTheme = {
  background    : color3FromRGB(20,  20,  20),
  surface       : color3FromRGB(30,  30,  30),
  surfaceVariant: color3FromRGB(40,  40,  40),
  accent        : color3FromRGB(99, 102, 241),   // indigo-500
  accentHover   : color3FromRGB(129, 140, 248),  // indigo-400
  textPrimary   : color3FromRGB(240, 240, 240),
  textSecondary : color3FromRGB(160, 160, 160),
  danger        : color3FromRGB(239,  68,  68),
  success       : color3FromRGB( 34, 197,  94),
  border        : color3FromRGB( 55,  55,  55),
};

// ---------------------------------------------------------------------------
// §2  Layout Primitives (UDim2 / UDim)
// ---------------------------------------------------------------------------

/**
 * Roblox `UDim` — a one-dimensional offset expressed as a scale (0–1) + pixel
 * offset.
 *
 * **Luau equivalent:**
 * ```lua
 * UDim.new(0.5, -100)  -- 50% of parent minus 100 pixels
 * ```
 */
export interface UDim {
  scale  : LuaNumber;
  offset : LuaNumber;
}

/**
 * Roblox `UDim2` — two-dimensional size or position.
 *
 * **Luau equivalent:**
 * ```lua
 * UDim2.new(0, 400, 0, 300)  -- exactly 400×300 pixels
 * ```
 */
export interface UDim2 {
  x: UDim;
  y: UDim;
}

/** Convenience constructor for pixel-absolute `UDim2`. */
export function udim2px(width: number, height: number): UDim2 {
  return { x: { scale: 0, offset: width }, y: { scale: 0, offset: height } };
}

/** Convenience constructor for scale-relative `UDim2`. */
export function udim2scale(xs: number, ys: number): UDim2 {
  return { x: { scale: xs, offset: 0 }, y: { scale: ys, offset: 0 } };
}

// ---------------------------------------------------------------------------
// §3  Base Component Props
// ---------------------------------------------------------------------------

/**
 * Properties shared by every UI element in the framework.
 *
 * Each property maps directly to a Roblox GuiObject property of the same name.
 */
export interface BaseComponentProps {
  /** Unique string key for reconciliation (like React `key`). */
  key?: LuaString;

  /** Pixel / scale size. Defaults to `UDim2.new(0,100,0,30)`. */
  size?: UDim2;

  /** Pixel / scale position relative to parent anchor. */
  position?: UDim2;

  /**
   * Background color.
   * Maps to `GuiObject.BackgroundColor3`.
   * Set to `null` to use `BackgroundTransparency = 1` (transparent).
   */
  backgroundColor?: Color3 | null;

  /**
   * Background transparency 0 (opaque) → 1 (invisible).
   * Maps to `GuiObject.BackgroundTransparency`.
   * @default 0
   */
  backgroundTransparency?: LuaNumber;

  /**
   * Border / stroke color.
   * Implemented via a `UIStroke` child instance.
   */
  borderColor?: Color3;

  /** Border thickness in pixels. `0` disables the stroke. @default 0 */
  borderThickness?: LuaNumber;

  /**
   * Corner radius in pixels.
   * Implemented via a `UICorner` child with `CornerRadius = UDim.new(0, radius)`.
   * A value of `8` is the most common in dark-themed executor UIs.
   * @default 0
   */
  cornerRadius?: LuaNumber;

  /** Z-index stacking order. Higher = rendered on top. @default 1 */
  zIndex?: LuaNumber;

  /** Whether the element is visible. @default true */
  visible?: LuaBoolean;

  /** Whether user input events propagate to this element. @default true */
  active?: LuaBoolean;

  /** Optional click/tap callback. */
  onClick?: () => void;
}

// ---------------------------------------------------------------------------
// §4  Specific Component Prop Types
// ---------------------------------------------------------------------------

/**
 * Props for `<Label>` — maps to a Roblox `TextLabel`.
 */
export interface LabelProps extends BaseComponentProps {
  readonly componentType: "Label";

  /** Display text. Supports Roblox RichText markup when `richText` is true. */
  text: LuaString;

  /** Text color. @default theme.textPrimary */
  textColor?: Color3;

  /** Font size in pixels. @default 14 */
  fontSize?: LuaNumber;

  /**
   * Font family.
   * Maps to `Enum.Font` values; stored here as the enum name string.
   * @default "GothamMedium"
   */
  font?: LuaString;

  /**
   * Horizontal text alignment.
   * Maps to `Enum.TextXAlignment`.
   * @default "Left"
   */
  textXAlignment?: "Left" | "Center" | "Right";

  /** Enable Roblox RichText markup in `text`. @default false */
  richText?: LuaBoolean;

  /** Auto-resize element height to fit content. @default false */
  autoSizeY?: LuaBoolean;
}

/**
 * Props for `<Button>` — maps to a Roblox `TextButton`.
 */
export interface ButtonProps extends BaseComponentProps {
  readonly componentType: "Button";
  text: LuaString;
  textColor?: Color3;
  fontSize?: LuaNumber;
  font?: LuaString;

  /**
   * Color applied on hover (MouseEnter).
   * If omitted, `backgroundColor` is used for all states.
   */
  hoverColor?: Color3;

  /**
   * Color applied while the button is held down (MouseButton1Down).
   */
  pressColor?: Color3;

  /** Whether the button is disabled (no input, grayed out). @default false */
  disabled?: LuaBoolean;
}

/**
 * Props for `<Toggle>` — a boolean on/off switch.
 *
 * Implemented in Luau as two overlapping frames with a tweened inner circle.
 */
export interface ToggleProps extends BaseComponentProps {
  readonly componentType: "Toggle";

  /** Label shown next to the toggle knob. */
  label: LuaString;

  /** Current state. @default false */
  value: LuaBoolean;

  /**
   * Called when the user clicks the toggle.
   * Receives the NEW state as argument.
   */
  onChange: (newValue: boolean) => void;

  /** Color for ON state indicator. @default theme.accent */
  onColor?: Color3;

  /** Color for OFF state indicator. @default theme.surfaceVariant */
  offColor?: Color3;
}

/**
 * Props for `<TextInput>` — maps to a Roblox `TextBox`.
 */
export interface TextInputProps extends BaseComponentProps {
  readonly componentType: "TextInput";

  /** Placeholder text shown when empty. */
  placeholder?: LuaString;

  /** Current value. */
  value?: LuaString;

  /** Called on every keystroke (TextChanged). */
  onInput?: (value: string) => void;

  /** Called when the user presses Enter or loses focus. */
  onSubmit?: (value: string) => void;

  /** Whether the input is password-style (masks characters). @default false */
  masked?: LuaBoolean;
}

/**
 * Props for `<ScrollFrame>` — maps to a Roblox `ScrollingFrame`.
 */
export interface ScrollFrameProps extends BaseComponentProps {
  readonly componentType: "ScrollFrame";
  children: ComponentNode[];

  /** Scrollbar thickness in pixels. @default 4 */
  scrollBarThickness?: LuaNumber;

  /** Scrollbar color. @default theme.border */
  scrollBarColor?: Color3;

  /** Auto-layout children vertically via `UIListLayout`. @default true */
  autoLayout?: LuaBoolean;

  /** Spacing between auto-layout children in pixels. @default 4 */
  layoutPadding?: LuaNumber;
}

/**
 * Props for `<Section>` — a titled container frame used to group controls.
 */
export interface SectionProps extends BaseComponentProps {
  readonly componentType: "Section";
  title: LuaString;
  children: ComponentNode[];
  /** Whether the section is collapsed. @default false */
  collapsed?: LuaBoolean;
}

/** Discriminated union of all renderable component prop types. */
export type ComponentProps =
  | LabelProps
  | ButtonProps
  | ToggleProps
  | TextInputProps
  | ScrollFrameProps
  | SectionProps;

/** A node in the virtual component tree — analogous to a React element. */
export interface ComponentNode {
  props: ComponentProps;
  /** Mounted Roblox Instance (populated after `renderToGui`). */
  instance?: RobloxInstance;
}

// ---------------------------------------------------------------------------
// §5  Drag Logic
// ---------------------------------------------------------------------------

/**
 * State maintained by the drag handler attached to the main window frame.
 *
 * In Luau this is stored in local upvalues inside the `makeDraggable` closure.
 *
 * **Luau pattern:**
 * ```lua
 * local dragging, dragInput, startPos, startMousePos
 * frame.InputBegan:Connect(function(input)
 *   if input.UserInputType == Enum.UserInputType.MouseButton1 then
 *     dragging = true
 *     startPos = frame.Position
 *     startMousePos = input.Position
 *   end
 * end)
 * UserInputService.InputChanged:Connect(function(input)
 *   if dragging and input == dragInput then
 *     local delta = input.Position - startMousePos
 *     frame.Position = UDim2.new(
 *       startPos.X.Scale, startPos.X.Offset + delta.X,
 *       startPos.Y.Scale, startPos.Y.Offset + delta.Y
 *     )
 *   end
 * end)
 * ```
 */
export interface DragState {
  /** Whether a drag operation is currently in progress. */
  isDragging: LuaBoolean;

  /** The frame being dragged. */
  target: RobloxInstance | null;

  /** Frame position at the moment drag started (UDim2 snapshot). */
  startPosition: UDim2 | null;

  /** Mouse position (pixels) at the moment drag started. */
  startMousePosition: { x: LuaNumber; y: LuaNumber } | null;
}

/**
 * Attaches drag-to-move behaviour to a Roblox GUI Frame.
 *
 * Sets up `InputBegan`, `InputEnded`, and `InputChanged` event connections
 * on the target frame. The drag axis can be constrained.
 *
 * @param frame        - The Roblox Frame instance to make draggable.
 * @param handleRegion - Optional smaller drag handle region (e.g. a title bar
 *                       sub-frame). If omitted, the entire frame is the handle.
 * @param constrainAxis - Restrict movement to `"X"`, `"Y"`, or `"Both"`.
 *                        @default "Both"
 * @returns               A cleanup function that disconnects all event connections.
 */
export declare function makeDraggable(
  frame: RobloxInstance,
  handleRegion?: RobloxInstance,
  constrainAxis?: "X" | "Y" | "Both"
): () => void;

// ---------------------------------------------------------------------------
// §6  Window Component (Top-Level)
// ---------------------------------------------------------------------------

/**
 * Configuration for the main UI window — the top-level ScreenGui container
 * that all other components are parented into.
 */
export interface WindowConfig {
  /** Window title displayed in the title bar. */
  title: LuaString;

  /** Initial window size. @default `udim2px(480, 380)` */
  size?: UDim2;

  /** Initial window position. @default `UDim2.new(0.5,-240,0.5,-190)` */
  position?: UDim2;

  /** Theme palette. @default `DEFAULT_DARK_THEME` */
  theme?: DarkTheme;

  /**
   * Where the ScreenGui is parented.
   * - `"CoreGui"` requires identity ≥ 5 but survives character death.
   * - `"PlayerGui"` is always accessible but resets on respawn.
   * @default "CoreGui"
   */
  parentTarget?: "CoreGui" | "PlayerGui";

  /** Whether to show a close (×) button. @default true */
  showClose?: LuaBoolean;

  /** Whether to show a minimise (−) button. @default true */
  showMinimise?: LuaBoolean;

  /** Whether the window can be dragged. @default true */
  draggable?: LuaBoolean;

  /** Corner radius for the window frame. @default 8 */
  cornerRadius?: LuaNumber;

  /** Child component tree to render inside the window body. */
  children?: ComponentNode[];

  /** Called when the close button is pressed. */
  onClose?: () => void;
}

/**
 * A mounted window handle returned by `createWindow`.
 * Provides imperative methods for controlling the window after creation.
 */
export interface WindowHandle {
  /** The root ScreenGui Roblox instance. */
  readonly screenGui: RobloxInstance;

  /** The main Frame inside the ScreenGui. */
  readonly frame: RobloxInstance;

  /** Shows the window (sets `ScreenGui.Enabled = true`). */
  show(): void;

  /** Hides the window (sets `ScreenGui.Enabled = false`). */
  hide(): void;

  /** Completely destroys the ScreenGui and cleans up all connections. */
  destroy(): void;

  /**
   * Re-renders the component tree inside the window with new children.
   * Performs a simple diffing pass — existing instances are reused where
   * keys match.
   */
  update(newChildren: ComponentNode[]): void;

  /** Applies a new theme to all child components. */
  applyTheme(theme: DarkTheme): void;
}

/**
 * Creates, mounts, and returns a window handle for the given config.
 *
 * **Luau equivalent (abbreviated):**
 * ```lua
 * local gui = Instance.new("ScreenGui")
 * gui.Name = "ExecutorUI"
 * gui.ResetOnSpawn = false
 * gui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling
 * gui.Parent = game:GetService("CoreGui")
 *
 * local frame = Instance.new("Frame", gui)
 * frame.Size = UDim2.new(0, 480, 0, 380)
 * frame.BackgroundColor3 = theme.background
 * -- ... UICorner, UIStroke, title bar, close button setup ...
 * makeDraggable(frame, titleBar)
 * ```
 *
 * @param config - Window configuration.
 * @returns       A `WindowHandle` giving programmatic control over the window.
 */
export declare function createWindow(config: WindowConfig): WindowHandle;

// ---------------------------------------------------------------------------
// §7  Component Factory Functions
// ---------------------------------------------------------------------------

/**
 * Creates a `ComponentNode` for a text label.
 *
 * **Luau equivalent:**
 * ```lua
 * local lbl = Instance.new("TextLabel")
 * lbl.Text = props.text
 * lbl.TextColor3 = theme.textPrimary
 * -- ... size, font, etc. ...
 * lbl.Parent = parent
 * ```
 */
export function label(props: Omit<LabelProps, "componentType">): ComponentNode {
  return { props: { componentType: "Label", ...props } };
}

/**
 * Creates a `ComponentNode` for a clickable button.
 *
 * The Luau implementation hooks `MouseEnter` / `MouseLeave` / `MouseButton1Click`
 * to handle hover, press, and click states with `TweenService` color transitions.
 */
export function button(props: Omit<ButtonProps, "componentType">): ComponentNode {
  return { props: { componentType: "Button", ...props } };
}

/**
 * Creates a `ComponentNode` for a boolean toggle switch.
 *
 * In Luau, clicking the toggle tweens the inner circle horizontally and
 * cross-fades the track color between `onColor` and `offColor`.
 */
export function toggle(props: Omit<ToggleProps, "componentType">): ComponentNode {
  return { props: { componentType: "Toggle", ...props } };
}

/**
 * Creates a `ComponentNode` for a text input field.
 */
export function textInput(props: Omit<TextInputProps, "componentType">): ComponentNode {
  return { props: { componentType: "TextInput", ...props } };
}

/**
 * Creates a `ComponentNode` for a scrolling frame container.
 */
export function scrollFrame(props: Omit<ScrollFrameProps, "componentType">): ComponentNode {
  return { props: { componentType: "ScrollFrame", ...props } };
}

/**
 * Creates a `ComponentNode` for a collapsible section container.
 */
export function section(props: Omit<SectionProps, "componentType">): ComponentNode {
  return { props: { componentType: "Section", ...props } };
}

import type { GeminiMessage } from '../ai-knowledge';

export const UI_RENDERER_KNOWLEDGE: GeminiMessage = {
  role: 'user',
  parts: [{ text: `REFERENSI TEKNIS: UI RENDERER (CORE GUI)
Gunakan spesifikasi ini untuk membangun interface tingkat tinggi:

\`\`\`typescript
export interface BaseComponentProps {
  size?: UDim2; position?: UDim2; backgroundColor?: Color3; cornerRadius?: LuaNumber;
}
export interface WindowConfig {
  title: LuaString; size?: UDim2; draggable?: LuaBoolean; children?: ComponentNode[];
}
export interface WindowHandle {
  show(): void; hide(): void; destroy(): void; update(newChildren: ComponentNode[]): void;
}
export declare function createWindow(config: WindowConfig): WindowHandle;
export declare function makeDraggable(frame: RobloxInstance, handleRegion?: RobloxInstance): () => void;
\`\`\`` }]
};
