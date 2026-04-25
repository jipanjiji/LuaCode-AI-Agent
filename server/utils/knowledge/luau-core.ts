/**
 * @file luau-core.d.ts
 * @description Strict TypeScript definitions for base Luau types, instances,
 * closures, C-level functions, metatables, and metamethod structures.
 *
 * This file models the Luau runtime type system as it exists in Roblox's
 * execution environment — including how Lua values are represented at the C
 * layer, how closures (both Lua-defined and C-defined) are distinguished, and
 * how metatables define operator/access behavior for tables.
 */

// ---------------------------------------------------------------------------
// §1  Primitive Value Union
// ---------------------------------------------------------------------------

/**
 * Represents every value type that can exist on the Luau stack at runtime.
 *
 * - `LuaNil`      → the singleton `nil`; distinct from JS `undefined`
 * - `LuaBoolean`  → true / false
 * - `LuaNumber`   → IEEE-754 double (Luau uses `double` internally)
 * - `LuaString`   → immutable, byte-oriented string; may contain `\0`
 * - `LuaTable`    → first-class associative array; also acts as class/module
 * - `LuaFunction` → Lua-defined or C-defined callable
 * - `LuaUserdata` → opaque C struct wrapped for Lua
 * - `LuaThread`   → coroutine / Luau task
 */
export type LuaValue =
  | LuaNil
  | LuaBoolean
  | LuaNumber
  | LuaString
  | LuaTable
  | LuaFunction
  | LuaUserdata
  | LuaThread;

/** The Luau `nil` singleton type. */
export type LuaNil = null;

/** A Luau boolean. */
export type LuaBoolean = boolean;

/**
 * Luau numbers are always 64-bit IEEE-754 doubles at the VM level, even when
 * they look like integers. Luau 5.1-derived VMs have no separate integer type
 * (unlike Lua 5.3+).
 */
export type LuaNumber = number;

/**
 * Luau strings are immutable byte arrays. They are interned by the VM for
 * equality comparison efficiency. TypeScript `string` is the closest
 * approximation, but callers must be aware that Luau strings can hold
 * arbitrary binary data.
 */
export type LuaString = string;

// ---------------------------------------------------------------------------
// §2  Table / Metatable Model
// ---------------------------------------------------------------------------

/**
 * A Luau table is a hybrid hash-map + array. Keys can be any non-nil,
 * non-NaN LuaValue. This generic form uses `K` for key and `V` for value.
 *
 * @template K - Key type (defaults to `LuaValue`)
 * @template V - Value type (defaults to `LuaValue`)
 */
export interface LuaTable<K extends LuaValue = LuaValue, V extends LuaValue = LuaValue> {
  /** Raw entries. In real Luau this is split between the hash and array
   *  portions; here we unify them for TypeScript ergonomics. */
  readonly __entries: Map<K, V>;

  /**
   * Attached metatable, if any. The metatable controls metamethod dispatch
   * for this table (e.g. `__index`, `__newindex`, `__call`, etc.).
   */
  __metatable?: LuaMetatable<LuaTable<K, V>>;
}

/**
 * Full metatable definition for a Luau object of type `T`.
 *
 * Each field corresponds to a metamethod slot in the Luau VM. Fields that are
 * absent mean the default VM behaviour is used for that operation.
 *
 * @template T - The type this metatable is attached to (table or userdata).
 */
export interface LuaMetatable<T> {
  /**
   * `__index` metamethod.
   *
   * Called when a key lookup on `T` fails the raw table probe.
   * Can be either:
   * - A **table** → VM does a raw lookup on that table instead.
   * - A **function** `(self: T, key: LuaValue) => LuaValue` → arbitrary logic.
   *
   * This is the primary mechanism for prototype-based inheritance in Luau.
   *
   * @example
   * ```lua
   * setmetatable(obj, { __index = BaseClass })
   * ```
   */
  __index?: LuaTable | ((self: T, key: LuaValue) => LuaValue);

  /**
   * `__newindex` metamethod.
   *
   * Intercepted when a **new** key is written to `T`. If the key already
   * exists in the raw table, `__newindex` is NOT called (rawset bypasses it).
   *
   * Commonly used to make read-only tables or to proxy writes to another store.
   *
   * @param self  - The table being written to.
   * @param key   - The key being set.
   * @param value - The new value.
   */
  __newindex?: (self: T, key: LuaValue, value: LuaValue) => void;

