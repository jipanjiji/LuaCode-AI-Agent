import type { KnowledgeMessage } from '../ai-knowledge'

/**
 * @file patterns.ts
 * @description Production-grade Luau coding patterns: OOP, Maid/Janitor,
 * Signal, State Machine, Module, Debounce, Retry, Table utilities.
 */

export const PATTERNS_KNOWLEDGE: KnowledgeMessage[] = [
  {
    role: 'user',
    parts: [{ text: 'Provide complete specs for Professional Luau Coding Patterns.' }]
  },
  {
    role: 'model',
    parts: [{ text: `REFERENSI TEKNIS: PROFESSIONAL LUAU PATTERNS

§1 OOP (Object-Oriented Programming)
\`\`\`lua
local MyClass = {}
MyClass.__index = MyClass

function MyClass.new(name: string, health: number)
    local self = setmetatable({}, MyClass)
    self.Name = name
    self.Health = health
    self.MaxHealth = health
    self._connections = {}
    return self
end

function MyClass:TakeDamage(amount: number)
    self.Health = math.max(0, self.Health - amount)
    if self.Health <= 0 then self:OnDeath() end
end

function MyClass:Heal(amount: number)
    self.Health = math.min(self.MaxHealth, self.Health + amount)
end

function MyClass:OnDeath()
    self:Destroy()
end

function MyClass:Destroy()
    for _, conn in self._connections do conn:Disconnect() end
    table.clear(self._connections)
    setmetatable(self, nil)
end

-- Inheritance
local BossEnemy = setmetatable({}, {__index = MyClass})
BossEnemy.__index = BossEnemy

function BossEnemy.new(name, health, phase)
    local self = MyClass.new(name, health)
    setmetatable(self, BossEnemy)
    self.Phase = phase or 1
    return self
end

function BossEnemy:OnDeath()
    if self.Phase < 3 then
        self.Phase += 1
        self.Health = self.MaxHealth * 1.5
    else
        MyClass.OnDeath(self)
    end
end
\`\`\`

§2 CONNECTION TRACKER (Maid Pattern)
\`\`\`lua
local Maid = {}
Maid.__index = Maid

function Maid.new()
    return setmetatable({_tasks = {}}, Maid)
end

function Maid:Add(task, key)
    if key then
        local old = self._tasks[key]
        if old then self:_clean(old) end
        self._tasks[key] = task
    else
        table.insert(self._tasks, task)
    end
    return task
end

function Maid:_clean(task)
    local t = typeof(task)
    if t == "RBXScriptConnection" then task:Disconnect()
    elseif t == "Instance" then task:Destroy()
    elseif t == "function" then task()
    elseif t == "table" and task.Destroy then task:Destroy() end
end

function Maid:Cleanup()
    for _, task in self._tasks do self:_clean(task) end
    table.clear(self._tasks)
end

-- Usage
local maid = Maid.new()
maid:Add(RunService.Heartbeat:Connect(function(dt) end))
maid:Add(Instance.new("Part"))
maid:Add(function() print("cleanup!") end)
maid:Add(someConn, "MainLoop") -- named, auto-replaces old
maid:Cleanup()
\`\`\`

§3 SIGNAL / CUSTOM EVENT
\`\`\`lua
local Signal = {}
Signal.__index = Signal

function Signal.new()
    return setmetatable({_listeners = {}}, Signal)
end

function Signal:Connect(callback)
    local conn = { _callback = callback, Connected = true }
    function conn:Disconnect() self.Connected = false; self._callback = nil end
    table.insert(self._listeners, conn)
    return conn
end

function Signal:Fire(...)
    for i = #self._listeners, 1, -1 do
        local c = self._listeners[i]
        if c.Connected then task.spawn(c._callback, ...)
        else table.remove(self._listeners, i) end
    end
end

function Signal:Once(callback)
    local conn; conn = self:Connect(function(...)
        conn:Disconnect(); callback(...)
    end); return conn
end

function Signal:Wait()
    local thread = coroutine.running()
    self:Once(function(...) task.spawn(thread, ...) end)
    return coroutine.yield()
end

function Signal:Destroy()
    for _, c in self._listeners do c:Disconnect() end
    table.clear(self._listeners)
end
\`\`\`

§4 STATE MACHINE
\`\`\`lua
local SM = {}
SM.__index = SM

function SM.new(initial)
    return setmetatable({
        _state = initial, _handlers = {}, _onEnter = {}, _onExit = {}
    }, SM)
end

function SM:Register(name, config)
    self._handlers[name] = config.update
    self._onEnter[name] = config.enter
    self._onExit[name] = config.exit
end

function SM:TransitionTo(newState)
    if self._state == newState then return end
    if self._onExit[self._state] then self._onExit[self._state]() end
    self._state = newState
    if self._onEnter[newState] then self._onEnter[newState]() end
end

function SM:Update(dt) 
    if self._handlers[self._state] then self._handlers[self._state](dt) end
end

function SM:GetState() return self._state end
\`\`\`

§5 MODULE PATTERN
\`\`\`lua
local FarmModule = {}
local _isRunning = false
local _connection = nil

function FarmModule.Start(config)
    if _isRunning then return end
    _isRunning = true
    _connection = RunService.Heartbeat:Connect(function(dt)
        -- farm logic
    end)
end

function FarmModule.Stop()
    _isRunning = false
    if _connection then _connection:Disconnect(); _connection = nil end
end

function FarmModule.IsRunning() return _isRunning end
return FarmModule
\`\`\`

§6 DEBOUNCE & COOLDOWN
\`\`\`lua
local function debounce(fn, cooldown)
    local lastCall = 0
    return function(...)
        local now = tick()
        if now - lastCall >= cooldown then
            lastCall = now
            return fn(...)
        end
    end
end

local Cooldowns = {}
function Cooldowns:Set(key, duration) self[key] = tick() + duration end
function Cooldowns:IsReady(key) return not self[key] or tick() >= self[key] end
\`\`\`

§7 RETRY WITH BACKOFF
\`\`\`lua
local function retry(fn, maxAttempts, baseDelay)
    for attempt = 1, maxAttempts do
        local ok, result = pcall(fn)
        if ok then return result end
        if attempt < maxAttempts then
            local delay = baseDelay * (2 ^ (attempt - 1)) + math.random() * 0.1
            task.wait(delay)
        else
            error("All " .. maxAttempts .. " attempts failed: " .. tostring(result))
        end
    end
end
\`\`\`

§8 TABLE UTILITIES
\`\`\`lua
local function deepCopy(original)
    if typeof(original) ~= "table" then return original end
    local copy = {}
    for k, v in original do copy[deepCopy(k)] = deepCopy(v) end
    return setmetatable(copy, getmetatable(original))
end

local function merge(base, override)
    local result = table.clone(base)
    for k, v in override do result[k] = v end
    return result
end

local function getPath(tbl, ...)
    local current = tbl
    for _, key in {...} do
        if typeof(current) ~= "table" then return nil end
        current = current[key]
    end
    return current
end
-- Usage: getPath(data, "player", "stats", "health")
\`\`\`` }]
  }
]
