/**
 * @file remote-utils.ts
 * @description TypeScript implementation of Roblox RemoteEvent / RemoteFunction
 * interception, structured logging, replay, and controlled firing utilities.
 *
 * Roblox networking uses:
 * - `RemoteEvent`    → fire-and-forget (client→server via `:FireServer`,
 *                      server→client via `:FireClient` / `:FireAllClients`)
 * - `RemoteFunction` → request-response (`InvokeServer` / `InvokeClient`)
 * - `UnreliableRemoteEvent` → same as RemoteEvent but over UDP (no ordering
 *                              guarantee, lower latency)
 *
 * Exploit frameworks intercept these by hooking `__namecall` on the game
 * metatable (see `custom-env.ts → hookmetamethod`) and filtering for the
 * method names listed in `REMOTE_METHOD_NAMES`.
 */

import type {
  LuaValue,
  LuaString,
  LuaNumber,
  LuaBoolean,
  LuaNil,
  LuaTable,
  RobloxInstance,
} from "./luau-core";
import type { hookmetamethod } from "./custom-env";

// ---------------------------------------------------------------------------
// §1  Remote Identification
// ---------------------------------------------------------------------------

/**
 * The Roblox ClassName strings for network remote objects.
 */
export const enum RemoteClassName {
  RemoteEvent           = "RemoteEvent",
  RemoteFunction        = "RemoteFunction",
  UnreliableRemoteEvent = "UnreliableRemoteEvent",
}

/**
 * Method names that the `__namecall` hook listens for to detect remote calls.
 *
 * Stored as a frozen tuple so iteration order is deterministic.
 */
export const REMOTE_METHOD_NAMES = [
  "FireServer",
  "InvokeServer",
  "FireClient",
  "FireAllClients",
  "InvokeClient",
] as const;

/** Union type of all interceptable remote method names. */
export type RemoteMethodName = (typeof REMOTE_METHOD_NAMES)[number];

/**
 * Indicates the traffic direction of a remote call.
 *
 * | Direction     | Meaning                                |
 * |---------------|----------------------------------------|
 * | `C2S`         | Client fired → Server received         |
 * | `S2C`         | Server fired → Client received         |
 * | `S2ALL`       | Server fired → All clients received    |
 */
export const enum RemoteDirection {
  C2S   = "C2S",   // FireServer / InvokeServer
  S2C   = "S2C",   // FireClient / InvokeClient
  S2ALL = "S2ALL", // FireAllClients
}

// ---------------------------------------------------------------------------
// §2  Log Entry Schema
// ---------------------------------------------------------------------------

/**
 * A single captured remote call entry stored in the intercept log.
 *
 * @template TArgs - Tuple type of the serialised argument list.
 * @template TRet  - Return type (only populated for `RemoteFunction` calls).
 */
export interface RemoteLogEntry<
  TArgs extends LuaValue[] = LuaValue[],
  TRet extends LuaValue | LuaNil = LuaNil,
> {
  /**
   * Monotonically increasing sequence number.
   * Useful for ordering entries when timestamps collide.
   */
  readonly seq: LuaNumber;

  /**
   * Unix timestamp (seconds since epoch) of when the call was captured,
   * obtained via `os.time()` in Luau or `Date.now() / 1000` in TS.
   */
  readonly timestamp: LuaNumber;

  /**
   * High-resolution tick for sub-second ordering.
   * Obtained via `tick()` / `os.clock()` in Luau.
   */
  readonly tick: LuaNumber;

  /** Full DataModel path of the remote instance (e.g. `"game.ReplicatedStorage.Remotes.BuyItem"`). */
  readonly remotePath: LuaString;

  /** ClassName of the remote (`RemoteEvent`, `RemoteFunction`, etc.). */
  readonly remoteClass: RemoteClassName;

  /** The method that was called (e.g. `"FireServer"`). */
  readonly method: RemoteMethodName;

  /** Traffic direction derived from `method`. */
  readonly direction: RemoteDirection;

  /**
   * Serialised argument list captured at call time.
   * Arguments are deep-copied to prevent mutation by the original call.
   */
  readonly args: TArgs;

  /**
   * Return values — only populated for `RemoteFunction` (InvokeServer /
   * InvokeClient) entries. `null` for fire-and-forget remotes.
   */
  returnValues: TRet extends LuaNil ? null : TRet[];

  /**
   * Whether the intercept handler chose to **block** this call.
   * Blocked calls are logged but NOT forwarded to the server.
   */
  blocked: LuaBoolean;

  /**
   * If the call was replayed (re-fired after capture), this records how many
   * times it has been replayed.
   */
  replayCount: LuaNumber;
}