  /**
   * `__namecall` metamethod — **Roblox/Luau extension**.
   *
   * Fired when the colon-syntax method call `obj:Method(...)` is used AND
   * `Method` is not found directly on the object. The VM passes the method
   * name as an extra implicit argument, allowing a single handler to dispatch
   * all method calls.
   *
   * This is heavily used by exploit frameworks to hook all Roblox Instance
   * method invocations (e.g. `part:Destroy()`, `remote:FireServer(...)`).
   *
   * @param self       - The receiver object.
   * @param methodName - The method name string passed by the VM.
   * @param args       - Remaining call arguments.
   * @returns          Any number of return values packed into an array.
   */
  __namecall?: (self: T, methodName: LuaString, ...args: LuaValue[]) => LuaValue[];

  /**
   * `__call` metamethod.
   *
   * Makes a table callable. `t(a, b)` invokes `__call(t, a, b)`.
   */
  __call?: (self: T, ...args: LuaValue[]) => LuaValue[];

  /**
   * `__tostring` metamethod.
   * Controls `tostring(obj)` output and Luau string coercion.
   */
  __tostring?: (self: T) => LuaString;

  /**
   * `__len` metamethod. Controls `#obj`.
   * By default, `#` only counts the array portion of a table.
   */
  __len?: (self: T) => LuaNumber;

  /**
   * `__eq` metamethod. Controls `==` between two tables/userdata.
   * Only invoked when both operands share the same metatable (Luau 5.1 rule).
   */
  __eq?: (a: T, b: T) => LuaBoolean;

  /** `__lt` — controls `<` comparison. */
  __lt?: (a: T, b: T) => LuaBoolean;

  /** `__le` — controls `<=` comparison. */
  __le?: (a: T, b: T) => LuaBoolean;

  /** `__add` — controls `+` operator. */
  __add?: (a: T, b: LuaValue) => LuaValue;

  /** `__sub` — controls `-` operator. */
  __sub?: (a: T, b: LuaValue) => LuaValue;

  /** `__mul` — controls `*` operator. */
  __mul?: (a: T, b: LuaValue) => LuaValue;

  /** `__div` — controls `/` operator. */
  __div?: (a: T, b: LuaValue) => LuaValue;

  /** `__mod` — controls `%` operator. */
  __mod?: (a: T, b: LuaValue) => LuaValue;

  /** `__unm` — controls unary `-obj`. */
  __unm?: (self: T) => LuaValue;

  /** `__concat` — controls `..` concatenation. */
  __concat?: (a: T, b: LuaValue) => LuaString;

  /**
   * `__metatable` guard.
   *
   * When present, `getmetatable(obj)` returns this value instead of the actual
   * metatable. Also prevents `setmetatable` from replacing it.
   * Commonly set to a string like `"The metatable is locked"`.
   */
  __metatable?: LuaString | LuaTable;

  /**
   * `__gc` — garbage-collection finalizer (Luau full userdata only).
   * Called when the object is about to be collected by the GC.
   */
  __gc?: (self: T) => void;
}

// ---------------------------------------------------------------------------
// §3  Closure / Function Model
// ---------------------------------------------------------------------------

/**
 * Enum distinguishing the two kinds of Luau functions as seen at the C layer.
 *
 * - `LUA_CLOSURE`  → compiled from `.lua`/`.luau` source; has proto, upvalues.
 * - `C_CLOSURE`    → registered via `lua_pushcclosure`; no Lua proto.
 * - `C_FUNCTION`   → plain `lua_CFunction` pointer with no upvalues.
 */
export const enum LuaFunctionType {
  LUA_CLOSURE = 0,
  C_CLOSURE   = 1,
  C_FUNCTION  = 2,
}

/**
 * Base interface common to all Luau callable objects.
 */
export interface LuaFunctionBase {
  readonly type: LuaFunctionType;

  /**
   * Calls the function with the given arguments and returns all results.
   * Mimics Luau's multi-return semantics — callers receive a tuple.
   */
  invoke(...args: LuaValue[]): LuaValue[];
}

