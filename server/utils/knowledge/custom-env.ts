/**
 * @file custom-env.ts
 * @description TypeScript mapping of custom Luau execution environments,
 * executor-injected globals, thread identity management, and function-hooking
 * utilities commonly found in Roblox exploit frameworks.
 *
 * All identifiers mirror the actual Luau API names used at runtime so that
 * this file can serve as a drop-in knowledge base for AI tooling.
 */

import type {
  LuaValue,
  LuaFunction,
  LuaClosure,
  LuaTable,
  LuaMetatable,
  LuaString,
  LuaNumber,
  LuaBoolean,
  LuaNil,
  LuaThread,
  RobloxInstance,
} from "./luau-core";

// ---------------------------------------------------------------------------
// §1  Thread Identity
// ---------------------------------------------------------------------------

/**
 * Roblox assigns every Luau thread a numeric "identity level" (sometimes
 * called "trust level") that gates access to privileged APIs.
 *
 * | Level | Description                                      |
 * |-------|--------------------------------------------------|
 * | 0     | Plugin / untrusted code                          |
 * | 1     | Regular scripts (LocalScript, Script)            |
 * | 2     | CoreScript (Roblox engine-internal)              |
 * | 3     | Roblox internal / command-bar                    |
 * | 5     | Full identity — exploit executors typically aim here |
 * | 6–8   | Reserved Roblox identity levels                  |
 *
 * Exploit executors use `setthreadidentity` to elevate to level 5+ so their
 * scripts can call protected APIs (e.g. `HttpService:GetAsync`).
 */
export const enum ThreadIdentity {
  UNTRUSTED  = 0,
  SCRIPT     = 1,
  CORESCRIPT = 2,
  INTERNAL   = 3,
  ELEVATED   = 5,
  ROBLOX_6   = 6,
  ROBLOX_7   = 7,
  ROBLOX_8   = 8,
}

/**
 * Sets the identity level of the current (or specified) Luau thread.
 *
 * **Luau equivalent:**
 * ```lua
 * setthreadidentity(5)           -- elevate to executor level
 * setthreadidentity(5, thread)   -- elevate a specific thread
 * ```
 *
 * This function is injected by executor frameworks; it does NOT exist in
 * vanilla Roblox scripts. Internally it writes to the `lua_State` identity
 * field via the executor's native bridge.
 *
 * @param level  - Target identity level (see `ThreadIdentity` enum).
 * @param thread - Optional specific thread; defaults to the calling thread.
 */
export declare function setthreadidentity(
  level: ThreadIdentity,
  thread?: LuaThread
): void;

/**
 * Returns the identity level of the current (or specified) Luau thread.
 *
 * **Luau equivalent:**
 * ```lua
 * local id = getthreadidentity()
 * ```
 *
 * @param thread - Optional specific thread; defaults to the calling thread.
 * @returns The numeric identity level.
 */
export declare function getthreadidentity(thread?: LuaThread): ThreadIdentity;

// ---------------------------------------------------------------------------
// §2  Global Environment Access
// ---------------------------------------------------------------------------

/**
 * Returns the **executor's own global environment table** — a private `_ENV`
 * that is shared across all scripts loaded by the executor but isolated from
 * the game's `_G`.
 *
 * **Luau equivalent:**
 * ```lua
 * local env = getgenv()
 * env.MY_FLAG = true   -- persists across all executor scripts
 * ```
 *
 * Typical use-cases:
 * - Storing cross-script state without polluting `_G`.
 * - Registering custom library functions for all executor scripts to consume.
 * - Checking whether another executor module has already been loaded
 *   (`if getgenv().MyLib then return end`).
 *
 * @returns A `LuaTable` that IS the executor's shared global env.
 */
export declare function getgenv(): LuaTable;