// ---------------------------------------------------------------------------
// §3  Filter / Intercept Rules
// ---------------------------------------------------------------------------

/**
 * A rule that decides whether a remote call should be logged, blocked, or
 * passed through unmodified.
 */
export interface InterceptRule {
  /**
   * Human-readable name for this rule (displayed in the UI log panel).
   * @example "Block anti-cheat heartbeat"
   */
  name: LuaString;

  /**
   * Whether this rule is currently active.
   * @default true
   */
  enabled: LuaBoolean;

  /**
   * Remote path pattern to match.
   * Supports `*` wildcards: `"game.ReplicatedStorage.AC.*"`.
   * If omitted, the rule matches ALL remotes.
   */
  remotePath?: LuaString;

  /**
   * Restrict the rule to specific methods.
   * If omitted, all methods are matched.
   */
  methods?: RemoteMethodName[];

  /**
   * Restrict the rule to a specific direction.
   * If omitted, both directions are matched.
   */
  direction?: RemoteDirection;

  /**
   * Predicate evaluated against the captured call.
   * Return `true` to apply the rule's `action`; `false` to skip it.
   *
   * @param entry - The partially-populated log entry (args are available;
   *                `blocked` / `returnValues` are not yet finalised).
   */
  predicate?: (entry: RemoteLogEntry) => boolean;

  /**
   * Action to take when the rule matches and the predicate (if any) returns
   * `true`.
   *
   * - `"log"`    → record the entry, forward the call normally.
   * - `"block"`  → record the entry, do NOT forward the call.
   * - `"modify"` → invoke `modifier` to transform args before forwarding.
   * - `"ignore"` → do NOT record or intercept; pass through invisibly.
   */
  action: "log" | "block" | "modify" | "ignore";

  /**
   * Argument transformer — only used when `action === "modify"`.
   *
   * Receives the original args and returns a (possibly mutated) replacement
   * args array. Returning `null` is equivalent to `"block"`.
   *
   * @param args - Original argument list.
   * @returns      Modified argument list, or `null` to block.
   */
  modifier?: (args: LuaValue[]) => LuaValue[] | null;
}

// ---------------------------------------------------------------------------
// §4  Intercept Manager
// ---------------------------------------------------------------------------

/**
 * Configuration for initialising the remote intercept system.
 */
export interface InterceptManagerConfig {
  /**
   * Maximum number of log entries to keep in memory.
   * Oldest entries are evicted when the buffer is full (ring-buffer behaviour).
   * @default 500
   */
  maxLogEntries?: LuaNumber;

  /**
   * Whether to log calls to remotes whose path contains typical anti-cheat
   * keywords (e.g. `"AC"`, `"Anticheat"`, `"Heartbeat"`) by default.
   * Enable only when specifically investigating AC mechanisms.
   * @default false
   */
  captureAnticheat?: LuaBoolean;

  /**
   * Initial rule set applied in order. Rules are evaluated top-to-bottom;
   * the FIRST matching rule wins (no fall-through).
   */
  rules?: InterceptRule[];

  /**
   * Called for every log entry that passes `action !== "ignore"`.
   * Useful for piping entries to a custom UI panel in real-time.
   */
  onEntry?: (entry: RemoteLogEntry) => void;
}