/**
 * An **upvalue** — a closed-over variable captured by a Lua closure.
 *
 * In the Luau VM upvalues start as references to stack slots ("open upvalues")
 * and are "closed" (copied onto the heap) when the owning function returns.
 *
 * @template T - The Luau type stored in this upvalue.
 */
export interface LuaUpvalue<T extends LuaValue = LuaValue> {
  /** Human-readable debug name from debug info (may be `"?"` for stripped builds). */
  name: LuaString;
  /** Current value of the upvalue. Mutable — shared between all closures
   *  that captured the same variable. */
  value: T;
}

/**
 * A **Lua closure** — a function defined in Luau source code.
 *
 * Contains a reference to the function prototype (compiled bytecode + debug
 * info) and an array of upvalues.
 */
export interface LuaClosure extends LuaFunctionBase {
  readonly type: LuaFunctionType.LUA_CLOSURE;

  /** The compiled function prototype (bytecode, constants, child protos). */
  readonly proto: LuaProto;

  /** Captured upvalues, in the order they appear in the bytecode. */
  upvalues: LuaUpvalue[];

  /**
   * The environment table (`_ENV`) for this closure.
   * In standard Luau this is `_G` (the global table) unless the script
   * uses a custom environment set via `setfenv`-equivalent APIs.
   */
  env: LuaTable;
}

/**
 * A **C closure** — a native C function that has captured upvalues.
 *
 * Created via `lua_pushcclosure(L, fn, n)`. Upvalues are accessed from Lua
 * as pseudo-indices above `LUA_REGISTRYINDEX`.
 */
export interface LuaCClosure extends LuaFunctionBase {
  readonly type: LuaFunctionType.C_CLOSURE;

  /**
   * Pointer identifier for the underlying `lua_CFunction`.
   * Represented here as a branded number to prevent accidental arithmetic.
   */
  readonly cfuncPtr: CFunctionPointer;

  /** Upvalues stored alongside this C closure. */
  upvalues: LuaUpvalue[];
}

/**
 * A plain **C function** — no upvalues, just a function pointer.
 */
export interface LuaCFunction extends LuaFunctionBase {
  readonly type: LuaFunctionType.C_FUNCTION;
  readonly cfuncPtr: CFunctionPointer;
}

/** Union of all function representations. */
export type LuaFunction = LuaClosure | LuaCClosure | LuaCFunction;

/**
 * Branded nominal type for C-level function pointer addresses.
 * Prevents raw numbers from being accidentally used as pointers.
 */
export type CFunctionPointer = number & { readonly __brand: "CFunctionPointer" };

// ---------------------------------------------------------------------------
// §4  Function Prototype
// ---------------------------------------------------------------------------

/**
 * Compiled function prototype — the static, shareable part of a Lua closure.
 *
 * Corresponds to `Proto` in `lobject.h` of the reference Lua VM.
 */
export interface LuaProto {
  /** Source file name (e.g. `"@game.Script"`). May be `"?"` when stripped. */
  source: LuaString;

  /** Line number where this function starts in the source. `-1` if stripped. */
  lineDefined: LuaNumber;

  /** Number of fixed parameters (excludes `...` vararg). */
  numParams: LuaNumber;

  /** Whether this proto accepts vararg (`...`). */
  isVararg: boolean;

  /** Maximum stack slots used by this function at runtime. */
  maxStackSize: LuaNumber;

  /**
   * Constant pool — strings, numbers, booleans referenced by the bytecode.
   * `nil` is never stored; `false`/`true` are stored as JS booleans.
   */
  constants: Array<LuaString | LuaNumber | LuaBoolean>;

  /** Child function prototypes (closures defined inside this function). */
  children: LuaProto[];

  /**
   * Bytecode instruction array.
   * Each instruction is a 32-bit word encoding opcode + operands.
   * Stored here as raw 32-bit unsigned integers.
   */
  code: Uint32Array;

  /** Debug line information (maps instruction index → source line). */
  lineInfo: Int32Array | null;

  /** Local variable debug records. */
  locals: LuaLocalVar[];

