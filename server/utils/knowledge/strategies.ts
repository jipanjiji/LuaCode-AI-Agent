import type { KnowledgeMessage } from '../ai-knowledge'

/**
 * @file strategies.ts
 * @description Real-world implementation strategies: auto-farm architecture,
 * remote spy/replay, webhook integration, config persistence, multi-module scripts.
 */

export const STRATEGIES_KNOWLEDGE: KnowledgeMessage[] = [
  {
    role: 'user',
    parts: [{ text: 'Provide complete specs for Strategic Script Architecture and Packet Manipulation.' }]
  },
  {
    role: 'model',
    parts: [{ text: `REFERENSI TEKNIS: STRATEGIES & ARCHITECTURE

§1 AUTO-FARM LOOP ARCHITECTURE
\`\`\`lua
-- State-driven, interruptible auto-farm
local states = {
    autoFarm = false,
    autoCollect = false,
    targetMob = "All",
}

local farmConnection = nil

local function getNearestTarget(maxRange)
    local root = Player.Character and Player.Character:FindFirstChild("HumanoidRootPart")
    if not root then return nil end
    
    local nearest, nearestDist = nil, maxRange or math.huge
    
    for _, mob in workspace.Mobs:GetChildren() do
        if not mob:FindFirstChild("Humanoid") then continue end
        if mob.Humanoid.Health <= 0 then continue end
        if states.targetMob ~= "All" and mob.Name ~= states.targetMob then continue end
        
        local mobRoot = mob:FindFirstChild("HumanoidRootPart")
        if not mobRoot then continue end
        
        local dist = (root.Position - mobRoot.Position).Magnitude
        if dist < nearestDist then
            nearest = mob
            nearestDist = dist
        end
    end
    return nearest, nearestDist
end

local function startFarm()
    if farmConnection then return end
    
    farmConnection = RunService.Heartbeat:Connect(function(dt)
        if not states.autoFarm then return end
        
        local char = Player.Character
        local root = char and char:FindFirstChild("HumanoidRootPart")
        if not root then return end
        
        local target, dist = getNearestTarget(200)
        if not target then return end
        
        local targetRoot = target:FindFirstChild("HumanoidRootPart")
        if not targetRoot then return end
        
        -- Teleport behind target
        root.CFrame = targetRoot.CFrame * CFrame.new(0, 0, 3)
        
        -- Auto-attack (fire the game's attack remote)
        local attackRemote = game.ReplicatedStorage:FindFirstChild("Attack")
        if attackRemote then
            pcall(attackRemote.FireServer, attackRemote, target)
        end
    end)
end

local function stopFarm()
    if farmConnection then
        farmConnection:Disconnect()
        farmConnection = nil
    end
end
\`\`\`

§2 REMOTE SPY → REPLAY WORKFLOW
\`\`\`lua
-- Step 1: Log all remote traffic
local remoteLog = {}
local MAX_LOG = 500

local oldNamecall
oldNamecall = hookmetamethod(game, "__namecall", newcclosure(function(self, ...)
    local method = getnamecallmethod()
    
    if not checkcaller() and 
       (method == "FireServer" or method == "InvokeServer") and
       (self:IsA("RemoteEvent") or self:IsA("RemoteFunction")) then
        
        local entry = {
            remote = self,
            path = self:GetFullName(),
            name = self.Name,
            method = method,
            args = {...},
            timestamp = tick()
        }
        table.insert(remoteLog, entry)
        if #remoteLog > MAX_LOG then
            table.remove(remoteLog, 1)
        end
        
        -- Print to console
        print(string.format("[SPY] %s:%s(%s)", 
            self.Name, method, 
            game:GetService("HttpService"):JSONEncode({...})))
    end
    
    return oldNamecall(self, ...)
end))

-- Step 2: Replay a captured call
local function replayEntry(entry, times)
    for i = 1, (times or 1) do
        if entry.method == "FireServer" then
            entry.remote:FireServer(unpack(entry.args))
        elseif entry.method == "InvokeServer" then
            entry.remote:InvokeServer(unpack(entry.args))
        end
        task.wait(0.1)
    end
end

-- Step 3: Replay filtered entries
local function replayByName(remoteName, times)
    for _, entry in remoteLog do
        if entry.name == remoteName then
            replayEntry(entry, times)
            return
        end
    end
    warn("Remote not found in log:", remoteName)
end
\`\`\`

§3 WEBHOOK INTEGRATION (Discord)
\`\`\`lua
local HttpService = game:GetService("HttpService")

local function sendWebhook(url, content, embedTitle, embedDesc, color)
    local data = {
        content = content,
        embeds = embedTitle and {{
            title = embedTitle,
            description = embedDesc or "",
            color = color or 5814783, -- blue
            timestamp = os.date("!%Y-%m-%dT%H:%M:%SZ"),
            footer = { text = "Lua Agent • " .. game.PlaceId }
        }} or nil
    }
    
    local ok, err = pcall(function()
        -- Method 1: http.request (most executors)
        (http and http.request or request)({
            Url = url,
            Method = "POST",
            Headers = {["Content-Type"] = "application/json"},
            Body = HttpService:JSONEncode(data)
        })
    end)
    
    if not ok then
        warn("[Webhook Error]:", err)
    end
end

-- Usage
sendWebhook(WEBHOOK_URL, nil, "Item Found!", "Legendary Sword dropped!", 65280)
\`\`\`

§4 CONFIG PERSISTENCE (Save/Load Settings)
\`\`\`lua
local HttpService = game:GetService("HttpService")
local CONFIG_FOLDER = "MyHub"
local CONFIG_FILE = CONFIG_FOLDER .. "/config.json"

-- Ensure folder exists
if not isfolder(CONFIG_FOLDER) then
    makefolder(CONFIG_FOLDER)
end

local function saveConfig(settings)
    local ok, err = pcall(function()
        writefile(CONFIG_FILE, HttpService:JSONEncode(settings))
    end)
    if not ok then warn("[Save Error]:", err) end
end

local function loadConfig()
    if not isfile(CONFIG_FILE) then return nil end
    
    local ok, data = pcall(function()
        return HttpService:JSONDecode(readfile(CONFIG_FILE))
    end)
    return ok and data or nil
end

-- Usage: Auto-save on toggle change
local defaultConfig = { autoFarm = false, speed = 16, targetMob = "All" }
local config = loadConfig() or defaultConfig

-- Save whenever settings change
local function updateSetting(key, value)
    config[key] = value
    saveConfig(config)
end
\`\`\`

§5 MULTI-MODULE SCRIPT ARCHITECTURE
\`\`\`lua
-- Clean architecture for large scripts
-- main.lua (entry point)
local Modules = {
    Farm = {},
    ESP = {},
    Movement = {},
    Combat = {},
}

-- Shared state
local Config = {
    autoFarm = false,
    espEnabled = false,
    flyEnabled = false,
}

local Connections = {} -- global connection tracker

-- Module: Farm
function Modules.Farm.Start()
    Connections.farm = RunService.Heartbeat:Connect(function(dt)
        if not Config.autoFarm then return end
        -- farm logic
    end)
end

function Modules.Farm.Stop()
    if Connections.farm then
        Connections.farm:Disconnect()
        Connections.farm = nil
    end
end

-- Module: ESP
function Modules.ESP.Enable()
    Config.espEnabled = true
    for _, player in game.Players:GetPlayers() do
        if player ~= Player then
            Modules.ESP.AddHighlight(player)
        end
    end
end

function Modules.ESP.AddHighlight(player)
    -- ESP logic
end

-- Master cleanup
local function cleanup()
    for key, conn in Connections do
        if typeof(conn) == "RBXScriptConnection" then
            conn:Disconnect()
        end
    end
    table.clear(Connections)
end

-- Register cleanup
getgenv().__ScriptCleanup = cleanup
\`\`\`` }]
  }
]