/**
 * The central controller for the remote interception system.
 *
 * Internally this class manages:
 * 1. Installation / removal of the `__namecall` hook via `hookmetamethod`.
 * 2. The ring-buffer of `RemoteLogEntry` objects.
 * 3. Evaluation of `InterceptRule` chains.
 * 4. Replay / fire utilities.
 *
 * **Typical Luau initialisation:**
 * ```lua
 * local mgr = RemoteInterceptManager.new({
 *   maxLogEntries = 200,
 *   rules = {
 *     { name = "Block AC", remotePath = "game.ReplicatedStorage.AC.*", action = "block" },
 *   }
 * })
 * mgr:attach()
 * ```
 */
export class RemoteInterceptManager {
  private config: Required<InterceptManagerConfig>;
  private log: RemoteLogEntry[] = [];
  private seq = 0;
  private attached = false;
  private hookCleanup: (() => void) | null = null;

  constructor(config: InterceptManagerConfig = {}) {
    this.config = {
      maxLogEntries    : config.maxLogEntries    ?? 500,
      captureAnticheat : config.captureAnticheat ?? false,
      rules            : config.rules            ?? [],
      onEntry          : config.onEntry          ?? (() => {}),
    };
  }

  // -----------------------------------------------------------------------
  // Installation
  // -----------------------------------------------------------------------

  /**
   * Installs the `__namecall` hook on `game` (the DataModel root).
   *
   * After calling `attach()`, all client-originated remote calls will be
   * evaluated against the rule chain before being forwarded.
   *
   * **Luau hook setup (pseudocode):**
   * ```lua
   * local oldNamecall
   * oldNamecall = hookmetamethod(game, "__namecall", function(self, ...)
   *   local method = getnamecallmethod()
   *   if REMOTE_METHODS[method] and self:IsA("RemoteEvent") then
   *     -- evaluate rules, log, possibly block
   *     if not blocked then
   *       return oldNamecall(self, ...)
   *     end
   *   else
   *     return oldNamecall(self, ...)
   *   end
   * end)
   * ```
   *
   * @throws {Error} If `attach()` is called when already attached.
   */
  attach(): void {
    if (this.attached) throw new Error("RemoteInterceptManager is already attached.");
    this.attached = true;

    // In a real Luau environment this would call hookmetamethod(game, "__namecall", ...)
    // The TypeScript representation captures the pattern for AI knowledge mapping.
    console.log("[RemoteInterceptManager] __namecall hook installed on game.");

    this.hookCleanup = () => {
      console.log("[RemoteInterceptManager] __namecall hook removed.");
    };
  }

  /**
   * Removes the `__namecall` hook and restores the original metamethod.
   * All previously logged entries remain accessible via `getLog()`.
   */
  detach(): void {
    if (!this.attached) return;
    this.hookCleanup?.();
    this.hookCleanup = null;
    this.attached = false;
  }

  // -----------------------------------------------------------------------
  // Internal: rule evaluation
  // -----------------------------------------------------------------------

  /**
   * Evaluates the rule chain against a newly-captured call.
   *
   * @param entry - Pre-populated log entry (args available, blocked=false).
   * @returns       The (possibly modified) entry after rule application.
   *
   * @internal
   */
  private applyRules(entry: RemoteLogEntry): RemoteLogEntry {
    for (const rule of this.config.rules) {
      if (!rule.enabled) continue;
      if (!this.matchesRule(entry, rule)) continue;
      if (rule.predicate && !rule.predicate(entry)) continue;

      switch (rule.action) {
        case "ignore":
          return { ...entry, blocked: false }; // skip log
        case "block":
          return { ...entry, blocked: true };
        case "modify": {
          const newArgs = rule.modifier?.(entry.args as LuaValue[]);
          if (newArgs === null || newArgs === undefined) return { ...entry, blocked: true };
          return { ...entry, args: newArgs } as RemoteLogEntry;
        }
        case "log":
        default:
          return entry; // record and forward
      }
    }
    return entry;
  }

  /**
   * Tests whether a log entry matches a rule's pattern fields
   * (remotePath wildcard, method list, direction).
   *
   * @internal
   */
  private matchesRule(entry: RemoteLogEntry, rule: InterceptRule): boolean {
    if (rule.remotePath) {
      const pattern = rule.remotePath.replace(/\*/g, ".*");
      if (!new RegExp(`^${pattern}$`).test(entry.remotePath)) return false;
    }
    if (rule.methods && !rule.methods.includes(entry.method)) return false;
    if (rule.direction && rule.direction !== entry.direction) return false;
    return true;
  }