/**
 * Returns the **game's own global table** (`_G` / `shared`).
 *
 * Equivalent to `_G` accessed from within a game script, but callable from
 * executor context. Allows executors to read/write game-script globals.
 *
 * **Luau equivalent:**
 * ```lua
 * local rg = getrenv()
 * rg.SomeGameGlobal = "hijacked"
 * ```
 *
 * @returns The game's `_G` table.
 */
export declare function getrenv(): LuaTable;

/**
 * Returns the environment table of a **specific script instance**.
 *
 * `getsenv` is used to inspect or modify the private `_ENV` of a running
 * game LocalScript or Script. This is distinct from `_G` — each script has
 * its own environment in Roblox.
 *
 * **Luau equivalent:**
 * ```lua
 * local env = getsenv(game.Players.LocalPlayer.PlayerScripts.SomeScript)
 * env.remoteEnabled = false  -- disable a game mechanic
 * ```
 *
 * @param script - The Roblox `Script` or `LocalScript` instance to inspect.
 * @returns       The script's `_ENV` table, or `nil` if the script has no env.
 */
export declare function getsenv(script: RobloxInstance): LuaTable | LuaNil;

// ---------------------------------------------------------------------------
// §3  Function Hooking
// ---------------------------------------------------------------------------

/**
 * Configuration options that modify `hookfunction` behaviour.
 */
export interface HookOptions {
  /**
   * When `true`, the hook also replaces occurrences of the original function
   * stored in upvalues of other closures. Expensive but thorough.
   * @default false
   */
  replaceUpvalues?: LuaBoolean;

  /**
   * When `true`, skips installing the hook if an existing hook is detected,
   * preventing double-hooking.
   * @default false
   */
  skipIfHooked?: LuaBoolean;
}

/**
 * Hooks a Lua or C function by replacing it with `newFunc`, and returns a
 * **reference closure** that calls the original pre-hook function.
 *
 * The pattern is essential for "before/after" instrumentation: call the
 * reference to preserve original behaviour while injecting your own logic.
 *
 * **Luau equivalent:**
 * ```lua
 * local originalFire = hookfunction(
 *   Instance.new("RemoteEvent").FireServer,
 *   function(self, ...)
 *     print("[HOOK] FireServer called", ...)
 *     return originalFire(self, ...)
 *   end
 * )
 * ```
 *
 * @param target  - The function to hook. May be a Lua closure or a C function.
 * @param newFunc - Replacement function. Receives identical arguments.
 * @param options - Optional hook configuration.
 * @returns         A closure that, when called, invokes the ORIGINAL function.
 *
 * @throws {Error} If `target` is a C function in a protected memory region
 *                 and the executor lacks sufficient privilege.
 */
export declare function hookfunction<TArgs extends LuaValue[], TRet extends LuaValue[]>(
  target: (...args: TArgs) => TRet,
  newFunc: (...args: TArgs) => TRet,
  options?: HookOptions
): (...args: TArgs) => TRet;

/**
 * Hooks a **specific metamethod** (`__index`, `__newindex`, `__namecall`, etc.)
 * on an object's metatable without fully replacing the metatable.
 *
 * This is safer than directly overwriting the metatable field because it:
 * 1. Bypasses `__metatable` protection.
 * 2. Correctly handles metatables shared across many objects (e.g. the
 *    shared `Part` metatable used by all BasePart instances).
 *
 * **Luau equivalent:**
 * ```lua
 * local oldNamecall
 * oldNamecall = hookmetamethod(game, "__namecall", function(self, ...)
 *   local method = getnamecallmethod()
 *   if method == "FireServer" then
 *     warn("RemoteEvent:FireServer intercepted!")
 *   end
 *   return oldNamecall(self, ...)
 * end)
 * ```
 *
 * @param object     - Any object whose metatable should be patched.
 * @param metamethod - The metamethod name to hook (e.g. `"__namecall"`).
 * @param newFunc    - Replacement metamethod handler.
 * @returns            A closure that calls the original metamethod.
 */
export declare function hookmetamethod<T extends LuaValue>(
  object: T,
  metamethod: keyof LuaMetatable<T>,
  newFunc: LuaFunction
): LuaFunction;

