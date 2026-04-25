import type { KnowledgeMessage } from '../ai-knowledge'

/**
 * @file engine.ts
 * @description Advanced Technical Specifications for the Luau VM internals,
 * Task Scheduler, RunService event loops, Garbage Collector manipulation,
 * Metatable raw access, and Luau type system.
 */

export const ENGINE_KNOWLEDGE: KnowledgeMessage[] = [
  {
    role: 'user',
    parts: [{ text: 'Provide the complete technical specification for Luau Engine Internals, Task Scheduler, RunService, GC, and Type System.' }]
  },
  {
    role: 'model',
    parts: [{ text: `REFERENSI TEKNIS: ENGINE INTERNALS & LUAU VM

═══════════════════════════════════════════
§1  TASK LIBRARY (Modern Scheduler)
═══════════════════════════════════════════
WAJIB gunakan task library, JANGAN gunakan legacy wait/spawn/delay.

\`\`\`lua
-- task.spawn: Jalankan function di thread baru SEGERA (same frame)
task.spawn(function()
    print("Runs immediately in new thread")
end)

-- task.spawn dengan arguments
task.spawn(function(a, b)
    print(a + b) --> 3
end, 1, 2)

-- task.defer: Jalankan function SETELAH current frame selesai
-- Berguna untuk menghindari race conditions
task.defer(function()
    print("Runs after current execution cycle")
end)

-- task.wait: Yield dengan presisi tinggi (returns actual elapsed time)
-- JANGAN gunakan wait(), SELALU gunakan task.wait()
local elapsed = task.wait(1) -- wait 1 second
print(elapsed) --> 1.0003... (actual elapsed)

-- task.wait() tanpa argument = yield 1 frame (≈0.0167s at 60fps)
task.wait()

-- task.delay: Jadwalkan function setelah delay
task.delay(5, function()
    print("Runs after 5 seconds")
end)

-- task.cancel: Batalkan thread yang di-spawn atau di-delay
local thread = task.delay(10, function()
    print("This will be cancelled")
end)
task.cancel(thread)

-- task.desynchronize / task.synchronize: Parallel Luau
-- Untuk Actor-based parallel execution
task.desynchronize() -- Switch ke parallel execution
-- ... parallel-safe code ...
task.synchronize()   -- Switch kembali ke serial execution
\`\`\`

═══════════════════════════════════════════
§2  RUNSERVICE EVENT LOOPS
═══════════════════════════════════════════
Pilih event loop yang tepat untuk use case:

\`\`\`lua
local RunService = game:GetService("RunService")

-- RenderStepped: Fires SEBELUM frame di-render (CLIENT ONLY)
-- Gunakan untuk: Camera manipulation, UI updates, visual effects
-- WARNING: Blocking di sini = lag visual
RunService.RenderStepped:Connect(function(deltaTime)
    -- deltaTime = waktu sejak frame terakhir (seconds)
    camera.CFrame = camera.CFrame * CFrame.Angles(0, deltaTime, 0)
end)

-- Heartbeat: Fires SETELAH physics simulation selesai
-- Gunakan untuk: Game logic, movement, auto-farm loops
-- Ini yang PALING SERING dipakai untuk scripts
RunService.Heartbeat:Connect(function(dt)
    -- Physics sudah selesai, safe untuk modify positions
    root.CFrame = root.CFrame + direction * speed * dt
end)

-- Stepped: Fires SEBELUM physics simulation
-- Gunakan untuk: Set physics properties sebelum simulation
RunService.Stepped:Connect(function(simulationTime, dt)
    -- Set velocity/force sebelum physics step
    humanoid:ChangeState(Enum.HumanoidStateType.Physics)
end)

-- BindToRenderStep: Prioritized render loop (CLIENT ONLY)
-- Priority: Lower number = runs first
RunService:BindToRenderStep("MyCamera", Enum.RenderPriority.Camera.Value + 1, function(dt)
    -- Runs right after camera update
end)

-- Unbind ketika cleanup
RunService:UnbindFromRenderStep("MyCamera")

-- Pattern: Proper game loop with cleanup
local connection
connection = RunService.Heartbeat:Connect(function(dt)
    if not running then
        connection:Disconnect()
        return
    end
    -- game logic here
end)
\`\`\`

═══════════════════════════════════════════
§3  GARBAGE COLLECTOR MANIPULATION
═══════════════════════════════════════════

\`\`\`lua
-- getgc: Returns semua objects dalam garbage collector
-- Sangat powerful untuk mencari functions/tables game
local gc = getgc(true) -- true = include tables

-- Pattern: Cari function berdasarkan upvalue/constant
for _, obj in gc do
    if typeof(obj) == "function" and islclosure(obj) then
        local info = getinfo(obj)
        -- Cari berdasarkan source name
        if info.source and string.find(info.source, "WeaponHandler") then
            -- Found the function from WeaponHandler script
        end
    end
end

-- Pattern: Cari table berdasarkan key tertentu
for _, obj in gc do
    if typeof(obj) == "table" and rawget(obj, "DamageMultiplier") then
        rawset(obj, "DamageMultiplier", 999)
    end
end

-- filtergc: Filtered version (more efficient)
-- Cari semua functions dari source tertentu
local results = filtergc("function", {
    Source = "WeaponSystem"
})

-- Cari semua tables dengan key tertentu
local tables = filtergc("table", {
    Keys = {"Health", "MaxHealth", "Armor"}
})

-- getinfo: Debug info tentang function
local info = getinfo(someFunction)
-- info.source     = "@game.ServerScriptService.Main"
-- info.name       = "calculateDamage"  
-- info.numparams  = 3
-- info.is_vararg  = false
-- info.currentline = 42

-- getconstants / setconstant: Read/modify bytecode constants
local constants = getconstants(someFunction)
-- constants berisi strings, numbers yang di-hardcode dalam function

-- Contoh: Patch speed cap dari 50 ke 500
for i, v in constants do
    if v == 50 then
        setconstant(someFunction, i, 500)
    end
end

-- getprotos / getproto: Access nested (child) functions
local childFunctions = getprotos(parentFunction)
for _, childFn in childFunctions do
    -- Inspect atau hook child functions
end
\`\`\`

═══════════════════════════════════════════
§4  RAW METATABLE ACCESS
═══════════════════════════════════════════

\`\`\`lua
-- getrawmetatable: Bypass __metatable guard
-- game objects punya __metatable = "The metatable is locked"
-- getmetatable(game) returns string, getrawmetatable(game) returns real MT
local mt = getrawmetatable(game)

-- setreadonly: Toggle read-only flag pada metatable
-- WAJIB setreadonly(false) sebelum modify, setreadonly(true) setelah
setreadonly(mt, false)
local oldIndex = mt.__index
mt.__index = newcclosure(function(self, key)
    if checkcaller() then return oldIndex(self, key) end
    -- custom logic
    return oldIndex(self, key)
end)
setreadonly(mt, true)

-- isreadonly: Check apakah table read-only
if isreadonly(mt) then
    setreadonly(mt, false)
end

-- rawget / rawset: Bypass metamethods untuk table access
-- rawget(t, k)  = t[k] tanpa trigger __index
-- rawset(t, k, v) = t[k] = v tanpa trigger __newindex
local realValue = rawget(someTable, "key")
rawset(someTable, "key", newValue)
\`\`\`

═══════════════════════════════════════════
§5  LUAU TYPE ANNOTATIONS
═══════════════════════════════════════════

\`\`\`lua
-- Basic type annotations
local name: string = "hello"
local count: number = 42
local active: boolean = true

-- Function signatures
local function greet(name: string, age: number): string
    return "Hello " .. name .. " age " .. tostring(age)
end

-- Table types
type PlayerData = {
    name: string,
    health: number,
    inventory: {string},
    stats: {[string]: number}
}

-- Optional types
local function find(name: string): Instance?
    return workspace:FindFirstChild(name)
end

-- Union types
type Result = string | number | nil

-- Type exports (module scope)
export type WeaponConfig = {
    damage: number,
    range: number,
    cooldown: number,
    effects: {string}?
}

-- Generic types
type Array<T> = {T}
type Dictionary<K, V> = {[K]: V}

-- typeof() untuk Roblox types (beda dari type())
-- type() returns "userdata" untuk semua Roblox objects
-- typeof() returns class name: "Vector3", "CFrame", "Instance", etc.
if typeof(value) == "Instance" then
    print(value.ClassName)
elseif typeof(value) == "Vector3" then
    print(value.Magnitude)
end
\`\`\`

═══════════════════════════════════════════
§6  COROUTINE PATTERNS
═══════════════════════════════════════════

\`\`\`lua
-- coroutine.create + coroutine.resume
local co = coroutine.create(function(x)
    print("Start:", x)
    local y = coroutine.yield(x * 2)
    print("Resumed with:", y)
    return x + y
end)

local ok, result = coroutine.resume(co, 5)  --> Start: 5, result=10
local ok2, final = coroutine.resume(co, 3)  --> Resumed with: 3, final=8

-- coroutine.wrap: Simpler API
local iter = coroutine.wrap(function()
    for i = 1, 5 do
        coroutine.yield(i)
    end
end)
print(iter()) --> 1
print(iter()) --> 2

-- coroutine.status: Check thread state
-- "running" | "suspended" | "dead" | "normal"
print(coroutine.status(co)) --> "dead"
\`\`\`` }]
  }
]