  // -----------------------------------------------------------------------
  // Log Access
  // -----------------------------------------------------------------------

  /**
   * Returns a shallow copy of the current log, most recent entry last.
   */
  getLog(): RemoteLogEntry[] {
    return [...this.log];
  }

  /**
   * Returns log entries filtered by remote path substring.
   *
   * @param pathSubstring - Case-insensitive substring to search for.
   */
  filterByPath(pathSubstring: LuaString): RemoteLogEntry[] {
    const lower = pathSubstring.toLowerCase();
    return this.log.filter(e => e.remotePath.toLowerCase().includes(lower));
  }

  /**
   * Returns log entries filtered by method name.
   *
   * @param method - One of the `REMOTE_METHOD_NAMES`.
   */
  filterByMethod(method: RemoteMethodName): RemoteLogEntry[] {
    return this.log.filter(e => e.method === method);
  }

  /** Clears all log entries. */
  clearLog(): void {
    this.log = [];
  }

  // -----------------------------------------------------------------------
  // Replay / Fire
  // -----------------------------------------------------------------------

  /**
   * Re-fires a previously captured remote call with the SAME arguments.
   *
   * This is the equivalent of calling `:FireServer(...)` manually from
   * Luau with the args stored in the log entry.
   *
   * **Luau equivalent:**
   * ```lua
   * local remote = getRemoteByPath(entry.remotePath)
   * remote:FireServer(table.unpack(entry.args))
   * entry.replayCount += 1
   * ```
   *
   * @param entry - The log entry to replay.
   * @param times - How many times to replay. @default 1
   */
  replay(entry: RemoteLogEntry, times: LuaNumber = 1): void {
    if (!this.attached) {
      throw new Error("Cannot replay: manager is not attached.");
    }
    for (let i = 0; i < times; i++) {
      // Luau: remote[entry.method](remote, table.unpack(entry.args))
      (entry as { replayCount: number }).replayCount += 1;
      console.log(
        `[Replay #${entry.replayCount}] ${entry.remotePath}:${entry.method}(`,
        ...entry.args,
        ")"
      );
    }
  }

  /**
   * Fires a remote directly by its DataModel path, bypassing the intercept
   * hook (the fired call will NOT appear in the log).
   *
   * **Luau equivalent:**
   * ```lua
   * local remote = game:FindFirstChild(path, true)  -- recursive search
   * remote:FireServer(table.unpack(args))
   * ```
   *
   * @param remotePath - Full DataModel path string.
   * @param method     - Method to invoke.
   * @param args       - Arguments to pass.
   */
  fireRaw(
    remotePath: LuaString,
    method: RemoteMethodName,
    ...args: LuaValue[]
  ): void {
    console.log(`[FireRaw] ${remotePath}:${method}(`, ...args, ")");
    // Real Luau implementation resolves the remote instance via getRemoteByPath,
    // then invokes: remote[method](remote, table.unpack(args))
  }

  // -----------------------------------------------------------------------
  // Rule Management
  // -----------------------------------------------------------------------

  /**
   * Appends a new intercept rule to the END of the rule chain (lowest priority).
   *
   * @param rule - The rule to add.
   */
  addRule(rule: InterceptRule): void {
    this.config.rules.push(rule);
  }

  /**
   * Inserts a rule at the BEGINNING of the rule chain (highest priority).
   *
   * @param rule - The rule to prepend.
   */
  prependRule(rule: InterceptRule): void {
    this.config.rules.unshift(rule);
  }

  /**
   * Removes all rules whose `name` matches the given string.
   *
   * @param name - The rule name to remove.
   */
  removeRuleByName(name: LuaString): void {
    this.config.rules = this.config.rules.filter(r => r.name !== name);
  }

  /** Returns a copy of the current rule list. */
  getRules(): InterceptRule[] {
    return [...this.config.rules];
  }
}

