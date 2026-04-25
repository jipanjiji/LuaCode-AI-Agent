import type { KnowledgeMessage } from '../ai-knowledge'

/**
 * @file safety.ts
 * @description Production-grade defensive programming patterns for Roblox:
 * pcall/xpcall, nil-guards, respawn handling, safe traversal, typeof checks.
 */

export const SAFETY_KNOWLEDGE: KnowledgeMessage[] = [
  {
    role: 'user',
    parts: [{ text: 'Provide complete specs for Safety and Defensive Programming in Luau.' }]
  },
  {
    role: 'model',
    parts: [{ text: `REFERENSI TEKNIS: SAFETY & DEFENSIVE PROGRAMMING

§1 pcall / xpcall ERROR HANDLING
\`\`\`lua
-- pcall: Protected call, returns (success, result_or_error)
local ok, result = pcall(function()
    return game:GetService("HttpService"):GetAsync("https://api.example.com")
end)
if ok then
    print("Data:", result)
else
    warn("Error:", result)
end

-- pcall with arguments (more efficient, no closure allocation)
local ok, result = pcall(game.GetService, game, "HttpService")

-- xpcall: Like pcall but with error handler for stack traces
local ok, result = xpcall(function()
    error("Something broke!")
end, function(err)
    -- err handler receives the error message
    return debug.traceback(err, 2) -- add stack trace
end)
-- result now contains full stack trace

-- Pattern: Wrap remote calls safely
local function safeFireServer(remote, ...)
    local ok, err = pcall(remote.FireServer, remote, ...)
    if not ok then
        warn("[SafeFire] Failed:", remote:GetFullName(), err)
    end
    return ok
end

-- Pattern: Safe InvokeServer with timeout
local function safeInvoke(remote, timeout, ...)
    local result
    local done = false
    
    task.spawn(function(...)
        local ok, res = pcall(remote.InvokeServer, remote, ...)
        if ok then result = res end
        done = true
    end, ...)
    
    local start = tick()
    while not done and tick() - start < (timeout or 5) do
        task.wait()
    end
    return result
end
\`\`\`

§2 NIL-GUARD & SAFE INSTANCE ACCESS
\`\`\`lua
-- FindFirstChild (returns nil, never errors)
local char = Player.Character
local root = char and char:FindFirstChild("HumanoidRootPart")
local humanoid = char and char:FindFirstChildOfClass("Humanoid")

-- JANGAN: Player.Character.HumanoidRootPart (errors jika nil)
-- BENAR:  Player.Character and Player.Character:FindFirstChild("HumanoidRootPart")

-- WaitForChild (yields thread, use timeout!)
local root = char:WaitForChild("HumanoidRootPart", 5) -- 5s timeout
if not root then
    warn("HumanoidRootPart not found in 5 seconds!")
    return
end

-- FindFirstChildOfClass (safer than name-based lookup)
local humanoid = char:FindFirstChildOfClass("Humanoid")
local rootPart = char:FindFirstChild("HumanoidRootPart")

-- FindFirstChildWhichIsA (searches by class hierarchy)
local basePart = model:FindFirstChildWhichIsA("BasePart")

-- FindFirstDescendant (recursive search by name)
local target = workspace:FindFirstChild("TargetPart", true) -- true = recursive

-- Safe chain pattern
local function safeGet(parent, ...)
    local current = parent
    for _, name in {...} do
        if not current then return nil end
        current = current:FindFirstChild(name)
    end
    return current
end
-- Usage: safeGet(game, "ReplicatedStorage", "Remotes", "BuyItem")

-- Safe property read
local function safeProperty(instance, prop)
    local ok, value = pcall(function()
        return instance[prop]
    end)
    return ok and value or nil
end
\`\`\`

§3 CHARACTER RESPAWN HANDLING
\`\`\`lua
-- Pattern: Re-attach logic on character respawn
local Player = game.Players.LocalPlayer
local connections = {}

local function onCharacterAdded(character)
    -- Clean old connections
    for _, conn in connections do conn:Disconnect() end
    table.clear(connections)
    
    -- Wait for essentials
    local humanoid = character:WaitForChild("Humanoid", 10)
    local root = character:WaitForChild("HumanoidRootPart", 10)
    if not humanoid or not root then return end
    
    -- Re-apply modifications
    if states.godMode then
        humanoid.MaxHealth = math.huge
        humanoid.Health = math.huge
    end
    
    if states.walkSpeed then
        humanoid.WalkSpeed = states.walkSpeed
    end
    
    -- Track death for cleanup
    table.insert(connections, humanoid.Died:Connect(function()
        -- Cleanup on death
        for _, conn in connections do conn:Disconnect() end
        table.clear(connections)
    end))
end

Player.CharacterAdded:Connect(onCharacterAdded)
if Player.Character then
    task.spawn(onCharacterAdded, Player.Character)
end
\`\`\`

§4 TYPEOF CHECKS (Roblox-specific)
\`\`\`lua
-- type() vs typeof()
-- type("hello")        --> "string"
-- type(Vector3.new())  --> "userdata"    (useless!)
-- typeof(Vector3.new())--> "Vector3"     (useful!)
-- typeof(workspace)    --> "Instance"

-- Always use typeof() for Roblox types
if typeof(value) == "Instance" then
    print(value.ClassName, value.Name)
elseif typeof(value) == "Vector3" then
    print(value.X, value.Y, value.Z)
elseif typeof(value) == "CFrame" then
    print(value.Position)
elseif typeof(value) == "Color3" then
    print(value.R, value.G, value.B)
elseif typeof(value) == "EnumItem" then
    print(value.Name, value.Value)
elseif typeof(value) == "RBXScriptConnection" then
    print("Connected:", value.Connected)
end

-- Instance class checks
if instance:IsA("BasePart") then -- checks class hierarchy
    -- Works for Part, MeshPart, WedgePart, etc.
end
if instance.ClassName == "Part" then -- exact class match only
end
\`\`\`

§5 SAFE SCRIPT LIFECYCLE
\`\`\`lua
-- Pattern: Prevent duplicate execution
if getgenv().__MyScript_Loaded then
    warn("Script already loaded! Cleaning up old instance...")
    if getgenv().__MyScript_Cleanup then
        getgenv().__MyScript_Cleanup()
    end
end
getgenv().__MyScript_Loaded = true

-- Setup cleanup function
local allConnections = {}

getgenv().__MyScript_Cleanup = function()
    for _, conn in allConnections do
        if typeof(conn) == "RBXScriptConnection" and conn.Connected then
            conn:Disconnect()
        end
    end
    table.clear(allConnections)
    getgenv().__MyScript_Loaded = false
end

-- Pattern: Safe loop with built-in exit
local running = true
getgenv().__MyScript_Cleanup = function() running = false end

task.spawn(function()
    while running do
        -- safe: will stop when cleanup is called
        local ok, err = pcall(function()
            -- main logic
        end)
        if not ok then warn("[Error]:", err) end
        task.wait(0.1)
    end
end)
\`\`\`` }]
  }
]