  /** Upvalue debug records (names). */
  upvalueNames: LuaString[];
}

/** Debug record for a single local variable. */
export interface LuaLocalVar {
  name: LuaString;
  /** Instruction index at which this local comes into scope. */
  startPc: LuaNumber;
  /** Instruction index at which this local goes out of scope. */
  endPc: LuaNumber;
}

// ---------------------------------------------------------------------------
// §5  Userdata
// ---------------------------------------------------------------------------

/**
 * Luau userdata wraps a C-allocated block. Roblox uses this extensively —
 * every `Instance`, `Vector3`, `CFrame`, etc. is full userdata under the hood.
 *
 * @template Tag - Discriminant tag for the specific userdata kind.
 */
export interface LuaUserdata<Tag extends string = string> {
  readonly __userdataTag: Tag;

  /** Associated metatable. For Roblox instances this is the class metatable
   *  registered by the engine (e.g. the `Part` metatable). */
  __metatable?: LuaMetatable<LuaUserdata<Tag>>;
}

// ---------------------------------------------------------------------------
// §6  Thread / Coroutine
// ---------------------------------------------------------------------------

/**
 * The state a Luau coroutine can be in.
 *
 * Maps to `lua_status()` return values.
 */
export const enum LuaThreadStatus {
  /** Currently executing (is the running thread). */
  RUNNING   = "running",
  /** Suspended via `coroutine.yield()` or not yet started. */
  SUSPENDED = "suspended",
  /** Has returned normally or via `coroutine.wrap`. */
  DEAD      = "dead",
  /** Suspended inside `coroutine.resume` (nested coroutines). */
  NORMAL    = "normal",
}

/**
 * A Luau thread — the representation of a coroutine created via
 * `coroutine.create` or Roblox's `task.spawn`.
 */
export interface LuaThread {
  readonly __threadId: LuaNumber;
  status: LuaThreadStatus;

  /**
   * The closure that this thread is executing (or will execute on first resume).
   */
  mainClosure: LuaFunction;
}

// ---------------------------------------------------------------------------
// §7  Roblox Instance Stub
// ---------------------------------------------------------------------------

/**
 * Minimal representation of a Roblox `Instance` as seen from a Luau script.
 *
 * Real instances are C++ objects exposed as `LuaUserdata<"Instance">`, but
 * scripts interact with them through a rich metatable that provides property
 * access, method calls, and event connections.
 */
export interface RobloxInstance extends LuaUserdata<"Instance"> {
  /** ClassName string as returned by `Instance.ClassName`. */
  ClassName: LuaString;

  /** Display name in the DataModel tree. */
  Name: LuaString;

  /** Parent in the DataModel hierarchy. `null` == `nil` (workspace root etc.). */
  Parent: RobloxInstance | LuaNil;

  /**
   * Generic property/child access.
   * In Luau, `instance.Foo` triggers `__index` on the instance metatable,
   * which resolves to a property getter, child lookup, or method binding.
   */
  [key: LuaString]: LuaValue;
}
import type { KnowledgeMessage } from '../ai-knowledge';

export const LUAU_CORE_KNOWLEDGE: KnowledgeMessage = {
  role: 'user',
  parts: [{ text: `REFERENSI TEKNIS: LUAU CORE RUNTIME
Ikuti spesifikasi internal ini untuk setiap pengerjaan script:

\`\`\`typescript
export type LuaValue = LuaNil | LuaBoolean | LuaNumber | LuaString | LuaTable | LuaFunction | LuaUserdata | LuaThread;
export interface LuaMetatable<T> { 
  __index?: LuaTable | ((self: T, key: LuaValue) => LuaValue); 
  __newindex?: (self: T, key: LuaValue, value: LuaValue) => void;
  __namecall?: (self: T, methodName: LuaString, ...args: LuaValue[]) => LuaValue[];
  __call?: (self: T, ...args: LuaValue[]) => LuaValue[];
  __tostring?: (self: T) => LuaString;
}
export interface LuaClosure extends LuaFunctionBase {
  readonly type: LuaFunctionType.LUA_CLOSURE;
  readonly proto: LuaProto;
  upvalues: LuaUpvalue[];
  env: LuaTable;
}
\`\`\`` }]
};