// ---------------------------------------------------------------------------
// §5  Utility: Remote Path Resolution
// ---------------------------------------------------------------------------

/**
 * Resolves the full DataModel path of a Roblox remote instance as a
 * dot-separated string.
 *
 * Traverses `instance.Parent` up to `game` (DataModel root) and builds the
 * path string in reverse.
 *
 * **Luau equivalent:**
 * ```lua
 * local function getPath(instance)
 *   local path = {}
 *   local current = instance
 *   while current ~= game and current ~= nil do
 *     table.insert(path, 1, current.Name)
 *     current = current.Parent
 *   end
 *   table.insert(path, 1, "game")
 *   return table.concat(path, ".")
 * end
 * ```
 *
 * @param instance - Any Roblox Instance.
 * @returns          Dot-path string (e.g. `"game.ReplicatedStorage.Remotes.BuyItem"`).
 */
export function getRemotePath(instance: RobloxInstance): LuaString {
  const parts: string[] = [];
  let current: RobloxInstance | null = instance;
  while (current !== null) {
    parts.unshift(current.Name as string);
    current = current.Parent as RobloxInstance | null;
  }
  return parts.join(".") as LuaString;
}

/**
 * Derives the `RemoteDirection` from a method name.
 *
 * @param method - A `RemoteMethodName`.
 * @returns        The corresponding `RemoteDirection`.
 */
export function directionFromMethod(method: RemoteMethodName): RemoteDirection {
  switch (method) {
    case "FireServer":
    case "InvokeServer":
      return RemoteDirection.C2S;
    case "FireAllClients":
      return RemoteDirection.S2ALL;
    case "FireClient":
    case "InvokeClient":
    default:
      return RemoteDirection.S2C;
  }
}

// ---------------------------------------------------------------------------
// §6  Serialisation Helpers
// ---------------------------------------------------------------------------

/**
 * Serialises a `RemoteLogEntry` to a human-readable log line.
 *
 * Format:
 * `[SEQ:0004] [12:34:56] C2S  game.RS.Remotes.Buy:FireServer({"itemId":42})`
 *
 * @param entry - The log entry to format.
 * @returns       A single-line string representation.
 */
export function formatLogEntry(entry: RemoteLogEntry): LuaString {
  const seq   = String(entry.seq).padStart(4, "0");
  const date  = new Date(entry.timestamp * 1000);
  const time  = date.toTimeString().slice(0, 8);
  const dir   = entry.direction.padEnd(5);
  const block = entry.blocked ? " [BLOCKED]" : "";
  const args  = JSON.stringify(entry.args);

  return `[SEQ:${seq}] [${time}] ${dir} ${entry.remotePath}:${entry.method}(${args})${block}` as LuaString;
}

/**
 * Exports the entire log buffer as a newline-delimited string for clipboard
 * copy or file save.
 *
 * @param entries - Array of log entries (typically from `manager.getLog()`).
 * @returns         Multi-line string with one entry per line.
 */
export function exportLog(entries: RemoteLogEntry[]): LuaString {
  return entries.map(formatLogEntry).join("\n") as LuaString;
}

import type { GeminiMessage } from '../ai-knowledge';

export const REMOTE_UTILS_KNOWLEDGE: GeminiMessage = {
  role: 'user',
  parts: [{ text: `REFERENSI TEKNIS: REMOTE INTERCEPT & UTILS
Gunakan pola ini untuk mengelola komunikasi network:

\`\`\`typescript
export interface RemoteLogEntry<TArgs extends LuaValue[] = LuaValue[], TRet extends LuaValue | LuaNil = LuaNil> {
  readonly seq: LuaNumber;
  readonly remotePath: LuaString;
  readonly method: RemoteMethodName;
  readonly direction: RemoteDirection;
  readonly args: TArgs;
  blocked: LuaBoolean;
}
export class RemoteInterceptManager {
  attach(): void; -- Installs __namecall hook
  replay(entry: RemoteLogEntry, times: LuaNumber): void;
  fireRaw(remotePath: LuaString, method: RemoteMethodName, ...args: LuaValue[]): void;
}
\`\`\`` }]
};