/**
 * Returns the method name that triggered the currently-executing `__namecall`
 * metamethod. Only valid when called from WITHIN a `__namecall` hook.
 *
 * **Luau equivalent:**
 * ```lua
 * local method = getnamecallmethod()  -- e.g. "FireServer"
 * ```
 *
 * @returns The method name string as provided by the VM's namecall dispatch.
 */
export declare function getnamecallmethod(): LuaString;

// ---------------------------------------------------------------------------
// §4  Closure Introspection Utilities
// ---------------------------------------------------------------------------

/**
 * Tests whether a function is a **C function** (not a Lua closure).
 *
 * **Luau equivalent:**
 * ```lua
 * if iscclosure(math.sin) then print("C function") end
 * ```
 *
 * Useful for guarding hookfunction calls — hooking a C closure requires
 * different internal mechanics than hooking a Lua closure.
 *
 * @param fn - Any callable value.
 * @returns    `true` if `fn` is a C closure or plain C function.
 */
export declare function iscclosure(fn: LuaFunction): LuaBoolean;

/**
 * Tests whether a function is a **Lua closure** (not a C function).
 *
 * **Luau equivalent:**
 * ```lua
 * if islclosure(myFunc) then print("Lua closure") end
 * ```
 *
 * @param fn - Any callable value.
 * @returns    `true` if `fn` is a Lua-defined closure.
 */
export declare function islclosure(fn: LuaFunction): LuaBoolean;

/**
 * Wraps a Lua closure inside a **new C closure** that delegates to it.
 *
 * Exploits use this to obscure their hooks — `iscclosure` will return `true`
 * for the wrapper, making it harder for anti-cheat heuristics that flag Lua
 * closures in sensitive metamethod positions.
 *
 * **Luau equivalent:**
 * ```lua
 * local cWrapped = newcclosure(function(...)
 *   return doSomething(...)
 * end)
 * ```
 *
 * @param luaFn - The Lua closure to wrap.
 * @returns       A C closure proxy.
 */
export declare function newcclosure<TArgs extends LuaValue[], TRet extends LuaValue[]>(
  luaFn: (...args: TArgs) => TRet
): (...args: TArgs) => TRet;

// ---------------------------------------------------------------------------
// §5  Upvalue Manipulation
// ---------------------------------------------------------------------------

/**
 * Reads the upvalue at index `idx` (1-based) from a Lua closure.
 *
 * **Luau equivalent:**
 * ```lua
 * local val = getupvalue(myClosure, 1)
 * ```
 *
 * Upvalue indices correspond to the order they appear in the closure's
 * compiled bytecode. Use `debug.getupvalues` to enumerate them by name.
 *
 * @param closure - Must be a Lua closure (not a C function).
 * @param idx     - 1-based upvalue index.
 * @returns         The current value stored in that upvalue.
 *
 * @throws {RangeError} If `idx` is out of bounds for this closure.
 */
export declare function getupvalue(closure: LuaClosure, idx: LuaNumber): LuaValue;

/**
 * Overwrites the upvalue at index `idx` in a Lua closure with `newValue`.
 *
 * **Luau equivalent:**
 * ```lua
 * setupvalue(myClosure, 1, newValue)
 * ```
 *
 * Mutating upvalues is a powerful technique for patching game logic without
 * replacing the entire function — e.g. changing a speed cap stored in an
 * upvalue of a character movement function.
 *
 * @param closure  - Must be a Lua closure.
 * @param idx      - 1-based upvalue index.
 * @param newValue - Replacement value.
 */
export declare function setupvalue(
  closure: LuaClosure,
  idx: LuaNumber,
  newValue: LuaValue
): void;

/**
 * Returns a table mapping upvalue names → current values for a closure.
 *
 * **Luau equivalent:**
 * ```lua
 * local ups = getupvalues(myClosure)
 * for name, val in ups do print(name, val) end
 * ```
 *
 * @param closure - The Lua closure to inspect.
 * @returns         Record of upvalue names to their current values.
 */
