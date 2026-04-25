import type { KnowledgeMessage } from '../ai-knowledge'

/**
 * @file autofarm-architecture.ts
 * @description Complete auto-farm script architecture patterns:
 * target selection, combat automation, loot collection, quest tracking,
 * performance optimization, and full template.
 */

export const AUTOFARM_KNOWLEDGE: KnowledgeMessage[] = [
  {
    role: 'user',
    parts: [{ text: 'Provide complete specs for Auto-Farm Script Architecture.' }]
  },
  {
    role: 'model',
    parts: [{ text: `REFERENSI TEKNIS: AUTO-FARM ARCHITECTURE

§1 COMPLETE AUTO-FARM TEMPLATE
\`\`\`lua
-- ═══ SERVICES ═══
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local HttpService = game:GetService("HttpService")

local Player = Players.LocalPlayer

-- ═══ CONFIGURATION ═══
local Config = {
    autoFarm = false,
    autoCollect = false,
    autoEquipBest = false,
    targetMob = "All",         -- "All" or specific mob name
    farmRange = 200,           -- max distance to target
    attackDelay = 0.1,         -- delay between attacks
    teleportOffset = 3,        -- distance behind target
    antiAfk = true,
}

-- ═══ STATE ═══
local State = {
    currentTarget = nil,
    isAttacking = false,
    killCount = 0,
    startTime = tick(),
}

-- ═══ CONNECTIONS (for cleanup) ═══
local Connections = {}

-- ═══ UTILITY FUNCTIONS ═══
local function getCharacter()
    local char = Player.Character
    if not char then return nil, nil, nil end
    local root = char:FindFirstChild("HumanoidRootPart")
    local humanoid = char:FindFirstChildOfClass("Humanoid")
    return char, root, humanoid
end

local function isAlive()
    local _, _, humanoid = getCharacter()
    return humanoid and humanoid.Health > 0
end

local function getDistance(pos1, pos2)
    return (pos1 - pos2).Magnitude
end

-- ═══ TARGET SELECTION ═══
local function getMobFolder()
    -- Common mob container names in Roblox games
    return workspace:FindFirstChild("Mobs") 
        or workspace:FindFirstChild("Enemies")
        or workspace:FindFirstChild("NPCs")
        or workspace:FindFirstChild("Monsters")
end

local function isValidTarget(mob)
    if not mob or not mob.Parent then return false end
    local hum = mob:FindFirstChildOfClass("Humanoid")
    if not hum or hum.Health <= 0 then return false end
    if Config.targetMob ~= "All" and mob.Name ~= Config.targetMob then return false end
    return true
end

local function findNearestTarget()
    local _, root = getCharacter()
    if not root then return nil end
    
    local mobFolder = getMobFolder()
    if not mobFolder then return nil end
    
    local nearest, nearestDist = nil, Config.farmRange
    
    for _, mob in mobFolder:GetChildren() do
        if not isValidTarget(mob) then continue end
        
        local mobRoot = mob:FindFirstChild("HumanoidRootPart") 
            or mob:FindFirstChild("Head")
            or mob:FindFirstChildWhichIsA("BasePart")
        if not mobRoot then continue end
        
        local dist = getDistance(root.Position, mobRoot.Position)
        if dist < nearestDist then
            nearest = mob
            nearestDist = dist
        end
    end
    
    return nearest
end

local function findHighestValueTarget()
    local mobFolder = getMobFolder()
    if not mobFolder then return nil end
    
    local best, bestValue = nil, 0
    for _, mob in mobFolder:GetChildren() do
        if not isValidTarget(mob) then continue end
        -- Check for value indicators (common patterns)
        local value = mob:FindFirstChild("Value")
        local reward = value and value.Value or 0
        if reward > bestValue then
            best = mob
            bestValue = reward
        end
    end
    return best
end

-- ═══ COMBAT ═══
local function attackTarget(target)
    if not target or not target.Parent then return end
    
    -- Method 1: Fire attack remote
    local attackRemote = ReplicatedStorage:FindFirstChild("Attack")
        or ReplicatedStorage:FindFirstChild("Combat")
        or ReplicatedStorage:FindFirstChild("Damage")
    
    if attackRemote and attackRemote:IsA("RemoteEvent") then
        pcall(attackRemote.FireServer, attackRemote, target)
    end
    
    -- Method 2: Click simulation (for click-to-attack games)
    -- fireclickdetector(target:FindFirstChildOfClass("ClickDetector"))
end

local function teleportToTarget(target)
    local _, root = getCharacter()
    if not root then return end
    
    local targetRoot = target:FindFirstChild("HumanoidRootPart")
        or target:FindFirstChild("Head")
        or target:FindFirstChildWhichIsA("BasePart")
    if not targetRoot then return end
    
    -- Teleport behind target
    root.CFrame = targetRoot.CFrame * CFrame.new(0, 0, Config.teleportOffset)
end

-- ═══ LOOT COLLECTION ═══
local function collectNearbyLoot(range)
    local _, root = getCharacter()
    if not root then return end
    
    local lootFolder = workspace:FindFirstChild("Drops")
        or workspace:FindFirstChild("Loot")
        or workspace:FindFirstChild("Items")
    if not lootFolder then return end
    
    for _, item in lootFolder:GetChildren() do
        local itemPart = item:IsA("BasePart") and item or item:FindFirstChildWhichIsA("BasePart")
        if itemPart then
            local dist = getDistance(root.Position, itemPart.Position)
            if dist < (range or 50) then
                -- Touch-to-collect (teleport to item)
                root.CFrame = itemPart.CFrame
                task.wait(0.05)
            end
        end
    end
end

-- ═══ MAIN FARM LOOP ═══
local function startFarmLoop()
    Connections.farm = RunService.Heartbeat:Connect(function(dt)
        if not Config.autoFarm then return end
        if not isAlive() then return end
        
        -- Find or validate target
        if not isValidTarget(State.currentTarget) then
            State.currentTarget = findNearestTarget()
        end
        
        if not State.currentTarget then return end
        
        -- Move to target
        teleportToTarget(State.currentTarget)
        
        -- Attack
        attackTarget(State.currentTarget)
    end)
    
    -- Loot collection (separate slower loop)
    if Config.autoCollect then
        Connections.collect = task.spawn(function()
            while Config.autoCollect do
                if isAlive() then
                    pcall(collectNearbyLoot, 50)
                end
                task.wait(0.5) -- collect every 0.5s
            end
        end)
    end
end

-- ═══ ANTI-AFK ═══
local function startAntiAfk()
    if not Config.antiAfk then return end
    
    local VirtualUser = game:GetService("VirtualUser")
    Connections.antiAfk = Player.Idled:Connect(function()
        VirtualUser:CaptureController()
        VirtualUser:ClickButton2(Vector2.new())
    end)
end

-- ═══ AUTO-EQUIP BEST ═══
local function autoEquipBest()
    local backpack = Player.Backpack
    local bestTool, bestDmg = nil, 0
    
    for _, tool in backpack:GetChildren() do
        if tool:IsA("Tool") then
            local dmg = tool:FindFirstChild("Damage")
            local val = dmg and dmg.Value or 0
            if val > bestDmg then
                bestTool = tool
                bestDmg = val
            end
        end
    end
    
    if bestTool then
        local char = Player.Character
        if char then bestTool.Parent = char end
    end
end

-- ═══ CLEANUP ═══
local function cleanup()
    Config.autoFarm = false
    Config.autoCollect = false
    for key, conn in Connections do
        if typeof(conn) == "RBXScriptConnection" and conn.Connected then
            conn:Disconnect()
        end
    end
    table.clear(Connections)
end

-- ═══ INITIALIZATION ═══
if getgenv().__FarmScript then
    getgenv().__FarmScript()
end
getgenv().__FarmScript = cleanup

startFarmLoop()
startAntiAfk()
\`\`\`

§2 PERFORMANCE TIPS
\`\`\`lua
-- Throttle expensive operations
local lastScan = 0
RunService.Heartbeat:Connect(function()
    if tick() - lastScan < 0.5 then return end -- scan every 0.5s only
    lastScan = tick()
    -- expensive scan logic
end)

-- Cache instances instead of :FindFirstChild every frame
local cachedRemote = ReplicatedStorage:WaitForChild("Attack")

-- Use table.create for pre-allocation
local results = table.create(100)

-- Avoid string concatenation in loops (use table.concat)
local parts = table.create(100)
for i = 1, 100 do parts[i] = tostring(i) end
local result = table.concat(parts, ", ")
\`\`\`` }]
  }
]