export declare function getupvalues(
  closure: LuaClosure
): Record<LuaString, LuaValue>;

// ---------------------------------------------------------------------------
// §6  Script Loader / Custom Environment Builder
// ---------------------------------------------------------------------------

/**
 * Options for the custom `loadstring` / script-loader implementation.
 */
export interface ScriptLoaderOptions {
  /**
   * Custom environment table to inject as `_ENV` for the loaded chunk.
   * If omitted, the executor's `getgenv()` environment is used.
   */
  environment?: LuaTable;

  /**
   * Chunk name shown in error messages and debug info (e.g. `"@MyScript"`).
   * @default "=(load)"
   */
  chunkName?: LuaString;

  /**
   * When `true`, the bytecode is compiled in optimized mode (Luau opt level 1).
   * May cause subtle differences in numeric edge cases.
   * @default false
   */
  optimized?: LuaBoolean;
}

/**
 * Loads and compiles a Luau source string into an executable closure,
 * optionally injecting a custom environment.
 *
 * This is the executor-enhanced version of vanilla `loadstring`. The returned
 * closure, when called, executes in the provided environment.
 *
 * **Luau equivalent:**
 * ```lua
 * local fn, err = loadstring("return 1 + 1", { environment = getgenv() })
 * if fn then print(fn()) end
 * ```
 *
 * @param source  - Luau source code to compile.
 * @param options - Compilation and environment options.
 * @returns         `[closure, nil]` on success; `[nil, errorMessage]` on failure.
 */
export declare function loadstring(
  source: LuaString,
  options?: ScriptLoaderOptions
): [LuaClosure, LuaNil] | [LuaNil, LuaString];

/**
 * Executes a remote-fetched script string with executor privileges.
 *
 * This is a higher-level wrapper around `loadstring` that also:
 * - Sets thread identity to `ELEVATED` before execution.
 * - Catches and pretty-prints runtime errors.
 * - Injects common utilities (e.g. `getgenv().http`) into the environment.
 *
 * **Luau equivalent:**
 * ```lua
 * execScript(game:HttpGet("https://example.com/script.lua"))
 * ```
 *
 * @param source  - Raw Luau source fetched from a remote URL or local file.
 * @param options - Forwarded to `loadstring`.
 */
export declare function execScript(
  source: LuaString,
  options?: ScriptLoaderOptions
): void;

import type { GeminiMessage } from '../ai-knowledge';

export const CUSTOM_ENV_KNOWLEDGE: GeminiMessage = {
  role: 'user',
  parts: [{ text: `REFERENSI TEKNIS: EXECUTOR CUSTOM ENVIRONMENT (GLOBALS)
Daftar API eksklusif yang tersedia di lingkungan eksekusi kamu:

\`\`\`typescript
export declare function setthreadidentity(level: ThreadIdentity, thread?: LuaThread): void;
export declare function getgenv(): LuaTable;
export declare function getrenv(): LuaTable;
export declare function getsenv(script: RobloxInstance): LuaTable | LuaNil;
export declare function hookfunction<TArgs extends LuaValue[], TRet extends LuaValue[]>(target: (...args: TArgs) => TRet, newFunc: (...args: TArgs) => TRet, options?: HookOptions): (...args: TArgs) => TRet;
export declare function hookmetamethod<T extends LuaValue>(object: T, metamethod: keyof LuaMetatable<T>, newFunc: LuaFunction): LuaFunction;
export declare function getnamecallmethod(): LuaString;
export declare function newcclosure<TArgs extends LuaValue[], TRet extends LuaValue[]>(luaFn: (...args: TArgs) => TRet): (...args: TArgs) => TRet;
export declare function loadstring(source: LuaString, options?: ScriptLoaderOptions): [LuaClosure, LuaNil] | [LuaNil, LuaString];
\`\`\`` }]
};
